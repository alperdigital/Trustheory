/**
 * TrustTheory Bölüm 7 - Round Cleanup System
 * Handles end-of-round cleanup and preparation for next round
 */

import { Phase } from './state.js';

/**
 * Resets round scores and prepares for next round
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with cleaned up data
 */
export function cleanupRound(state) {
    const newState = { ...state };
    
    // Reset round scores for all players
    for (const player of newState.players) {
        player.roundScore = 0;
        // Keep totalScore unchanged
    }
    
    // Reset round scores for all groups
    for (const group of newState.groups) {
        group.roundScore = 0;
        // Keep totalScore unchanged
    }
    
    // Reset group decisions
    for (const group of newState.groups) {
        group.decision = 'C'; // Default, will be determined by voting
    }
    
    // Reset player actions
    for (const player of newState.players) {
        player.action = 'C'; // Default, will be determined by voting
    }
    
    // Increment round number
    newState.round++;
    
    // Reset phase to SHOW for next round
    newState.phase = Phase.SHOW;
    
    // Hide scores for next round
    newState.ui.showScores = false;
    
    return newState;
}

/**
 * Prepares state for a new round (voting + matches)
 * @param {Object} state - Current game state
 * @returns {Object} Updated state ready for new round
 */
export function prepareNewRound(state) {
    const newState = { ...state };
    
    // Reset round-specific data
    for (const player of newState.players) {
        player.roundScore = 0;
        player.intended = 'C'; // Will be set by voting
        player.action = 'C';   // Will be set by voting
    }
    
    for (const group of newState.groups) {
        group.roundScore = 0;
        group.decision = 'C'; // Will be set by voting
    }
    
    return newState;
}

/**
 * Gets cleanup statistics for debugging
 * @param {Object} state - Current game state
 * @returns {Object} Cleanup statistics
 */
export function getCleanupStats(state) {
    const stats = {
        round: state.round,
        phase: state.phase,
        showScores: state.ui.showScores,
        totalRoundScores: {
            players: 0,
            groups: 0
        },
        totalTotalScores: {
            players: 0,
            groups: 0
        }
    };
    
    // Calculate total scores
    for (const player of state.players) {
        stats.totalRoundScores.players += player.roundScore;
        stats.totalTotalScores.players += player.totalScore;
    }
    
    for (const group of state.groups) {
        stats.totalRoundScores.groups += group.roundScore;
        stats.totalTotalScores.groups += group.totalScore;
    }
    
    return stats;
}

/**
 * Validates cleanup results
 * @param {Object} state - Current game state
 * @returns {boolean} True if cleanup is valid
 */
export function validateCleanup(state) {
    // Check that all round scores are reset to 0
    for (const player of state.players) {
        if (player.roundScore !== 0) {
            console.error('Player round score not reset:', player);
            return false;
        }
    }
    
    for (const group of state.groups) {
        if (group.roundScore !== 0) {
            console.error('Group round score not reset:', group);
            return false;
        }
    }
    
    // Check that total scores are preserved
    for (const player of state.players) {
        if (typeof player.totalScore !== 'number' || player.totalScore < 0) {
            console.error('Invalid player total score:', player);
            return false;
        }
    }
    
    for (const group of state.groups) {
        if (typeof group.totalScore !== 'number' || group.totalScore < 0) {
            console.error('Invalid group total score:', group);
            return false;
        }
    }
    
    // Check that round number is valid
    if (typeof state.round !== 'number' || state.round < 1) {
        console.error('Invalid round number:', state.round);
        return false;
    }
    
    // Check that phase is reset to SHOW
    if (state.phase !== Phase.SHOW) {
        console.error('Phase not reset to SHOW:', state.phase);
        return false;
    }
    
    return true;
}

/**
 * Resets the entire simulation to initial state
 * @param {Object} state - Current game state
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Fresh initial state
 */
export function resetSimulation(state, overrides = {}) {
    // This would typically call the initialization functions
    // For now, we'll return a basic reset
    const newState = { ...state };
    
    // Reset round and phase
    newState.round = 1;
    newState.phase = Phase.SHOW;
    newState.running = false;
    newState.ui.showScores = false;
    
    // Reset all scores
    for (const player of newState.players) {
        player.roundScore = 0;
        player.totalScore = 0;
        player.intended = 'C';
        player.action = 'C';
    }
    
    for (const group of newState.groups) {
        group.roundScore = 0;
        group.totalScore = 0;
        group.decision = 'C';
    }
    
    return newState;
}
