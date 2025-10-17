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
    
    // Make it odd (but keep it divisible by 3)
    if (adjusted % 2 === 0) {
        adjusted += 3;
    }
    
    console.log(`ensurePopulationMultipleOf3: ${n} -> ${adjusted} (${adjusted/3} groups)`);
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
    
    // Create new logic instance
    if (agent.strategyName) {
        const LogicClass = window["Logic_" + agent.strategyName];
        if (LogicClass) {
            cloned.logic = new LogicClass();
        }
    }
    
    // Copy any additional properties
    for (const key in agent) {
        if (!cloned.hasOwnProperty(key) && key !== 'logic') {
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
    
    console.log("Computing group scores for", groups.size, "groups with metric:", metric);
    
    for (const group of groups.values()) {
        const members = group.members || [];
        
        if (members.length === 0) continue;
        
        // Calculate average payoff (use roundScore if available, otherwise total coins)
        const totalPayoff = members.reduce((sum, member) => sum + (member.roundScore !== undefined ? member.roundScore : member.coins || 0), 0);
        const avgPayoff = totalPayoff / members.length;
        
        // Calculate agreement (simplified - based on recent decisions)
        let agreement = 0;
        if (members.length > 1) {
            // For now, use a simple metric based on payoff variance
            const payoffs = members.map(m => m.roundScore !== undefined ? m.roundScore : m.coins || 0);
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
        
        console.log(`Group ${group.id}: ${members.length} members, total payoff: ${totalPayoff}, avg: ${avgPayoff.toFixed(2)}, fitness: ${fitness.toFixed(2)}`);
        
        scores.push({
            id: group.id,
            fitness: fitness,
            avgPayoff: avgPayoff,
            agreement: agreement
        });
    }
    
    const sortedScores = scores.sort((a, b) => a.fitness - b.fitness);
    console.log("Sorted scores:", sortedScores.map(s => `Group ${s.id}: ${s.fitness.toFixed(2)}`));
    
    return sortedScores;
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
    
    console.log("=== GROUP SELECTION DEBUG ===");
    console.log("Total groups:", groups.size);
    console.log("Group scores:", scores);
    
    if (scores.length <= 1) {
        console.log("Not enough groups for selection");
        return groups; // Can't select if only one or no groups
    }
    
    const worstGroupId = scores[0].id;
    const bestGroupId = scores[scores.length - 1].id;
    
    console.log("Worst group ID:", worstGroupId, "Score:", scores[0].fitness);
    console.log("Best group ID:", bestGroupId, "Score:", scores[scores.length - 1].fitness);
    
    // Create a new agents array to avoid mutating the original during iteration
    const newAgents = agents.slice();
    
    // Remove worst group members from new agents array
    const worstGroup = groups.get(worstGroupId);
    if (worstGroup) {
        console.log("Removing worst group with", worstGroup.members.length, "members");
        for (const member of worstGroup.members) {
            const index = newAgents.indexOf(member);
            if (index >= 0) {
                newAgents.splice(index, 1);
            }
        }
        groups.delete(worstGroupId);
    }
    
    // Clone best group
    const bestGroup = groups.get(bestGroupId);
    if (bestGroup) {
        console.log("Cloning best group with", bestGroup.members.length, "members");
        const clones = bestGroup.members.map(member => cloneAgent(member));
        newAgents.push(...clones);
        console.log("Added", clones.length, "clones to agents array");
    }
    
    console.log("New agents count:", newAgents.length);
    
    // Update the original agents array
    agents.length = 0;
    agents.push(...newAgents);
    
    // Re-form groups with updated population
    const newGroups = formGroups(agents, {
        groupSize: settings.groupSize || 3,
        homogeneous: settings.homogeneousGroups !== false
    });
    
    console.log("New groups count:", newGroups.size);
    console.log("=== END GROUP SELECTION ===");
    
    return newGroups;
}

// Debug flag for group decisions
window.__GROUP_DEBUG__ = true;

/**
 * Toggles group debug mode
 */
function toggleGroupDebug() {
    window.__GROUP_DEBUG__ = !window.__GROUP_DEBUG__;
    console.log('Group debug mode:', window.__GROUP_DEBUG__ ? 'ON' : 'OFF');
}

/**
 * Debug function to show current groups
 */
window.debugGroups = function() {
    console.log("=== CURRENT GROUPS ===");
    if (window.slideshow && window.slideshow.objects && window.slideshow.objects.tournament_env) {
        const tournament = window.slideshow.objects.tournament_env;
        if (tournament.groups) {
            for (const [groupId, group] of tournament.groups) {
                console.log(`Group ${groupId}:`, {
                    strategy: group.strategy,
                    members: group.members.length,
                    color: group.color,
                    memberStrategies: group.members.map(m => m.strategyName)
                });
            }
        } else {
            console.log("No groups found");
        }
    } else {
        console.log("Tournament not found");
    }
};

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
