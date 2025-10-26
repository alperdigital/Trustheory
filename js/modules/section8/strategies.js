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
    GRUDGER: function(member){ var everD = member.memory.some(function(m){ return m.other==='D'; }); return everD? 'D':'C'; },
    PAVLOV: function(member){ var last = member.memory[member.memory.length-1]; if(!last) return 'C'; var win = (last.self==='C'&&last.other==='C')||(last.self==='D'&&last.other==='D'); return win? last.self : (last.self==='C'?'D':'C'); },
    PROB_COOP: function(){ return Math.random()<0.7?'C':'D'; }
};


