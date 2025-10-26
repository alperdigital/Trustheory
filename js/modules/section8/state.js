// Section 8 state & defaults (isolated)

window.mod8_defaults = {
    payoffs: { T:5, R:3, P:1, S:0 },
    distribution: {
        COOPERATOR: 2,
        RANDOM: 2,
        TIT_FOR_TAT: 1,
        GRUDGER: 1,
        DEFECTOR: 1,
        PAVLOV: 1,
        PROB_COOP: 1
    }
};

window.mod8_initState = function(){
    var groups = [];
    function add(strategy, count){ for(var i=0;i<count;i++){ groups.push(mod8_makeGroup(strategy)); } }
    var d = mod8_defaults.distribution;
    add("COOPERATOR", d.COOPERATOR);
    add("RANDOM", d.RANDOM);
    add("TIT_FOR_TAT", d.TIT_FOR_TAT);
    add("GRUDGER", d.GRUDGER);
    add("DEFECTOR", d.DEFECTOR);
    add("PAVLOV", d.PAVLOV);
    add("PROB_COOP", d.PROB_COOP);
    window.mod8_state = {
        round: 0,
        groups: groups.slice(0,10),
        payoffs: Object.assign({}, mod8_defaults.payoffs),
        seed: 12345
    };
};

function mod8_makeMember(strategy){ return { strategy: strategy, coins:0, lastAction:null, memory:[] }; }
function mod8_makeGroup(strategy){ return { strategy: strategy, members:[mod8_makeMember(strategy), mod8_makeMember(strategy), mod8_makeMember(strategy)], score:0, decision:null }; }


