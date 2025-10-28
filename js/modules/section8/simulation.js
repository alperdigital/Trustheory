// Helpers: RNG & memory utils & group decision
function xorshift32(seed){ var x=seed|0; x^=(x<<13); x^=(x>>>17); x^=(x<<5); return (x>>>0)/4294967296; }
function seed5(a,b,c,d,e){ var s=2166136261|0; s=Math.imul(s^(a|0),16777619); s=Math.imul(s^(b|0),16777619); s=Math.imul(s^(c|0),16777619); s=Math.imul(s^(d|0),16777619); s=Math.imul(s^(e|0),16777619); return s|0; }
function pushGroupMemory(group, oppIdx, rec, limit){ group.memoryByOpponent=group.memoryByOpponent||{}; var arr=group.memoryByOpponent[oppIdx]=(group.memoryByOpponent[oppIdx]||[]); arr.push(rec); if(limit&&arr.length>limit) arr.shift(); }
function pushMemberMemory(member, rec, limit){ member.memory=member.memory||[]; member.memory.push(rec); if(limit&&member.memory.length>limit) member.memory.shift(); }
function decideGroupAction(group, vsIdx, ctx){ var mem=(group.memoryByOpponent&&group.memoryByOpponent[vsIdx])||[]; var strat=group.strategy; var fn=(window.mod8_group_strategies&&window.mod8_group_strategies[strat])||window.mod8_strategies[strat]; return fn(mem, ctx||{}); }
// Step 1: play all games & compute scores
window.mod8_stepPlay = function(state){
    var groups = state.groups.map(function(g){
        return {
            strategy:g.strategy,
            score:0,
            decision:null,
            members:g.members.map(function(m){ return { strategy:m.strategy, coins:0, lastAction:null, memory:(m.memory||[]).slice(), removed:m.removed||false }; }),
            memoryByOpponent: g.memoryByOpponent ? JSON.parse(JSON.stringify(g.memoryByOpponent)) : {}
        };
    });

    var turns = Math.max(1, state.turns||10);
    var G = groups.length;
    for(var i=0;i<G;i++){
        for(var j=i+1;j<G;j++){
            if(state.decisionMode==='group'){
                for(var t=0;t<turns;t++){
                    var aAct = decideGroupAction(groups[i], j, {seed:state.seed, generation:state.generation, i:i, j:j});
                    var bAct = decideGroupAction(groups[j], i, {seed:state.seed, generation:state.generation, i:j, j:i});
                    if(state.noise>0){ var s1=seed5(state.seed||0,(state.generation|0),i,j,(t^101)); var s2=seed5(state.seed||0,(state.generation|0),j,i,(t^202)); if(xorshift32(s1)<state.noise) aAct=(aAct==='C'?'D':'C'); if(xorshift32(s2)<state.noise) bAct=(bAct==='C'?'D':'C'); }
                    var pa=mod8_getPayoff(aAct,bAct,state.payoffs), pb=mod8_getPayoff(bAct,aAct,state.payoffs);
                    var scale=9; groups[i].score+=pa*scale; groups[j].score+=pb*scale;
                    for(var mi=0;mi<3;mi++){ groups[i].members[mi].coins+=(pa*scale)/3; groups[j].members[mi].coins+=(pb*scale)/3; }
                    pushGroupMemory(groups[i], j, {self:aAct, other:bAct}, 50);
                    pushGroupMemory(groups[j], i, {self:bAct, other:aAct}, 50);
                }
            }else{
                // individual mode: full 3x3 micro-matches
                var memA = groups[i].memoryByOpponent[j] || [];
                var memB = groups[j].memoryByOpponent[i] || [];
                var mMemA = (groups[i].memberMemoryByOpponent&&groups[i].memberMemoryByOpponent[j])||[[],[],[]];
                var mMemB = (groups[j].memberMemoryByOpponent&&groups[j].memberMemoryByOpponent[i])||[[],[],[]];
                for(var t2=0;t2<turns;t2++){
                    for(var am=0;am<3;am++){
                        var mA=groups[i].members[am]; mA.memory=(mMemA[am]&&mMemA[am].length)?mMemA[am]:memA;
                        for(var bm=0;bm<3;bm++){
                            var mB=groups[j].members[bm]; mB.memory=(mMemB[bm]&&mMemB[bm].length)?mMemB[bm]:memB;
                            var actA=window.mod8_strategies[mA.strategy](mA); var actB=window.mod8_strategies[mB.strategy](mB);
                            if(state.noise>0){ var ss1=seed5(state.seed||0,(state.generation|0),i,(t2<<4)|(am<<2)|bm,303); var ss2=seed5(state.seed||0,(state.generation|0),j,(t2<<4)|(bm<<2)|am,404); if(xorshift32(ss1)<state.noise) actA=(actA==='C'?'D':'C'); if(xorshift32(ss2)<state.noise) actB=(actB==='C'?'D':'C'); }
                            var pa2=mod8_getPayoff(actA,actB,state.payoffs), pb2=mod8_getPayoff(actB,actA,state.payoffs);
                            mA.coins+=pa2; groups[i].score+=pa2; mB.coins+=pb2; groups[j].score+=pb2;
                            pushMemberMemory(mA,{self:actA,other:actB},50); pushMemberMemory(mB,{self:actB,other:actA},50);
                        }
                    }
                }
                groups[i].memoryByOpponent[j] = (groups[i].memoryByOpponent[j]||[]).slice(-50);
                groups[j].memoryByOpponent[i] = (groups[j].memoryByOpponent[i]||[]).slice(-50);
            }
        }
    }
    return { round: state.round, groups: groups, payoffs: state.payoffs, seed: state.seed, noise: state.noise, turns: state.turns, phase:1 };
};

// Step 2: eliminate lowest-scoring member from the lowest-scoring group
window.mod8_stepEliminate = function(state){
    var groups = state.groups.map(function(g){
        return {
            strategy:g.strategy,
            score:g.score,
            decision:null,
            members:g.members.map(function(m){ return { strategy:m.strategy, coins:m.coins, lastAction:null, memory:(m.memory||[]).slice(), removed:m.removed||false }; }),
            memoryByOpponent: g.memoryByOpponent ? JSON.parse(JSON.stringify(g.memoryByOpponent)) : {}
        };
    });
    var order = groups.map(function(g,idx){ return {idx:idx,score:g.score, rand: ((state.seed||0) ^ (idx*2654435761))>>>0 }; }).sort(function(a,b){ if(a.score!==b.score) return a.score-b.score; return a.rand-b.rand; });
    var worst = order[0].idx;
    var w = groups[worst];
    var wOrder = w.members.map(function(m,mi){ return {mi:mi,coins:m.coins}; }).sort(function(a,b){ if(a.coins!==b.coins) return a.coins-b.coins; return a.mi-b.mi; });
    var toRemove = wOrder[0].mi;
    w.members[toRemove] = { strategy:null, coins:0, lastAction:null, memory:[], removed:true };
    return { round: state.round, groups: groups, payoffs: state.payoffs, seed: state.seed, noise: state.noise, turns: state.turns, phase:2 };
};

// Step 3: replicate from best group into removed slots, then reset scores & coins
window.mod8_stepReplicateReset = function(state){
    var groups = state.groups.map(function(g){
        return {
            strategy:g.strategy,
            score:g.score,
            decision:null,
            members:g.members.map(function(m){ return { strategy:m.strategy, coins:m.coins, lastAction:null, memory:[], removed:m.removed||false }; }),
            memoryByOpponent: g.memoryByOpponent ? JSON.parse(JSON.stringify(g.memoryByOpponent)) : {}
        };
    });
    var order = groups.map(function(g,idx){ return {idx:idx,score:g.score, rand: ((state.seed||0) ^ Math.imul((((state.generation|0)<<8)|idx),2654435761))>>>0 }; }).sort(function(a,b){ if(a.score!==b.score) return a.score-b.score; return a.rand-b.rand; });
    var worst = order[0].idx; var best = order[order.length-1].idx;
    var w = groups[worst]; var b = groups[best];
    // 1) üyeleri komple klonla
    w.members = JSON.parse(JSON.stringify(b.members));
    // 2) strateji hizala
    w.strategy = b.strategy;
    // 3) grup hafızasını da kopyala veya politika uygula
    if(state.resetMemoryEachRound){
        w.memoryByOpponent = {};
        for(var km=0;km<w.members.length;km++){ w.members[km].memory = []; }
    }else if(state.cloneWithEmptyMemory){
        w.memoryByOpponent = {};
        for(var km2=0;km2<w.members.length;km2++){ w.members[km2].memory = []; }
    }else{
        w.memoryByOpponent = JSON.parse(JSON.stringify(b.memoryByOpponent||{}));
    }
    for(var gi=0;gi<groups.length;gi++){
        groups[gi].score = 0;
        groups[gi].memoryByOpponent = {}; // reset per-opponent memory each new round for fairness
        for(var gm=0;gm<3;gm++){
            groups[gi].members[gm].coins = 0;
            groups[gi].members[gm].removed=false;
            groups[gi].members[gm].memory = [];
        }
    }
    return { round: state.round+1, groups: groups, payoffs: state.payoffs, seed: state.seed, noise: state.noise, turns: state.turns, decisionMode: state.decisionMode, includeIntraGroup: state.includeIntraGroup, resetMemoryEachRound: state.resetMemoryEachRound, cloneWithEmptyMemory: state.cloneWithEmptyMemory, generation: (state.generation|0)+1, phase:0 };
};

// Backwards compat helper used by autoplay
window.mod8_runOneFullRound = function(state){
    var s1 = mod8_stepPlay(state);
    var s2 = mod8_stepEliminate(s1);
    var s3 = mod8_stepReplicateReset(s2);
    return s3;
};

// Integration helpers used by bootstrap UI
window.mod8_runOneRoundAndRender = function(){
    var p = (window.mod8_state.phase||0);
    if(p===0){ window.mod8_state = mod8_stepPlay(window.mod8_state); }
    else if(p===1){ window.mod8_state = mod8_stepEliminate(window.mod8_state); }
    else { window.mod8_state = mod8_stepReplicateReset(window.mod8_state); }
    mod8_renderUI();
};

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

