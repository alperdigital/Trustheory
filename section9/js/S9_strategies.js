window.S9_StrategyRegistry=(function(){var m={};return{register:function(n,f){m[n]=f;},get:function(n){return m[n];},list:function(){return Object.keys(m);}}})();
function S9_xorshift32(seed){var x=seed|0;x^=(x<<13);x^=(x>>>17);x^=(x<<5);return (x>>>0)/4294967296;}
function S9_seed5(a,b,c,d,e){var s=2166136261|0;s=Math.imul(s^(a|0),16777619);s=Math.imul(s^(b|0),16777619);s=Math.imul(s^(c|0),16777619);s=Math.imul(s^(d|0),16777619);s=Math.imul(s^(e|0),16777619);return s|0;}
(function(){var S={
 COOPERATOR:function(){return 'C';},
 DEFECTOR:function(){return 'D';},
 RANDOM:function(ctx){var r=S9_xorshift32(S9_seed5((ctx.seed||0),(ctx.round||0),(ctx.i||0),(ctx.j||0),777));return r<0.5?'C':'D';},
 TIT_FOR_TAT:function(m){var l=m.memory[m.memory.length-1];return l?l.other:'C';},
 TIT_FOR_TWO_TATS:function(m){var n=m.memory.length; if(n>=2){return (m.memory[n-1].other==='D'&&m.memory[n-2].other==='D')?'D':'C';} return 'C';},
 GRUDGER:function(m){for(var i=0;i<m.memory.length;i++){if(m.memory[i].other==='D')return 'D';}return 'C';},
 PAVLOV:function(m){var l=m.memory[m.memory.length-1];if(!l)return 'C';var win=(l.self==='C'&&l.other==='C')||(l.self==='D'&&l.other==='D');return win?l.self:(l.self==='C'?'D':'C');},
 PROBER:function(m){if(!m._probe){m._probe={seq:['C','D','C','C']};} if(m._probe.seq.length>0){return m._probe.seq.shift();} return 'D';}
}; Object.keys(S).forEach(function(k){S9_StrategyRegistry.register(k,S[k]);});})();


