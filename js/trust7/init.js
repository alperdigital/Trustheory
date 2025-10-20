/**
 * TrustTheory Bölüm 7 - Population Initialization
 * Creates initial population and groups based on UI settings
 */

import { makeInitialState, generateId, Behavior } from './state.js';

/**
 * Initializes population and groups from UI configuration
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with initialized population
 */
export function initPopulationFromUI(state) {
    const newState = { ...state };
    
    // Clear existing data
    newState.players = [];
    newState.groups = [];
    newState.idSeq = 1;
    
    // Create groups based on population configuration
    const groups = [];
    const players = [];
    
    // Process ALL_C groups
    for (let i = 0; i < newState.config.population.ALL_C; i++) {
        const groupId = generateId(newState);
        const group = {
            id: groupId,
            behavior: Behavior.ALL_C,
            memberIds: [],
            decision: 'C',
            roundScore: 0,
            totalScore: 0
        };
        
        // Create 3 players for this group
        for (let j = 0; j < 3; j++) {
            const playerId = generateId(newState);
            const player = {
                id: playerId,
                groupId: groupId,
                behavior: Behavior.ALL_C,
                intended: 'C',
                action: 'C',
                roundScore: 0,
                totalScore: 0
            };
            
            players.push(player);
            group.memberIds.push(playerId);
        }
        
        groups.push(group);
    }
    
    // Process ALL_D groups
    for (let i = 0; i < newState.config.population.ALL_D; i++) {
        const groupId = generateId(newState);
        const group = {
            id: groupId,
            behavior: Behavior.ALL_D,
            memberIds: [],
            decision: 'D',
            roundScore: 0,
            totalScore: 0
        };
        
        // Create 3 players for this group
        for (let j = 0; j < 3; j++) {
            const playerId = generateId(newState);
            const player = {
                id: playerId,
                groupId: groupId,
                behavior: Behavior.ALL_D,
                intended: 'D',
                action: 'D',
                roundScore: 0,
                totalScore: 0
            };
            
            players.push(player);
            group.memberIds.push(playerId);
        }
        
        groups.push(group);
    }
    
    // Process PROB_P groups
    const probPConfig = newState.config.population.PROB_P;
    for (let i = 0; i < probPConfig.count; i++) {
        const groupId = generateId(newState);
        const group = {
            id: groupId,
            behavior: Behavior.PROB_P,
            memberIds: [],
            decision: 'C', // Will be determined by voting
            roundScore: 0,
            totalScore: 0
        };
        
        // Create 3 players for this group
        for (let j = 0; j < 3; j++) {
            const playerId = generateId(newState);
            const player = {
                id: playerId,
                groupId: groupId,
                behavior: Behavior.PROB_P,
                intended: Math.random() < probPConfig.p ? 'C' : 'D',
                action: 'C', // Will be determined by voting and mistake
                roundScore: 0,
                totalScore: 0
            };
            
            players.push(player);
            group.memberIds.push(playerId);
        }
        
        groups.push(group);
    }
    
    // Validate we have exactly 10 groups and 30 players
    if (groups.length !== 10) {
        console.error(`Expected 10 groups, got ${groups.length}`);
    }
    if (players.length !== 30) {
        console.error(`Expected 30 players, got ${players.length}`);
    }
    
    newState.players = players;
    newState.groups = groups;
    
    return newState;
}

/**
 * Validates population configuration
 * @param {Object} config - Population configuration
 * @returns {Object} Validation result with isValid and message
 */
export function validatePopulationConfig(config) {
    const totalGroups = config.ALL_C + config.ALL_D + config.PROB_P.count;
    
    if (totalGroups !== 10) {
        return {
            isValid: false,
            message: `Toplam grup sayısı 10 olmalı, şu anda ${totalGroups}`
        };
    }
    
    if (config.PROB_P.p < 0 || config.PROB_P.p > 1) {
        return {
            isValid: false,
            message: 'PROB_P olasılığı 0 ile 1 arasında olmalı'
        };
    }
    
    return {
        isValid: true,
        message: 'Nüfus konfigürasyonu geçerli'
    };
}

/**
 * Updates population configuration in state
 * @param {Object} state - Current game state
 * @param {Object} newConfig - New population configuration
 * @returns {Object} Updated state
 */
export function updatePopulationConfig(state, newConfig) {
    const validation = validatePopulationConfig(newConfig);
    if (!validation.isValid) {
        console.warn('Invalid population config:', validation.message);
        return state;
    }
    
    const newState = { ...state };
    newState.config.population = { ...newConfig };
    
    // Reinitialize population with new config
    return initPopulationFromUI(newState);
}

/**
 * Resets state to initial configuration
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Fresh initial state
 */
export function resetToInitial(overrides = {}) {
    const initialState = makeInitialState(overrides);
    return initPopulationFromUI(initialState);
}
