/**
 * TrustTheory Bölüm 7 - Group Voting System
 * Handles group majority voting and mistake application
 */

import { Behavior } from './state.js';

/**
 * Determines intended action based on behavior
 * @param {string} behavior - Player behavior type
 * @param {Object} config - Configuration object
 * @returns {string} Intended action ('C' or 'D')
 */
function getIntendedAction(behavior, config) {
    switch (behavior) {
        case Behavior.ALL_C:
            return 'C';
        case Behavior.ALL_D:
            return 'D';
        case Behavior.PROB_P:
            return Math.random() < config.population.PROB_P.p ? 'C' : 'D';
        default:
            console.warn('Unknown behavior:', behavior);
            return 'C';
    }
}

/**
 * Applies mistake probability to an action
 * @param {string} intendedAction - Original intended action
 * @param {number} mistakePercent - Mistake probability (0-100)
 * @returns {string} Final action after mistake application
 */
function applyMistake(intendedAction, mistakePercent) {
    if (Math.random() < mistakePercent / 100) {
        return intendedAction === 'C' ? 'D' : 'C';
    }
    return intendedAction;
}

/**
 * Determines group decision by majority vote
 * @param {string[]} votes - Array of individual votes ('C' or 'D')
 * @returns {string} Group decision ('C' or 'D')
 */
function getGroupDecision(votes) {
    const cooperators = votes.filter(vote => vote === 'C').length;
    return cooperators >= 2 ? 'C' : 'D';
}

/**
 * Conducts group voting for all groups
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with voting results
 */
export function conductGroupVoting(state) {
    const newState = { ...state };
    
    // Update each group's voting
    for (const group of newState.groups) {
        const votes = [];
        
        // Get votes from all members
        for (const memberId of group.memberIds) {
            const player = newState.players.find(p => p.id === memberId);
            if (!player) {
                console.error('Player not found:', memberId);
                continue;
            }
            
            // Determine intended action based on behavior
            player.intended = getIntendedAction(player.behavior, newState.config);
            
            // Apply mistake probability
            player.action = applyMistake(player.intended, newState.config.mistakePercent);
            
            votes.push(player.action);
        }
        
        // Determine group decision by majority
        group.decision = getGroupDecision(votes);
        
        // Update all group members to use group decision
        for (const memberId of group.memberIds) {
            const player = newState.players.find(p => p.id === memberId);
            if (player) {
                player.action = group.decision;
            }
        }
    }
    
    return newState;
}

/**
 * Gets voting statistics for debugging
 * @param {Object} state - Current game state
 * @returns {Object} Voting statistics
 */
export function getVotingStats(state) {
    const stats = {
        totalVotes: 0,
        cooperators: 0,
        defectors: 0,
        groupDecisions: {
            C: 0,
            D: 0
        },
        behaviorBreakdown: {
            ALL_C: { intended: 0, final: 0 },
            ALL_D: { intended: 0, final: 0 },
            PROB_P: { intended: 0, final: 0 }
        }
    };
    
    // Count individual votes
    for (const player of state.players) {
        stats.totalVotes++;
        if (player.action === 'C') {
            stats.cooperators++;
        } else {
            stats.defectors++;
        }
        
        // Count by behavior
        if (stats.behaviorBreakdown[player.behavior]) {
            if (player.intended === 'C') stats.behaviorBreakdown[player.behavior].intended++;
            if (player.action === 'C') stats.behaviorBreakdown[player.behavior].final++;
        }
    }
    
    // Count group decisions
    for (const group of state.groups) {
        stats.groupDecisions[group.decision]++;
    }
    
    return stats;
}

/**
 * Validates voting results
 * @param {Object} state - Current game state
 * @returns {boolean} True if voting is valid
 */
export function validateVoting(state) {
    // Check that all players have actions
    for (const player of state.players) {
        if (!player.action || (player.action !== 'C' && player.action !== 'D')) {
            console.error('Invalid player action:', player);
            return false;
        }
    }
    
    // Check that all groups have decisions
    for (const group of state.groups) {
        if (!group.decision || (group.decision !== 'C' && group.decision !== 'D')) {
            console.error('Invalid group decision:', group);
            return false;
        }
        
        // Check that all group members have the same action as group decision
        for (const memberId of group.memberIds) {
            const player = state.players.find(p => p.id === memberId);
            if (player && player.action !== group.decision) {
                console.error('Player action does not match group decision:', player, group);
                return false;
            }
        }
    }
    
    return true;
}
