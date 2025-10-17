/**
 * TrustTheory Bölüm 7 - Logging and Debug System
 * Provides debugging utilities and logging functions
 */

/**
 * Creates a logging system for the simulation
 * @param {Object} state - Current game state
 * @returns {Object} Logger object
 */
export function createLogger(state) {
    const logger = {
        state,
        logs: [],
        maxLogs: 100
    };
    
    return logger;
}

/**
 * Logs a message with timestamp
 * @param {Object} logger - Logger object
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} data - Optional data to log
 */
export function log(logger, level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };
    
    logger.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (logger.logs.length > logger.maxLogs) {
        logger.logs.shift();
    }
    
    // Also log to console
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warn' ? 'warn' : 
                         level === 'debug' ? 'debug' : 'log';
    
    console[consoleMethod](`[Trust7 ${level.toUpperCase()}] ${message}`, data || '');
}

/**
 * Logs simulation state for debugging
 * @param {Object} logger - Logger object
 * @param {string} phase - Current phase
 */
export function logState(logger, phase) {
    const state = logger.state;
    
    log(logger, 'debug', `State at ${phase}`, {
        round: state.round,
        phase: state.phase,
        running: state.running,
        showScores: state.ui.showScores,
        playerCount: state.players.length,
        groupCount: state.groups.length,
        totalScores: {
            players: state.players.reduce((sum, p) => sum + p.totalScore, 0),
            groups: state.groups.reduce((sum, g) => sum + g.totalScore, 0)
        }
    });
}

/**
 * Logs voting results
 * @param {Object} logger - Logger object
 * @param {Object} votingStats - Voting statistics
 */
export function logVoting(logger, votingStats) {
    log(logger, 'info', 'Voting completed', {
        totalVotes: votingStats.totalVotes,
        cooperators: votingStats.cooperators,
        defectors: votingStats.defectors,
        groupDecisions: votingStats.groupDecisions,
        behaviorBreakdown: votingStats.behaviorBreakdown
    });
}

/**
 * Logs match results
 * @param {Object} logger - Logger object
 * @param {Object} matchStats - Match statistics
 */
export function logMatches(logger, matchStats) {
    log(logger, 'info', 'Matches completed', {
        totalMatches: matchStats.totalMatches,
        totalRoundScore: matchStats.totalRoundScore,
        actionDistribution: matchStats.actionDistribution,
        groupScores: matchStats.groupScores
    });
}

/**
 * Logs group selection results
 * @param {Object} logger - Logger object
 * @param {Object} selectionStats - Selection statistics
 */
export function logSelection(logger, selectionStats) {
    log(logger, 'info', 'Group selection completed', {
        k: selectionStats.k,
        worstGroups: selectionStats.worstGroups,
        bestGroups: selectionStats.bestGroups,
        scoreRange: selectionStats.scoreRange
    });
}

/**
 * Logs cleanup results
 * @param {Object} logger - Logger object
 * @param {Object} cleanupStats - Cleanup statistics
 */
export function logCleanup(logger, cleanupStats) {
    log(logger, 'debug', 'Cleanup completed', {
        round: cleanupStats.round,
        phase: cleanupStats.phase,
        showScores: cleanupStats.showScores,
        totalRoundScores: cleanupStats.totalRoundScores,
        totalTotalScores: cleanupStats.totalTotalScores
    });
}

/**
 * Gets recent logs
 * @param {Object} logger - Logger object
 * @param {number} count - Number of recent logs to return
 * @returns {Object[]} Array of recent log entries
 */
export function getRecentLogs(logger, count = 10) {
    return logger.logs.slice(-count);
}

/**
 * Gets logs by level
 * @param {Object} logger - Logger object
 * @param {string} level - Log level to filter by
 * @returns {Object[]} Array of filtered log entries
 */
export function getLogsByLevel(logger, level) {
    return logger.logs.filter(log => log.level === level);
}

/**
 * Clears all logs
 * @param {Object} logger - Logger object
 */
export function clearLogs(logger) {
    logger.logs = [];
}

/**
 * Exports logs to JSON
 * @param {Object} logger - Logger object
 * @returns {string} JSON string of all logs
 */
export function exportLogs(logger) {
    return JSON.stringify(logger.logs, null, 2);
}

/**
 * Creates a summary of the current simulation state
 * @param {Object} state - Current game state
 * @returns {Object} Summary object
 */
export function createSummary(state) {
    const summary = {
        round: state.round,
        phase: state.phase,
        running: state.running,
        showScores: state.ui.showScores,
        population: {
            totalPlayers: state.players.length,
            totalGroups: state.groups.length,
            behaviorDistribution: {}
        },
        scores: {
            totalPlayerScore: 0,
            totalGroupScore: 0,
            averagePlayerScore: 0,
            averageGroupScore: 0
        },
        configuration: {
            payoffs: {
                T: state.config.T,
                R: state.config.R,
                P: state.config.P,
                S: state.config.S
            },
            rules: {
                kEliminate: state.config.kEliminate,
                totalRounds: state.config.totalRounds,
                mistakePercent: state.config.mistakePercent
            }
        }
    };
    
    // Calculate behavior distribution
    for (const group of state.groups) {
        if (!summary.population.behaviorDistribution[group.behavior]) {
            summary.population.behaviorDistribution[group.behavior] = 0;
        }
        summary.population.behaviorDistribution[group.behavior]++;
    }
    
    // Calculate scores
    for (const player of state.players) {
        summary.scores.totalPlayerScore += player.totalScore;
    }
    
    for (const group of state.groups) {
        summary.scores.totalGroupScore += group.totalScore;
    }
    
    summary.scores.averagePlayerScore = summary.scores.totalPlayerScore / state.players.length;
    summary.scores.averageGroupScore = summary.scores.totalGroupScore / state.groups.length;
    
    return summary;
}

/**
 * Validates the entire simulation state
 * @param {Object} state - Current game state
 * @returns {Object} Validation result
 */
export function validateSimulation(state) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // Check basic structure
    if (!state.players || !Array.isArray(state.players)) {
        validation.isValid = false;
        validation.errors.push('Players array is missing or invalid');
    }
    
    if (!state.groups || !Array.isArray(state.groups)) {
        validation.isValid = false;
        validation.errors.push('Groups array is missing or invalid');
    }
    
    // Check counts
    if (state.players.length !== 30) {
        validation.isValid = false;
        validation.errors.push(`Expected 30 players, got ${state.players.length}`);
    }
    
    if (state.groups.length !== 10) {
        validation.isValid = false;
        validation.errors.push(`Expected 10 groups, got ${state.groups.length}`);
    }
    
    // Check that all players belong to groups
    const groupIds = new Set(state.groups.map(g => g.id));
    for (const player of state.players) {
        if (!groupIds.has(player.groupId)) {
            validation.isValid = false;
            validation.errors.push(`Player ${player.id} belongs to non-existent group ${player.groupId}`);
        }
    }
    
    // Check that all groups have exactly 3 members
    for (const group of state.groups) {
        if (group.memberIds.length !== 3) {
            validation.isValid = false;
            validation.errors.push(`Group ${group.id} has ${group.memberIds.length} members, expected 3`);
        }
    }
    
    // Check configuration
    if (state.config.kEliminate < 1 || state.config.kEliminate > 5) {
        validation.warnings.push(`kEliminate value ${state.config.kEliminate} is outside recommended range (1-5)`);
    }
    
    if (state.config.mistakePercent < 0 || state.config.mistakePercent > 100) {
        validation.isValid = false;
        validation.errors.push(`Mistake percent ${state.config.mistakePercent} is invalid (must be 0-100)`);
    }
    
    return validation;
}

/**
 * Creates debug hooks for the simulation
 * @param {Object} state - Current game state
 * @returns {Object} Debug hooks object
 */
export function createDebugHooks(state) {
    const hooks = {
        state,
        logger: createLogger(state)
    };
    
    // Add to window for console access
    window.__trust7 = {
        dump: () => JSON.parse(JSON.stringify(state)),
        logs: () => hooks.logger.logs,
        summary: () => createSummary(state),
        validate: () => validateSimulation(state),
        clearLogs: () => clearLogs(hooks.logger)
    };
    
    return hooks;
}
