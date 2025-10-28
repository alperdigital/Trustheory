// Decision helpers for strategies (group majority uses single decision)
window.mod8_act = {
    COOPERATE: function(){ return 'C'; },
    DEFECT: function(){ return 'D'; }
};

window.mod8_strategies = {
    COOPERATOR: function(){ return 'C'; },
    DEFECTOR: function(){ return 'D'; },
    RANDOM: function(){ return Math.random()<0.5?'C':'D'; },
    TIT_FOR_TAT: function(member){ var last = member.memory[member.memory.length-1]; return last? last.other : 'C'; },
    TIT_FOR_TWO_TATS: function(member){
        var len = member.memory.length;
        if(len>=2){
            var a = member.memory[len-1].other;
            var b = member.memory[len-2].other;
            if(a==='D' && b==='D') return 'D';
        }
        return 'C';
    },
    GRUDGER: function(member){ var everD = member.memory.some(function(m){ return m.other==='D'; }); return everD? 'D':'C'; },
    PAVLOV: function(member){ var last = member.memory[member.memory.length-1]; if(!last) return 'C'; var win = (last.self==='C'&&last.other==='C')||(last.self==='D'&&last.other==='D'); return win? last.self : (last.self==='C'?'D':'C'); },
    PROBER: function(member){
        if(!member._probe){ member._probe = { seq:['C','D','C','C'], everRetaliated:false, lastOther:'C' }; }
        var st = member._probe;
        if(st.seq.length>0){ return st.seq.shift(); }
        return st.everRetaliated ? (st.lastOther || 'C') : 'D';
    }
};

// Group-level shorthand strategies that look at group memory only
window.mod8_group_strategies = {
    COOPERATOR: function(){ return 'C'; },
    DEFECTOR: function(){ return 'D'; },
    RANDOM: function(mem, ctx){ var r = (window.xorshift32 && window.seed5)? xorshift32(seed5((ctx&&ctx.seed)||0,(ctx&&ctx.generation)||0,(ctx&&ctx.i)||0,(ctx&&ctx.j)||0,777)) : Math.random(); return (r<0.5?'C':'D'); },
    TIT_FOR_TAT: function(mem){ return mem.length? mem[mem.length-1].other : 'C'; },
    TIT_FOR_TWO_TATS: function(mem){ var n=mem.length; if(n>=2){ return (mem[n-1].other==='D' && mem[n-2].other==='D')?'D':'C'; } return 'C'; },
    GRUDGER: function(mem){ for(var i=0;i<mem.length;i++){ if(mem[i].other==='D') return 'D'; } return 'C'; },
    PAVLOV: function(mem){ if(!mem.length) return 'C'; var last=mem[mem.length-1]; var win=(last.self==='C'&&last.other==='C')||(last.self==='D'&&last.other==='D'); return win? last.self : (last.self==='C'?'D':'C'); },
    PROBER: function(mem){ if(mem.length<3) return (mem.length===1?'D':'C'); return (mem[mem.length-1].other==='D')?'D':'C'; }
};


