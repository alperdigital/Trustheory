window.S9_defaults={groups:20,agentsPerGroup:5,rounds:10,noise:0.1,payoffs:{T:5,R:3,P:1,S:0},seed:123456789,decisionMode:'individual'};
function S9_pay(a,b,p){ if(a==='C'&&b==='C')return p.R; if(a==='D'&&b==='D')return p.P; if(a==='D'&&b==='C')return p.T; return p.S; }
function S9_makeAgent(strat){ return { strategy:strat, score:0, memory:[] }; }
function S9_makeGroup(idx,names,seed){ var agents=[]; for(var i=0;i<S9_defaults.agentsPerGroup;i++){ var r=S9_xorshift32(S9_seed5(seed,idx,i,9,9)); agents.push(S9_makeAgent(names[Math.floor(r*names.length)])); } return { id:idx, score:0, agents:agents }; }
window.S9_state=null;
function S9_groupVote(s, gIdx, oppGIdx, turnIdx){ var group=s.groups[gIdx]; var c=0,d=0; for(var i=0;i<group.agents.length;i++){ var v=S9_act(group.agents[i], {seed:s.seed, round:s.gen, i:gIdx, j:oppGIdx, t:turnIdx}); if(v==='C') c++; else d++; } if(c>d) return 'C'; if(d>c) return 'D'; return 'C'; }
window.S9_newSeed=function(){ return ((Date.now() ^ Math.floor(Math.random()*0xFFFFFFFF))>>>0); };
window.S9_initState=function(newSeed){ var seed=(typeof newSeed==='number'? newSeed : S9_defaults.seed); var names=S9_StrategyRegistry.list(); var groups=[]; for(var g=0; g<S9_defaults.groups; g++){ groups.push(S9_makeGroup(g,names,seed)); } window.S9_state={ phase:0, gen:0, groups:groups, rounds:S9_defaults.rounds, noise:S9_defaults.noise, payoffs:Object.assign({},S9_defaults.payoffs), seed:seed, decisionMode:S9_defaults.decisionMode, bestGroup:-1, worstGroup:-1, prevBestGroup:-1, prevWorstGroup:-1, hiddenIdxByGroup:{} } };
function S9_act(agent,ctx){ var fn=S9_StrategyRegistry.get(agent.strategy); return (fn.length? fn(agent) : fn(ctx)); }
window.S9_stepPlay=function(s){ // Phase 1: everyone plays everyone
  // reset scores
  for(var gi=0;gi<s.groups.length;gi++){ s.groups[gi].score=0; for(var ai=0;ai<s.groups[gi].agents.length;ai++){ s.groups[gi].agents[ai].score=0; s.groups[gi].agents[ai].memory=[]; } }
  var agents=[]; for(var g=0;g<s.groups.length;g++){ for(var a=0;a<s.groups[g].agents.length;a++){ agents.push({g:g,a:a}); } }
  for(var i=0;i<agents.length;i++){
    for(var j=i+1;j<agents.length;j++){
      var A=s.groups[agents[i].g].agents[agents[i].a]; var B=s.groups[agents[j].g].agents[agents[j].a];
      for(var t=0;t<(s.rounds||1);t++){
        var actA, actB;
        if((s.decisionMode||'individual')==='group'){
          actA=S9_groupVote(s, agents[i].g, agents[j].g, t);
          actB=S9_groupVote(s, agents[j].g, agents[i].g, t);
        } else {
          actA=S9_act(A,{seed:s.seed,round:s.gen,i:agents[i].g,j:agents[j].g});
          actB=S9_act(B,{seed:s.seed,round:s.gen,i:agents[j].g,j:agents[i].g});
        }
        if(s.noise>0){ var ss1=S9_seed5(s.seed,(s.gen|0),agents[i].g,((t<<4)|agents[i].a),303), ss2=S9_seed5(s.seed,(s.gen|0),agents[j].g,((t<<4)|agents[j].a),404); if(S9_xorshift32(ss1)<s.noise) actA=(actA==='C'?'D':'C'); if(S9_xorshift32(ss2)<s.noise) actB=(actB==='C'?'D':'C'); }
        var pa=S9_pay(actA,actB,s.payoffs), pb=S9_pay(actB,actA,s.payoffs); A.score+=pa; B.score+=pb;
        A.memory.push({self:actA,other:actB}); if(A.memory.length>50) A.memory.shift(); B.memory.push({self:actB,other:actA}); if(B.memory.length>50) B.memory.shift();
      }
    }
  }
  // group scores
  for(var g2=0;g2<s.groups.length;g2++){ var sum=0; for(var a2=0;a2<s.groups[g2].agents.length;a2++){ sum+=s.groups[g2].agents[a2].score; } s.groups[g2].score=sum; }
  s.phase=1; return s;
};
window.S9_stepMark=function(s){ // Phase 2: mark best/worst and hide per-group min member
  var best=-1, worst=-1; for(var g=0;g<s.groups.length;g++){ if(best<0 || s.groups[g].score>s.groups[best].score) best=g; if(worst<0 || s.groups[g].score<s.groups[worst].score) worst=g; }
  s.bestGroup=best; s.worstGroup=worst; s.hiddenIdxByGroup={};
  for(var g2=0; g2<s.groups.length; g2++){ var minIdx=0; for(var a=1;a<s.groups[g2].agents.length;a++){ if(s.groups[g2].agents[a].score<s.groups[g2].agents[minIdx].score) minIdx=a; } s.hiddenIdxByGroup[g2]=minIdx; }
  s.phase=2; return s;
};
window.S9_stepEvolve=function(s){ // Phase 3: first intra-group, then inter-group (worst <- best)
  // stash who was marked in Phase 2 for UI (turn to yellow next step)
  s.prevBestGroup = s.bestGroup;
  s.prevWorstGroup = s.worstGroup;
  // Intra-group: per group clone best agent into previously hidden (min) slot
  for(var g=0; g<s.groups.length; g++){
    var hid = (s.hiddenIdxByGroup && s.hiddenIdxByGroup[g]!=null) ? s.hiddenIdxByGroup[g] : null;
    if(hid!=null){
      var maxIdx = 0;
      for(var a=1; a<s.groups[g].agents.length; a++){
        if(s.groups[g].agents[a].score > s.groups[g].agents[maxIdx].score) maxIdx = a;
      }
      s.groups[g].agents[hid] = JSON.parse(JSON.stringify(s.groups[g].agents[maxIdx]));
    }
  }
  // Inter-group: replace worst group's members with best group's members
  if(s.bestGroup>=0 && s.worstGroup>=0 && s.bestGroup!==s.worstGroup){
    var bestClone = JSON.parse(JSON.stringify(s.groups[s.bestGroup].agents));
    s.groups[s.worstGroup].agents = bestClone;
  }
  // Reset scores for next generation
  for(var g2=0; g2<s.groups.length; g2++){
    for(var a2=0;a2<s.groups[g2].agents.length;a2++){ s.groups[g2].agents[a2].score=0; s.groups[g2].agents[a2].memory=[]; }
    s.groups[g2].score=0;
  }
  s.gen=(s.gen|0)+1; s.phase=0; return s;
};
var _t=null,_spd=300; window.S9_start=function(){ if(_t) return; _t=setInterval(function(){ if(S9_state.phase===0){ S9_state=S9_stepPlay(S9_state); } else if(S9_state.phase===1){ S9_state=S9_stepMark(S9_state); } else { S9_state=S9_stepEvolve(S9_state); } if(typeof S9_render==='function') S9_render(); }, _spd); }; window.S9_stop=function(){ if(!_t) return; clearInterval(_t); _t=null; }; window.S9_stepOnce=function(){ if(S9_state.phase===0){ S9_state=S9_stepPlay(S9_state); } else if(S9_state.phase===1){ S9_state=S9_stepMark(S9_state); } else { S9_state=S9_stepEvolve(S9_state); } if(typeof S9_render==='function') S9_render(); };


