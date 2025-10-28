// Section 8 state & defaults (isolated)

window.mod8_defaults = {
    payoffs: { T:5, R:3, P:1, S:0 },
    noise: 0,
    turns: 10,
    decisionMode: 'group', // 'group' | 'individual'
    includeIntraGroup: true,
    resetMemoryEachRound: false,
    seed: 123456789,
    cloneWithEmptyMemory: false,
    distribution: {
        COOPERATOR: 2,
        RANDOM: 2,
        TIT_FOR_TAT: 1,
        TIT_FOR_TWO_TATS: 1,
        GRUDGER: 1,
        DEFECTOR: 1,
        PAVLOV: 1,
        PROBER: 1
    }
};

window.mod8_initState = function(){
    var groups = [];
    function add(strategy, count){ for(var i=0;i<count;i++){ groups.push(mod8_makeGroup(strategy)); } }
    var d = mod8_defaults.distribution;
    add("COOPERATOR", d.COOPERATOR);
    add("RANDOM", d.RANDOM);
    add("TIT_FOR_TAT", d.TIT_FOR_TAT);
    add("TIT_FOR_TWO_TATS", d.TIT_FOR_TWO_TATS);
    add("GRUDGER", d.GRUDGER);
    add("DEFECTOR", d.DEFECTOR);
    add("PAVLOV", d.PAVLOV);
    add("PROBER", d.PROBER);
    window.mod8_state = {
        round: 0,
        groups: groups.slice(0,10),
        payoffs: Object.assign({}, mod8_defaults.payoffs),
        noise: mod8_defaults.noise,
        turns: mod8_defaults.turns,
        decisionMode: mod8_defaults.decisionMode,
        includeIntraGroup: mod8_defaults.includeIntraGroup,
        resetMemoryEachRound: mod8_defaults.resetMemoryEachRound,
        seed: mod8_defaults.seed,
        generation: 0,
        phase: 0
    };
};

function mod8_makeMember(strategy){ return { strategy: strategy, coins:0, lastAction:null, memory:[] }; }
function mod8_makeGroup(strategy){ return { strategy: strategy, members:[mod8_makeMember(strategy), mod8_makeMember(strategy), mod8_makeMember(strategy)], score:0, decision:null, memoryByOpponent:{}, memberMemoryByOpponent:{} }; }


