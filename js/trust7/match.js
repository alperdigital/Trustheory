/**
 * TrustTheory Bölüm 7 - Round-Robin Match System
 * Handles all player vs player matches and score calculation
 */

/**
 * Calculates payoff based on Prisoner's Dilemma matrix
 * @param {string} action1 - First player's action ('C' or 'D')
 * @param {string} action2 - Second player's action ('C' or 'D')
 * @param {Object} config - Game configuration with T, R, P, S values
 * @returns {Object} Payoffs for both players {player1: number, player2: number}
 */
function calculatePayoff(action1, action2, config) {
    const { T, R, P, S } = config;
    
    if (action1 === 'C' && action2 === 'C') {
        return { player1: R, player2: R };
    } else if (action1 === 'D' && action2 === 'D') {
        return { player1: P, player2: P };
    } else if (action1 === 'D' && action2 === 'C') {
        return { player1: T, player2: S };
    } else if (action1 === 'C' && action2 === 'D') {
        return { player1: S, player2: T };
    } else {
        console.error('Invalid actions:', action1, action2);
        return { player1: 0, player2: 0 };
    }
}

/**
 * Conducts all round-robin matches between players
 * @param {Object} state - Current game state
 * @returns {Object} Updated state with match results
 */
export function conductAllMatches(state) {
    const newState = { ...state };
    
    // Reset round scores
    for (const player of newState.players) {
        player.roundScore = 0;
    }
    
    // Conduct all C(30,2) = 435 matches
    let matchCount = 0;
    for (let i = 0; i < newState.players.length; i++) {
        for (let j = i + 1; j < newState.players.length; j++) {
            const player1 = newState.players[i];
            const player2 = newState.players[j];
            
            // Calculate payoff for this match
            const payoff = calculatePayoff(player1.action, player2.action, newState.config);
            
            // Add to round scores
            player1.roundScore += payoff.player1;
            player2.roundScore += payoff.player2;
            
            matchCount++;
        }
    }
    
    // Update total scores
    for (const player of newState.players) {
        player.totalScore += player.roundScore;
    }
    
    // Calculate group scores
    for (const group of newState.groups) {
        group.roundScore = 0;
        for (const memberId of group.memberIds) {
            const player = newState.players.find(p => p.id === memberId);
            if (player) {
                group.roundScore += player.roundScore;
            }
        }
        group.totalScore += group.roundScore;
    }
    
    console.log(`Conducted ${matchCount} matches (expected: 435)`);
    
    return newState;
}

/**
 * Gets match statistics for debugging
 * @param {Object} state - Current game state
 * @returns {Object} Match statistics
 */
export function getMatchStats(state) {
    const stats = {
        totalMatches: 0,
        totalRoundScore: 0,
        totalTotalScore: 0,
        groupScores: [],
        actionDistribution: {
            CC: 0,
            CD: 0,
            DC: 0,
            DD: 0
        }
    };
    
    // Count matches and action combinations
    for (let i = 0; i < state.players.length; i++) {
        for (let j = i + 1; j < state.players.length; j++) {
            const player1 = state.players[i];
            const player2 = state.players[j];
            
            stats.totalMatches++;
            
            // Count action combinations
            const combo = player1.action + player2.action;
            if (stats.actionDistribution[combo] !== undefined) {
                stats.actionDistribution[combo]++;
            }
        }
    }
    
    // Calculate total scores
    for (const player of state.players) {
        stats.totalRoundScore += player.roundScore;
        stats.totalTotalScore += player.totalScore;
    }
    
    // Get group scores
    for (const group of state.groups) {
        stats.groupScores.push({
            id: group.id,
            behavior: group.behavior,
            roundScore: group.roundScore,
            totalScore: group.totalScore
        });
    }
    
    return stats;
}

/**
 * Validates match results
 * @param {Object} state - Current game state
 * @returns {boolean} True if matches are valid
 */
export function validateMatches(state) {
    // Check that all players have round scores
    for (const player of state.players) {
        if (typeof player.roundScore !== 'number' || player.roundScore < 0) {
            console.error('Invalid player round score:', player);
            return false;
        }
        if (typeof player.totalScore !== 'number' || player.totalScore < 0) {
            console.error('Invalid player total score:', player);
            return false;
        }
    }
    
    // Check that all groups have round scores
    for (const group of state.groups) {
        if (typeof group.roundScore !== 'number' || group.roundScore < 0) {
            console.error('Invalid group round score:', group);
            return false;
        }
        if (typeof group.totalScore !== 'number' || group.totalScore < 0) {
            console.error('Invalid group total score:', group);
            return false;
        }
        
        // Verify group score matches sum of member scores
        let memberSum = 0;
        for (const memberId of group.memberIds) {
            const player = state.players.find(p => p.id === memberId);
            if (player) {
                memberSum += player.roundScore;
            }
        }
        
        if (Math.abs(group.roundScore - memberSum) > 0.001) {
            console.error('Group score mismatch:', group, memberSum);
            return false;
        }
    }
    
    return true;
}

/**
 * Gets the expected number of matches for n players
 * @param {number} n - Number of players
 * @returns {number} Expected number of matches (C(n,2))
 */
export function getExpectedMatchCount(n) {
    return (n * (n - 1)) / 2;
}
