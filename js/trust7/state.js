/**
 * TrustTheory Bölüm 7 - State Management
 * Defines the game state, types, and configuration
 */

export const Phase = { 
    SHOW: 'SHOW', 
    ELIMINATE: 'ELIMINATE', 
    REPLICATE: 'REPLICATE' 
};

export const Behavior = { 
    ALL_C: 'ALL_C', 
    ALL_D: 'ALL_D', 
    PROB_P: 'PROB_P' 
};

/**
 * Creates initial game state with default configuration
 * @param {Object} overrides - Configuration overrides
 * @returns {Object} Initial game state
 */
export function makeInitialState(overrides = {}) {
    return {
        round: 1,
        phase: Phase.SHOW,        // UI adımı
        running: false,
        players: [],              // 30
        groups: [],               // 10
        idSeq: 1,                 // benzersiz id üretimi
        config: {
            // Ödüller
            T: 5, R: 3, P: 1, S: 0,
            // Kurallar
            kEliminate: 1,          // her tur kaç grup elenecek/çoğalacak
            totalRounds: 50,        // BAŞLA modunda kaç tur
            mistakePercent: 0,      // 0..100
            // Nüfus (kaç grup?)
            population: {           // Nüfus panelinden güncellenecek
                ALL_C: 3,
                ALL_D: 3,
                PROB_P: { count: 4, p: 0.6 }
            },
            stepIntervalMs: 350,    // BAŞLA hız
            ...overrides
        },
        ui: {
            showScores: false       // Adım 1'de true, Adım 3'te false
        }
    };
}

/**
 * Player object structure
 * @typedef {Object} Player
 * @property {number} id - Unique player ID
 * @property {number} groupId - ID of the group this player belongs to
 * @property {string} behavior - Behavior type (ALL_C, ALL_D, PROB_P)
 * @property {string} intended - Intended action based on behavior ('C'|'D')
 * @property {string} action - Final action after mistake flip ('C'|'D')
 * @property {number} roundScore - Score for current round
 * @property {number} totalScore - Cumulative total score
 */

/**
 * Group object structure
 * @typedef {Object} Group
 * @property {number} id - Unique group ID
 * @property {string} behavior - Behavior type of this group
 * @property {string[]} memberIds - Array of player IDs in this group
 * @property {string} decision - Group's decision for current round ('C'|'D')
 * @property {number} roundScore - Group's score for current round
 * @property {number} totalScore - Group's cumulative total score
 */

/**
 * Generates a unique ID
 * @param {Object} state - Current game state
 * @returns {number} Unique ID
 */
export function generateId(state) {
    return state.idSeq++;
}

/**
 * Validates that the state has correct structure
 * @param {Object} state - Game state to validate
 * @returns {boolean} True if valid
 */
export function validateState(state) {
    // Check basic structure
    if (!state.players || !state.groups) return false;
    
    // Check player count
    if (state.players.length !== 30) return false;
    
    // Check group count
    if (state.groups.length !== 10) return false;
    
    // Check that all players belong to groups
    const totalMembers = state.groups.reduce((sum, group) => sum + group.memberIds.length, 0);
    if (totalMembers !== 30) return false;
    
    // Check that all players have valid group IDs
    const groupIds = new Set(state.groups.map(g => g.id));
    for (const player of state.players) {
        if (!groupIds.has(player.groupId)) return false;
    }
    
    return true;
}

/**
 * Creates a deep copy of the state for immutable updates
 * @param {Object} state - State to copy
 * @returns {Object} Deep copy of state
 */
export function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
}
