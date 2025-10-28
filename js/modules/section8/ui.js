// Tabs like Sandbox
window.mod8_initTabs = function(){
    var tabs = document.getElementById('mod8-sandbox_tabs'); if(!tabs) return;
    var buttons = tabs.querySelectorAll('.mod8-hitbox');
    function show(id){
        var ids=['pop','pay','rules'];
        ids.forEach(function(k){ var el=document.getElementById('mod8-page-'+k); if(el){ el.hidden = (k!==id); } });
        buttons.forEach(function(b){ if(b.getAttribute('data-page')===id){ b.setAttribute('selected','yes'); } else { b.removeAttribute('selected'); } });
        tabs.setAttribute('data-page', id);
        var idx = (id==='pop')?0 : (id==='pay'?1:2);
        tabs.style.backgroundPosition = (-idx*500)+"px 0px";
    }
    buttons.forEach(function(btn){ btn.addEventListener('click', function(){ show(btn.getAttribute('data-page')); }); });
    show('pop');
};
// Render minimal UI from current state
window.mod8_renderUI = function(){
    var s = window.mod8_state; if(!s) return;
    var stage = document.getElementById("mod8-stage"); if(!stage) return;
    var warn = document.getElementById("mod8-total-warning");
    var totalGroups = s.groups.length;
    warn.textContent = (totalGroups!==10)? "Toplam grup sayısı 10 olmalı (şu an "+totalGroups+")" : "";

    // Disable start when invalid
    var startBtn = document.getElementById("mod8-start");
    if(startBtn){ startBtn.disabled = (totalGroups!==10); }

    // Build/update stage elements without recreating every time

    // compute best/worst for label
    var order = s.groups.map(function(g,idx){ return {idx:idx,score:g.score}; }).sort(function(a,b){ if(a.score!==b.score) return a.score-b.score; return a.idx-b.idx; });
    var worstIdx = order.length? order[0].idx : -1;
    var bestIdx = order.length? order[order.length-1].idx : -1;

    // place groups around circle
    var cx=280, cy=280, r=220;
    var _pm = (typeof PEEP_METADATA!=='undefined')? PEEP_METADATA : { tft:{frame:0,color:'#4089DD'}, all_d:{frame:1,color:'#52537F'}, all_c:{frame:2,color:'#FF75FF'}, grudge:{frame:3,color:'#efc701'}, prober:{frame:4,color:'#f6b24c'}, tf2t:{frame:5,color:'#88A8CE'}, pavlov:{frame:6,color:'#86C448'}, random:{frame:7,color:'#FF5E5E'} };
    function stratToMeta(strategy){
        var map = {COOPERATOR:'all_c', RANDOM:'random', TIT_FOR_TAT:'tft', TIT_FOR_TWO_TATS:'tf2t', GRUDGER:'grudge', DEFECTOR:'all_d', PAVLOV:'pavlov', PROBER:'prober'};
        var key = map[strategy]; return key? _pm[key] : {frame:7,color:'#FF5E5E'};
    }
    for(var i=0;i<s.groups.length;i++){
        var g = s.groups[i]; var angle = (i/s.groups.length)*Math.PI*2 - Math.PI/2; var x=cx + r*Math.cos(angle) - 40; var y=cy + r*Math.sin(angle) - 40;
        var idNode = 'mod8-group-node-'+i;
        var node = document.getElementById(idNode);
        if(!node){ node=document.createElement('div'); node.id=idNode; node.className='mod8-group-node'; stage.appendChild(node); }
        node.style.left=x+'px'; node.style.top=y+'px'; node.style.border='2px solid '+(i===bestIdx?'#2a9d8f':(i===worstIdx?'#e76f51':'#ddd'));
        var icon = node.querySelector('.mod8-group-icon'); if(!icon){ icon=document.createElement('div'); icon.className='mod8-group-icon'; node.appendChild(icon); }
        var meta=stratToMeta(g.strategy); icon.style.backgroundPosition = (-(meta.frame*40))+'px 0px';
        var gscore = node.querySelector('.mod8-group-score'); if(!gscore){ gscore=document.createElement('div'); gscore.className='mod8-group-score'; node.appendChild(gscore); }
        var displayScore = String(g.score);
        gscore.textContent = displayScore;

        // members cloud slightly outside circle
        var mx=cx + (r+50)*Math.cos(angle) - 12; var my=cy + (r+50)*Math.sin(angle) - 12;
        for(var m=0;m<g.members.length;m++){
            var mid = 'mod8-member-'+i+'-'+m;
            var mmWrap = document.getElementById(mid);
            if(!mmWrap){ mmWrap=document.createElement('div'); mmWrap.id=mid; mmWrap.className='mod8-member-wrap'; stage.appendChild(mmWrap); var mm=document.createElement('div'); mm.className='mod8-member'; mmWrap.appendChild(mm); var mb=document.createElement('div'); mb.className='mod8-member-badge'; mmWrap.appendChild(mb); }
            mmWrap.style.left=(mx + m*22)+'px'; mmWrap.style.top=(my + (m%2)*22)+'px';
            var mmIcon = mmWrap.querySelector('.mod8-member'); mmIcon.style.backgroundPosition = (-(meta.frame*25))+'px 0px';
            var mbadge = mmWrap.querySelector('.mod8-member-badge'); var mc = g.members[m].coins; mbadge.textContent = String(mc);
        }
    }
    var status = document.getElementById("mod8-status"); if(status){
        var best = (bestIdx>=0)? ("En yüksek: Grup "+(bestIdx+1)) : "";
        var worst = (worstIdx>=0)? (" | En düşük: Grup "+(worstIdx+1)) : "";
        var turns = " | Tur içi tekrar sayısı: "+(s.turns||10);
        status.textContent = "Tur: "+s.round+" — "+best+worst+turns;
    }
};

// Build distribution controls (idempotent)
window.mod8_buildDistributionControls = function(){
    var container = document.getElementById("mod8-page-pop"); if(!container) return;
    container.innerHTML = '';
    // Clear any prior sandbox-style elements
    var oldSandbox = container.querySelectorAll('.sandbox_pop, .slider');
    for(var i=0;i<oldSandbox.length;i++){ oldSandbox[i].parentNode.removeChild(oldSandbox[i]); }
    var _pm = (typeof PEEP_METADATA!=='undefined')? PEEP_METADATA : {
        tft:{frame:0,color:'#4089DD'}, all_d:{frame:1,color:'#52537F'}, all_c:{frame:2,color:'#FF75FF'},
        grudge:{frame:3,color:'#efc701'}, prober:{frame:4,color:'#f6b24c'}, tf2t:{frame:5,color:'#88A8CE'},
        pavlov:{frame:6,color:'#86C448'}, random:{frame:7,color:'#FF5E5E'}
    };
    var map = [
        {key:"all_c", label:"label_short_all_c", color:_pm.all_c.color, frame:_pm.all_c.frame, strat:'COOPERATOR'},
        {key:"random", label:"label_short_random", color:_pm.random.color, frame:_pm.random.frame, strat:'RANDOM'},
        {key:"tft", label:"label_short_tft", color:_pm.tft.color, frame:_pm.tft.frame, strat:'TIT_FOR_TAT'},
        {key:"tf2t", label:"label_short_tf2t", color:_pm.tf2t.color, frame:_pm.tf2t.frame, strat:'TIT_FOR_TWO_TATS'},
        {key:"grudge", label:"label_short_grudge", color:_pm.grudge.color, frame:_pm.grudge.frame, strat:'GRUDGER'},
        {key:"all_d", label:"label_short_all_d", color:_pm.all_d.color, frame:_pm.all_d.frame, strat:'DEFECTOR'},
        {key:"pavlov", label:"label_short_pavlov", color:_pm.pavlov.color, frame:_pm.pavlov.frame, strat:'PAVLOV'},
        {key:"prober", label:"label_short_prober", color:_pm.prober.color, frame:_pm.prober.frame, strat:'PROBER'}
    ];
    MOD8_buildPopulationWithSliders(container, map);
};

function mod8_applyDistributionFromUI(){
    var strategies = ["COOPERATOR","RANDOM","TIT_FOR_TAT","TIT_FOR_TWO_TATS","GRUDGER","DEFECTOR","PAVLOV","PROBER"];
    var dist = {}; var sum=0;
    strategies.forEach(function(k){ var el=document.getElementById('mod8-dist-'+k); var v=parseInt((el && el.textContent)||'0',10); if(isNaN(v)||v<0) v=0; dist[k]=v; sum+=v; });
    // Rebuild groups (keep exactly entered amounts, even if !=10; start button disables)
    var newGroups=[]; function add(strategy,count){ for(var i=0;i<count;i++){ newGroups.push(mod8_makeGroup(strategy)); } }
    strategies.forEach(function(k){ add(k, dist[k]||0); });
    window.mod8_state.groups = newGroups.slice(0, Math.max(0,newGroups.length));
    window.mod8_state.round = 0; // resetting rounds after composition change
    mod8_renderUI();
}

function mod8_setDist(key, val){
    if(val<0) val=0; if(val>10) val=10;
    var el = document.getElementById('mod8-dist-'+key); if(!el) return;
    el.textContent = String(val);
    mod8_applyDistributionFromUI();
}

// Build payoffs controls (like PD PayoffsUI but isolated)
window.mod8_buildPayoffsControls = function(){
    var container = document.getElementById("mod8-page-pay"); if(!container) return;
    container.innerHTML = '';
    var pay = new MOD8_PayoffsUI({x:84, y:41, scale:0.9});
    container.appendChild(pay.dom);
    var resetBtn = document.createElement('button'); resetBtn.textContent='Varsayılanı Ayarla'; resetBtn.style.position='absolute'; resetBtn.style.left='240px'; resetBtn.style.top='300px';
    resetBtn.onclick=function(){ window.mod8_state.payoffs = Object.assign({}, window.mod8_defaults.payoffs); mod8_buildPayoffsControls(); };
    container.appendChild(resetBtn);
};

// Build rules controls: speed label & summary like chapter 7
window.mod8_buildRulesControls = function(){
    var container = document.getElementById("mod8-page-rules"); if(!container) return;
    container.innerHTML = '';
    // Speed slider using core Slider for visual parity
    var rule_turns = document.createElement('div'); rule_turns.className='label'; rule_turns.style.left='0px'; rule_turns.style.top='0px'; rule_turns.style.width='433px';
    rule_turns.innerHTML = 'Simülasyon Hızı (ms/cycle)'; container.appendChild(rule_turns);
    var slider_speed = new Slider({ x:0, y:35, width:430, min:100, max:2000, step:50, onchange:function(v){ mod8_setSpeed(v); } });
    listen(window, 'mod8/sync/speed', function(v){ slider_speed.setValue(v); });
    slider_speed.slideshow = { dom: container }; container.appendChild(slider_speed.dom);

    var rule_noise = document.createElement('div'); rule_noise.className='label'; rule_noise.style.left='0px'; rule_noise.style.top='100px'; rule_noise.style.width='433px';
    rule_noise.innerHTML = (Words.get?Words.get('sandbox_rules_3'):'Her tur sırasında, bir oyuncunun hata yapma şansı [N]%:').replace(/\[N\]/g, String(Math.round((window.mod8_state.noise||0)*100)));
    container.appendChild(rule_noise);
    var slider_noise = new Slider({ x:0, y:165, width:430, min:0, max:50, step:1, onchange:function(v){ window.mod8_state.noise = (v||0)/100; rule_noise.innerHTML = (Words.get?Words.get('sandbox_rules_3'):'Her tur sırasında, bir oyuncunun hata yapma şansı [N]%:').replace(/\[N\]/g, String(v)); } });
    listen(window, 'mod8/sync/noise', function(v){ slider_noise.setValue(v); });
    slider_noise.slideshow = { dom: container }; container.appendChild(slider_noise.dom);

    // Turns slider similar to chapter 7 (1..50)
    var rule_turns = document.createElement('div'); rule_turns.className='label'; rule_turns.style.left='0px'; rule_turns.style.top='225px'; rule_turns.style.width='433px';
    var turnsWords = (window.mod8_state.turns==1)? (Words.get?Words.get('sandbox_rules_1_single'):'Maç başına [N] tur oyna:') : (Words.get?Words.get('sandbox_rules_1'):'Maç başına [N] tur oyna:');
    rule_turns.innerHTML = turnsWords.replace(/\[N\]/g, String(window.mod8_state.turns||10));
    container.appendChild(rule_turns);
    var slider_turns = new Slider({ x:0, y:290, width:430, min:1, max:50, step:1, onchange:function(v){ window.mod8_state.turns = v; var tw = (v==1)? (Words.get?Words.get('sandbox_rules_1_single'):'Maç başına [N] tur oyna:') : (Words.get?Words.get('sandbox_rules_1'):'Maç başına [N] tur oyna:'); rule_turns.innerHTML = tw.replace(/\[N\]/g, String(v)); } });
    slider_turns.slideshow = { dom: container }; container.appendChild(slider_turns.dom);

    // Decision Mode toggle & intra-group checkbox (single bottom row, absolute positioned)
    var bottomRow = document.createElement('div');
    bottomRow.style.position='absolute'; bottomRow.style.left='0px'; bottomRow.style.top='330px'; bottomRow.style.width='433px';
    bottomRow.style.display='flex'; bottomRow.style.alignItems='center'; bottomRow.style.justifyContent='space-between';

    // left: intra checkbox (only for individual)
    var intraWrap = document.createElement('div'); intraWrap.style.userSelect='none';
    var cb = document.createElement('input'); cb.type='checkbox'; cb.id='mod8-include-intra'; cb.checked=!!window.mod8_state.includeIntraGroup;
    var cbLabel = document.createElement('label'); cbLabel.htmlFor='mod8-include-intra'; cbLabel.textContent='Aynı gruptakiler oynasın'; cbLabel.style.marginLeft='6px';
    intraWrap.appendChild(cb); intraWrap.appendChild(cbLabel);
    intraWrap.style.visibility = ((window.mod8_state.decisionMode||'group')==='individual'?'visible':'hidden');

    // right: label + segmented toggle
    var toggleWrap = document.createElement('div'); toggleWrap.style.display='flex'; toggleWrap.style.alignItems='center'; toggleWrap.style.gap='8px';
    var toggleLabel = document.createElement('div'); toggleLabel.textContent='Karar Verme:';
    var toggle = document.createElement('div'); toggle.className='mod8-toggle';
    toggle.setAttribute('data-mode', window.mod8_state.decisionMode||'group');
    var thumb = document.createElement('div'); thumb.className='mod8-toggle-thumb'; toggle.appendChild(thumb);
    var optGroup = document.createElement('div'); optGroup.className='mod8-toggle-option'; optGroup.setAttribute('data-key','group'); optGroup.textContent='Grup';
    var optInd   = document.createElement('div'); optInd.className='mod8-toggle-option';   optInd.setAttribute('data-key','individual'); optInd.textContent='Bireysel';
    toggle.appendChild(optGroup); toggle.appendChild(optInd);
    toggle.addEventListener('click', function(){
        var cur = toggle.getAttribute('data-mode'); var next = (cur==='group') ? 'individual' : 'group';
        toggle.setAttribute('data-mode', next); window.mod8_state.decisionMode = next;
        intraWrap.style.visibility = (next==='individual'?'visible':'hidden');
    });
    toggleWrap.appendChild(toggleLabel);
    toggleWrap.appendChild(toggle);
    bottomRow.appendChild(intraWrap);
    bottomRow.appendChild(toggleWrap);
    container.appendChild(bottomRow);

    cb.addEventListener('change', function(){ window.mod8_state.includeIntraGroup = cb.checked; });
};

