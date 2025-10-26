// Render minimal UI from current state
window.mod8_renderUI = function(){
    var s = window.mod8_state; if(!s) return;
    var grid = document.getElementById("mod8-grid"); if(!grid) return;
    var warn = document.getElementById("mod8-total-warning");
    var totalGroups = s.groups.length;
    warn.textContent = (totalGroups!==10)? "Toplam grup sayısı 10 olmalı (şu an "+totalGroups+")" : "";

    // Disable start when invalid
    var startBtn = document.getElementById("mod8-start");
    if(startBtn){ startBtn.disabled = (totalGroups!==10); }

    grid.innerHTML = "";
    // compute best/worst for label
    var order = s.groups.map(function(g,idx){ return {idx:idx,score:g.score}; }).sort(function(a,b){ if(a.score!==b.score) return a.score-b.score; return a.idx-b.idx; });
    var worstIdx = order.length? order[0].idx : -1;
    var bestIdx = order.length? order[order.length-1].idx : -1;

    for(var i=0;i<s.groups.length;i++){
        var g = s.groups[i];
        var card = document.createElement("div"); card.className = "mod8-card"; if(i===bestIdx) card.classList.add('mod8-best'); if(i===worstIdx) card.classList.add('mod8-worst');
        var label = (i===bestIdx?" (En Yüksek)":(i===worstIdx?" (En Düşük)":""));
        var title = document.createElement("h4"); title.textContent = "Grup "+(i+1)+" – "+g.strategy+label; card.appendChild(title);
        var members = document.createElement("div"); members.className = "mod8-members";
        for(var m=0;m<g.members.length;m++){ var b=document.createElement("div"); b.className="mod8-badge"; b.style.background=g.decision==='D'?"#e76f51":"#2a9d8f"; members.appendChild(b); }
        card.appendChild(members);
        var score = document.createElement("div"); score.className = "mod8-score"; score.textContent = "Grup Puanı: "+g.score; card.appendChild(score);
        grid.appendChild(card);
    }
    var status = document.getElementById("mod8-status"); if(status){
        var best = (bestIdx>=0)? ("En yüksek: Grup "+(bestIdx+1)) : "";
        var worst = (worstIdx>=0)? (" | En düşük: Grup "+(worstIdx+1)) : "";
        status.textContent = "Tur: "+s.round+" — "+best+worst;
    }
};

// Build distribution controls (idempotent)
window.mod8_buildDistributionControls = function(){
    var panel = document.querySelector(".mod8-panel"); if(!panel) return;
    var holder = document.createElement("div"); holder.style.display='flex'; holder.style.gap='8px'; holder.style.flexWrap='wrap'; holder.id='mod8-dist';
    var strategies = ["COOPERATOR","RANDOM","TIT_FOR_TAT","GRUDGER","DEFECTOR","PAVLOV","PROB_COOP"];
    strategies.forEach(function(k){
        var wrap = document.createElement("label"); wrap.style.display='flex'; wrap.style.alignItems='center'; wrap.style.gap='4px';
        var span = document.createElement("span"); span.textContent = k; wrap.appendChild(span);
        var input = document.createElement("input"); input.type='number'; input.min='0'; input.max='10'; input.step='1'; input.value = mod8_defaults.distribution[k]||0; input.id='mod8-dist-'+k;
        input.addEventListener('change', function(){ mod8_applyDistributionFromUI(); });
        wrap.appendChild(input);
        holder.appendChild(wrap);
    });
    panel.appendChild(holder);
};

function mod8_applyDistributionFromUI(){
    var strategies = ["COOPERATOR","RANDOM","TIT_FOR_TAT","GRUDGER","DEFECTOR","PAVLOV","PROB_COOP"];
    var dist = {}; var sum=0;
    strategies.forEach(function(k){ var v=parseInt(document.getElementById('mod8-dist-'+k).value||'0',10); if(isNaN(v)||v<0) v=0; dist[k]=v; sum+=v; });
    // Rebuild groups (keep exactly entered amounts, even if !=10; start button disables)
    var newGroups=[]; function add(strategy,count){ for(var i=0;i<count;i++){ newGroups.push(mod8_makeGroup(strategy)); } }
    strategies.forEach(function(k){ add(k, dist[k]||0); });
    window.mod8_state.groups = newGroups.slice(0, Math.max(0,newGroups.length));
    window.mod8_state.round = 0; // resetting rounds after composition change
    mod8_renderUI();
}

