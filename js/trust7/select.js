/**
 * TrustTheory Bölüm 7 - Group Selection System
 * Handles elimination of worst groups and replication of best groups
 */

import { generateId, Behavior } from './state.js';

/**
 * Sorts groups by score with deterministic tie-breaking
 * @param {Object[]} groups - Array of groups to sort
 * @param {boolean} ascending - True for ascending order (worst first), false for descending (best first)
 * @returns {Object[]} Sorted groups array
 */
function sortGroupsByScore(groups, ascending = true) {
    return [...groups].sort((a, b) => {
        // Primary sort by total score
        if (a.totalScore !== b.totalScore) {
            return ascending ? a.totalScore - b.totalScore : b.totalScore - a.totalScore;
        }
        
        // Tie-breaking: ascending uses smallest groupId, descending uses largest groupId
        return ascending ? a.id - b.id : b.id - a.id;
    });
}

/**
 * Eliminates the worst k groups
 * @param {Object} state - Current game state
 * @param {number} k - Number of groups to eliminate
 * @returns {Object} Updated state with eliminated groups removed
 */
export function eliminateWorstGroups(state, k) {
    const newState = { ...state };
    
    // Sort groups by score (worst first)
    const sortedGroups = sortGroupsByScore(newState.groups, true);
    
    // Get the k worst groups
    const groupsToEliminate = sortedGroups.slice(0, k);
    const eliminatedIds = new Set(groupsToEliminate.map(g => g.id));
    
    // Remove eliminated groups
    newState.groups = newState.groups.filter(group => !eliminatedIds.has(group.id));
    
    // Remove players from eliminated groups
    newState.players = newState.players.filter(player => !eliminatedIds.has(player.groupId));
    
    console.log(`Eliminated ${groupsToEliminate.length} groups:`, groupsToEliminate.map(g => ({
        id: g.id,
        behavior: g.behavior,
        totalScore: g.totalScore
    })));
    
    return newState;
}

/**
 * Replicates the best k groups to replace eliminated ones
 * @param {Object} state - Current game state
 * @param {number} k - Number of groups to replicate
 * @returns {Object} Updated state with replicated groups added
 */
export function replicateBestGroups(state, k) {
    const newState = { ...state };
    
    // Sort groups by score (best first)
    const sortedGroups = sortGroupsByScore(newState.groups, false);
    
    // Get the k best groups
    const groupsToReplicate = sortedGroups.slice(0, k);
    
    // Replicate each group
    for (const originalGroup of groupsToReplicate) {
        const newGroupId = generateId(newState);
        const newGroup = {
            id: newGroupId,
            behavior: originalGroup.behavior,
            memberIds: [],
            decision: originalGroup.decision,
            roundScore: 0,
            totalScore: 0
        };
        
        // Create 3 new players for this group
        for (let i = 0; i < 3; i++) {
            const newPlayerId = generateId(newState);
            const newPlayer = {
                id: newPlayerId,
                groupId: newGroupId,
                behavior: originalGroup.behavior,
                intended: originalGroup.behavior === Behavior.ALL_C ? 'C' : 
                         originalGroup.behavior === Behavior.ALL_D ? 'D' : 'C',
                action: originalGroup.decision,
                roundScore: 0,
                totalScore: 0
            };
            
            newState.players.push(newPlayer);
            newGroup.memberIds.push(newPlayerId);
        }
        
        newState.groups.push(newGroup);
    }
    
    console.log(`Replicated ${groupsToReplicate.length} groups:`, groupsToReplicate.map(g => ({
        id: g.id,
        behavior: g.behavior,
        totalScore: g.totalScore
    })));
    
    return newState;
}

/**
 * Performs complete group selection (elimination + replication)
 * @param {Object} state - Current game state
 * @param {number} k - Number of groups to eliminate and replicate
 * @returns {Object} Updated state after selection
 */
export function performGroupSelection(state, k) {
    let newState = { ...state };
    
    // First eliminate worst k groups
    newState = eliminateWorstGroups(newState, k);
    
    // Then replicate best k groups
    newState = replicateBestGroups(newState, k);
    
    return newState;
}

/**
 * Gets selection statistics for debugging
 * @param {Object} state - Current game state
 * @param {number} k - Number of groups to select
 * @returns {Object} Selection statistics
 */
export function getSelectionStats(state, k) {
    const sortedGroups = sortGroupsByScore(state.groups, true);
    
    const worstGroups = sortedGroups.slice(0, k);
    const bestGroups = sortedGroups.slice(-k);
    
    return {
        totalGroups: state.groups.length,
        k: k,
        worstGroups: worstGroups.map(g => ({
            id: g.id,
            behavior: g.behavior,
            totalScore: g.totalScore
        })),
        bestGroups: bestGroups.map(g => ({
            id: g.id,
            behavior: g.behavior,
            totalScore: g.totalScore
        })),
        scoreRange: {
            min: Math.min(...state.groups.map(g => g.totalScore)),
            max: Math.max(...state.groups.map(g => g.totalScore)),
            avg: state.groups.reduce((sum, g) => sum + g.totalScore, 0) / state.groups.length
        }
    };
}

/**
 * Validates group selection results
 * @param {Object} state - Current game state
 * @returns {boolean} True if selection is valid
 */
export function validateSelection(state) {
    // Check that we still have exactly 10 groups
    if (state.groups.length !== 10) {
        console.error(`Expected 10 groups after selection, got ${state.groups.length}`);
        return false;
    }
    
    // Check that we still have exactly 30 players
    if (state.players.length !== 30) {
        console.error(`Expected 30 players after selection, got ${state.players.length}`);
        return false;
    }
    
    // Check that all players belong to existing groups
    const groupIds = new Set(state.groups.map(g => g.id));
    for (const player of state.players) {
        if (!groupIds.has(player.groupId)) {
            console.error('Player belongs to non-existent group:', player);
            return false;
        }
    }
    
    // Check that all groups have exactly 3 members
    for (const group of state.groups) {
        if (group.memberIds.length !== 3) {
            console.error(`Group ${group.id} has ${group.memberIds.length} members, expected 3`);
            return false;
        }
    }
    
    // Check that all group members exist
    const playerIds = new Set(state.players.map(p => p.id));
    for (const group of state.groups) {
        for (const memberId of group.memberIds) {
            if (!playerIds.has(memberId)) {
                console.error(`Group ${group.id} references non-existent player ${memberId}`);
                return false;
            }
        }
    }
    
    return true;
}
