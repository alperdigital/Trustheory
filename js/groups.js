/**
 * Group Management System for Trustheory
 * Handles grouping of agents for group-majority decision making
 */

/**
 * Forms groups from a list of agents
 * @param {Array} agents - Array of agent objects
 * @param {Object} options - Grouping options
 * @param {number} options.groupSize - Size of each group (default: 3)
 * @param {boolean} options.homogeneous - Whether to group by strategy (default: true)
 * @returns {Map} Map of groupId -> group object
 */
function formGroups(agents, options = {}) {
    const { groupSize = 3, homogeneous = true } = options;
    const groups = new Map();
    let groupId = 0;

    if (homogeneous) {
        // Group by strategy name and parameters
        const byStrategy = new Map();
        
        for (const agent of agents) {
            const strategyKey = agent.strategyName || agent.strategy || 'unknown';
            if (!byStrategy.has(strategyKey)) {
                byStrategy.set(strategyKey, []);
            }
            byStrategy.get(strategyKey).push(agent);
        }

        // Create groups from same-strategy agents
        for (const [strategy, strategyAgents] of byStrategy) {
            for (let i = 0; i <= strategyAgents.length - groupSize; i += groupSize) {
                const members = strategyAgents.slice(i, i + groupSize);
                if (members.length === groupSize) {
                    const group = {
                        id: groupId,
                        members: members,
                        color: pickGroupColor(groupId),
                        strategy: strategy
                    };
                    
                    // Assign groupId to each member
                    for (const member of members) {
                        member.groupId = groupId;
                    }
                    
                    groups.set(groupId, group);
                    groupId++;
                }
            }
        }
    } else {
        // Random grouping
        const shuffled = agents.slice().sort(() => Math.random() - 0.5);
        
        for (let i = 0; i <= shuffled.length - groupSize; i += groupSize) {
            const members = shuffled.slice(i, i + groupSize);
            if (members.length === groupSize) {
                const group = {
                    id: groupId,
                    members: members,
                    color: pickGroupColor(groupId),
                    strategy: 'mixed'
                };
                
                // Assign groupId to each member
                for (const member of members) {
                    member.groupId = groupId;
                }
                
                groups.set(groupId, group);
                groupId++;
            }
        }
    }

    return groups;
}

/**
 * Picks a color for a group based on its ID
 * @param {number} groupId - The group ID
 * @returns {string} Hex color code
 */
function pickGroupColor(groupId) {
    const palette = [
        "#e76f51", "#2a9d8f", "#f4a261", "#264653", "#8ab17d",
        "#577590", "#e07a5f", "#6a4c93", "#43aa8b", "#f3722c",
        "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
        "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43"
    ];
    return palette[groupId % palette.length];
}

/**
 * Ensures population size is an odd multiple of 3
 * @param {number} n - Current population size
 * @returns {number} Adjusted population size
 */
function ensurePopulationMultipleOf3(n) {
    // Must be divisible by 3 and odd
    let adjusted = n;
    
    // Make it divisible by 3
    while (adjusted % 3 !== 0) {
        adjusted++;
    }
    
    // Make it odd
    if (adjusted % 2 === 0) {
        adjusted += 3;
    }
    
    return adjusted;
}

/**
 * Clones an agent with the same strategy and parameters
 * @param {Object} agent - Agent to clone
 * @returns {Object} Cloned agent
 */
function cloneAgent(agent) {
    const cloned = {
        strategyName: agent.strategyName,
        strategy: agent.strategy,
        coins: 0,
        groupId: null // Will be assigned when grouped
    };
    
    // Copy any additional properties
    for (const key in agent) {
        if (!cloned.hasOwnProperty(key)) {
            cloned[key] = agent[key];
        }
    }
    
    return cloned;
}

/**
 * Computes group scores based on the specified metric
 * @param {Map} groups - Map of groups
 * @param {string} metric - Scoring metric ('avg_payoff', 'agreement', 'weighted')
 * @returns {Array} Sorted array of {id, fitness} objects
 */
function computeGroupScores(groups, metric = 'avg_payoff') {
    const scores = [];
    
    for (const group of groups.values()) {
        const members = group.members || [];
        
        if (members.length === 0) continue;
        
        // Calculate average payoff
        const totalPayoff = members.reduce((sum, member) => sum + (member.coins || 0), 0);
        const avgPayoff = totalPayoff / members.length;
        
        // Calculate agreement (simplified - based on recent decisions)
        let agreement = 0;
        if (members.length > 1) {
            // For now, use a simple metric based on payoff variance
            const payoffs = members.map(m => m.coins || 0);
            const avg = payoffs.reduce((s, p) => s + p, 0) / payoffs.length;
            const variance = payoffs.reduce((s, p) => s + Math.pow(p - avg, 2), 0) / payoffs.length;
            agreement = Math.max(0, 1 - (variance / 100)); // Normalize variance
        }
        
        let fitness = avgPayoff;
        if (metric === 'agreement') {
            fitness = agreement;
        } else if (metric === 'weighted') {
            fitness = 0.7 * avgPayoff + 0.3 * agreement;
        }
        
        scores.push({
            id: group.id,
            fitness: fitness,
            avgPayoff: avgPayoff,
            agreement: agreement
        });
    }
    
    return scores.sort((a, b) => a.fitness - b.fitness);
}

/**
 * Applies group selection - removes worst group, clones best group
 * @param {Array} agents - Array of all agents
 * @param {Map} groups - Map of groups
 * @param {Object} settings - Game settings
 * @returns {Map} Updated groups map
 */
function applyGroupSelection(agents, groups, settings) {
    const scores = computeGroupScores(groups, settings.groupFitnessMetric || 'avg_payoff');
    
    if (scores.length <= 1) {
        return groups; // Can't select if only one or no groups
    }
    
    const worstGroupId = scores[0].id;
    const bestGroupId = scores[scores.length - 1].id;
    
    // Remove worst group members from agents array
    const worstGroup = groups.get(worstGroupId);
    if (worstGroup) {
        for (const member of worstGroup.members) {
            const index = agents.indexOf(member);
            if (index >= 0) {
                agents.splice(index, 1);
            }
        }
        groups.delete(worstGroupId);
    }
    
    // Clone best group
    const bestGroup = groups.get(bestGroupId);
    if (bestGroup) {
        const clones = bestGroup.members.map(member => cloneAgent(member));
        agents.push(...clones);
    }
    
    // Re-form groups with updated population
    return formGroups(agents, {
        groupSize: settings.groupSize || 3,
        homogeneous: settings.homogeneousGroups !== false
    });
}

// Debug flag for group decisions
window.__GROUP_DEBUG__ = false;

/**
 * Toggles group debug mode
 */
function toggleGroupDebug() {
    window.__GROUP_DEBUG__ = !window.__GROUP_DEBUG__;
    console.log('Group debug mode:', window.__GROUP_DEBUG__ ? 'ON' : 'OFF');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formGroups,
        pickGroupColor,
        ensurePopulationMultipleOf3,
        cloneAgent,
        computeGroupScores,
        applyGroupSelection,
        toggleGroupDebug
    };
}
