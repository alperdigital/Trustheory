/**
 * TrustTheory Bölüm 7 - Finite State Machine
 * Manages the 3-phase UI flow: SHOW → ELIMINATE → REPLICATE
 */

import { Phase } from './state.js';
import { conductGroupVoting } from './vote.js';
import { conductAllMatches } from './match.js';
import { performGroupSelection } from './select.js';
import { cleanupRound } from './cleanup.js';

/**
 * Advances to the next phase in the UI flow
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with new phase
 */
export function advancePhase(state) {
    const newState = { ...state };
    
    switch (newState.phase) {
        case Phase.SHOW:
            // Phase 1: Show scores
            newState.ui.showScores = true;
            newState.phase = Phase.ELIMINATE;
            console.log('Phase: SHOW → ELIMINATE');
            break;
            
        case Phase.ELIMINATE:
            // Phase 2: Eliminate worst groups
            newState = performGroupSelection(newState, newState.config.kEliminate);
            newState.phase = Phase.REPLICATE;
            console.log('Phase: ELIMINATE → REPLICATE');
            break;
            
        case Phase.REPLICATE:
            // Phase 3: Hide scores and prepare for next round
            newState.ui.showScores = false;
            newState = cleanupRound(newState);
            console.log('Phase: REPLICATE → SHOW (next round)');
            break;
            
        default:
            console.error('Unknown phase:', newState.phase);
            newState.phase = Phase.SHOW;
    }
    
    return newState;
}

/**
 * Executes a complete round (voting + matches + selection)
 * This is the internal technical flow that happens before UI phases
 * @param {Object} state - Current game state
 * @returns {Object} Updated state after complete round
 */
export function executeCompleteRound(state) {
    let newState = { ...state };
    
    console.log(`Starting round ${newState.round}`);
    
    // Step 1: Group voting
    newState = conductGroupVoting(newState);
    console.log('Completed group voting');
    
    // Step 2: All matches
    newState = conductAllMatches(newState);
    console.log('Completed all matches');
    
    // Step 3: Group selection (elimination + replication)
    newState = performGroupSelection(newState, newState.config.kEliminate);
    console.log('Completed group selection');
    
    // Step 4: Cleanup for next round
    newState = cleanupRound(newState);
    console.log(`Completed round ${state.round}, starting round ${newState.round}`);
    
    return newState;
}

/**
 * Starts the simulation in continuous mode
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with running flag set
 */
export function startSimulation(state) {
    const newState = { ...state };
    newState.running = true;
    console.log('Simulation started');
    return newState;
}

/**
 * Stops the simulation
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with running flag cleared
 */
export function stopSimulation(state) {
    const newState = { ...state };
    newState.running = false;
    console.log('Simulation stopped');
    return newState;
}

/**
 * Checks if the simulation should continue
 * @param {Object} state - Current game state
 * @returns {boolean} True if simulation should continue
 */
export function shouldContinue(state) {
    return state.running && state.round <= state.config.totalRounds;
}

/**
 * Gets the current phase description
 * @param {string} phase - Current phase
 * @returns {string} Human-readable phase description
 */
export function getPhaseDescription(phase) {
    switch (phase) {
        case Phase.SHOW:
            return 'Skorları Göster';
        case Phase.ELIMINATE:
            return 'En Düşük Grupları Yok Et';
        case Phase.REPLICATE:
            return 'En Yüksek Grupları Çoğalt';
        default:
            return 'Bilinmeyen Faz';
    }
}

/**
 * Gets simulation status information
 * @param {Object} state - Current game state
 * @returns {Object} Status information
 */
export function getSimulationStatus(state) {
    return {
        round: state.round,
        phase: state.phase,
        phaseDescription: getPhaseDescription(state.phase),
        running: state.running,
        showScores: state.ui.showScores,
        totalRounds: state.config.totalRounds,
        progress: Math.min(100, (state.round / state.config.totalRounds) * 100),
        canAdvance: !state.running,
        canStart: !state.running && state.round <= state.config.totalRounds,
        canStop: state.running
    };
}

/**
 * Validates the current phase state
 * @param {Object} state - Current game state
 * @returns {boolean} True if phase state is valid
 */
export function validatePhaseState(state) {
    // Check that phase is valid
    if (!Object.values(Phase).includes(state.phase)) {
        console.error('Invalid phase:', state.phase);
        return false;
    }
    
    // Check that round number is valid
    if (typeof state.round !== 'number' || state.round < 1) {
        console.error('Invalid round number:', state.round);
        return false;
    }
    
    // Check that running flag is boolean
    if (typeof state.running !== 'boolean') {
        console.error('Invalid running flag:', state.running);
        return false;
    }
    
    // Check that showScores flag is boolean
    if (typeof state.ui.showScores !== 'boolean') {
        console.error('Invalid showScores flag:', state.ui.showScores);
        return false;
    }
    
    return true;
}
