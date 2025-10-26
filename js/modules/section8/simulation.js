// One full round orchestrator (pure over state)
window.mod8_runOneFullRound = function(state){
    var groups = state.groups.map(function(g){
        return { strategy:g.strategy, score:0, decision:null, members:g.members.map(function(m){ return { strategy:m.strategy, coins:0, lastAction:null, memory:[] }; }) };
    });

    // Phase 1: Group voting (majority of three using their strategy play against a dummy previous memory)
    for(var gi=0; gi<groups.length; gi++){
        var g = groups[gi];
        var votes = g.members.map(function(m){ var fn = mod8_strategies[g.strategy]; return fn? fn(m) : 'C'; });
        var coop = votes.filter(function(v){return v==='C'}).length;
        g.decision = (coop>=2)? 'C':'D';
    }

    // Phase 1b: Everyone plays everyone using group decisions
    for(var i=0;i<groups.length;i++){
        for(var mi=0;mi<3;mi++){
            groups[i].members[mi].lastAction = groups[i].decision;
        }
    }
    var allMembers = [];
    for(var a=0;a<groups.length;a++){ for(var am=0;am<3;am++){ allMembers.push({ groupIndex:a, member:groups[a].members[am] }); } }
    for(var x=0;x<allMembers.length;x++){
        for(var y=x+1;y<allMembers.length;y++){
            var A = allMembers[x], B = allMembers[y];
            var pa = mod8_getPayoff(A.member.lastAction, B.member.lastAction, state.payoffs);
            var pb = mod8_getPayoff(B.member.lastAction, A.member.lastAction, state.payoffs);
            A.member.coins += pa; B.member.coins += pb;
            groups[A.groupIndex].score += pa; groups[B.groupIndex].score += pb;
        }
    }

    // Phase 2 & 3: elimination & replication (deterministic tiebreak by index)
    var order = groups.map(function(g,idx){ return {idx:idx,score:g.score}; }).sort(function(a,b){ if(a.score!==b.score) return a.score-b.score; return a.idx-b.idx; });
    var worst = order[0].idx; var best = order[order.length-1].idx;
    // Replace worst group's members with clones from best group
    groups[worst].members = groups[best].members.map(function(m){ return { strategy: m.strategy, coins:0, lastAction:null, memory:[] }; });
    groups[worst].strategy = groups[best].strategy;

    return { round: state.round+1, groups: groups, payoffs: state.payoffs, seed: state.seed };
};

// Integration helpers used by bootstrap UI
window.mod8_runOneRoundAndRender = function(){ window.mod8_state = mod8_runOneFullRound(window.mod8_state); mod8_renderUI(); };

// Minimal self-test: 2 groups (C vs D) should make D the best & C replaced
window.mod8_selfTest = function(){
    var testState = { round:0, payoffs:{T:5,R:3,P:1,S:0}, seed:42, groups:[
        { strategy:'COOPERATOR', score:0, decision:null, members:[{strategy:'COOPERATOR',coins:0,lastAction:null,memory:[]},{strategy:'COOPERATOR',coins:0,lastAction:null,memory:[]},{strategy:'COOPERATOR',coins:0,lastAction:null,memory:[]}] },
        { strategy:'DEFECTOR', score:0, decision:null, members:[{strategy:'DEFECTOR',coins:0,lastAction:null,memory:[]},{strategy:'DEFECTOR',coins:0,lastAction:null,memory:[]},{strategy:'DEFECTOR',coins:0,lastAction:null,memory:[]}] }
    ]};
    var out = mod8_runOneFullRound(testState);
    // After one round, worst group becomes clone of best; expect both groups to be DEFECTOR
    var allDef = out.groups.every(function(g){ return g.strategy==='DEFECTOR'; });
    return allDef;
};

