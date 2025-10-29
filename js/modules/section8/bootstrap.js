// Section 8 Bootstrap - isolated mount/unmount & minimal nav integration
(function(){

    var root = null;
    var mounted = false;
    var autoplayTimer = null;
    var speedMs = 100; // start fastest by default

    // Simple pub/sub inside module scope
    var listeners = [];
    function on(el, ev, fn){ el.addEventListener(ev, fn); listeners.push([el,ev,fn]); }
    function offAll(){ for(var i=0;i<listeners.length;i++){ var l=listeners[i]; l[0].removeEventListener(l[1], l[2]); } listeners=[]; }

    // Public mount
    window.mod8_mount = function(){
        if(mounted) return;
        root = document.getElementById("mod8-root");
        if(!root){ console.error("mod8-root not found"); return; }
        // Opt-in sprite buttons (revertable via CSS or by removing this class)
        try{ root.classList.add("mod8-sprite"); }catch(e){}
        // Revertible opt-in: lock member hats to strategy frames during updates
        try{ root.classList.add('mod8-lock-hats'); }catch(e){}
        root.hidden = false;
        root.innerHTML = ""+
            "<div class=\"mod8-intro\">"+
              "<h2>8. Bölüm – Grup Evrimi</h2>"+
              "<p>Takımlar arası Mahkûmun İkilemi simülasyonu: gruplar oynar, en düşük elenir, en yüksek çoğalır. Aşağıdaki kontrollerle nüfusu, ödülleri ve kuralları ayarlayabilirsiniz.</p>"+
            "</div>"+
            "<div class=\"mod8-layout\">"+
              "<div class=\"mod8-stage-col\">"+
                 "<div id=\"mod8-stage\" class=\"mod8-stage\">"+
                    "<div id=\"mod8-stage-circle\" class=\"mod8-stage-circle\"></div>"+
                    "<div class=\"mod8-stage-center\">"+
                    "<div class=\"mod8-center-buttons\">"+
                    "<button id=\"mod8-start\" class=\"mod8-ctrl-btn\" aria-label=\"Başlat\">BAŞLAT</button>"+
                    "<button id=\"mod8-step\" class=\"mod8-ctrl-btn\" aria-label=\"Adım\">ADIM</button>"+
                    "<div id=\"mod8-evolution\" class=\"mod8-evolution\"></div>"+
                    "<button id=\"mod8-stop\" class=\"mod8-ctrl-btn\" aria-label=\"Dur\">DUR</button>"+
                    "<button id=\"mod8-reset\" class=\"mod8-ctrl-btn\" aria-label=\"Sıfırla\">SIFIRLA</button>"+
                    "</div>"+
                       "<div class=\"mod8-center-info\">"+
                          "<span id=\"mod8-total-warning\" class=\"mod8-warning\"></span>"+
                          "<span id=\"mod8-status\"></span>"+
                       "</div>"+
                    "</div>"+
                 "</div>"+
              "</div>"+
              "<div class=\"mod8-side-col\">"+
                 "<div class=\"mod8-sandbox_tabs\" id=\"mod8-sandbox_tabs\">"+
                   "<div class=\"mod8-hitbox\" data-page=\"pop\">"+(window.Words&&Words.get?Words.get('label_population'):'NÜFUS').toUpperCase()+"</div>"+
                   "<div class=\"mod8-hitbox\" data-page=\"pay\">"+(window.Words&&Words.get?Words.get('label_payoffs'):'ÖDÜLLER').toUpperCase()+"</div>"+
                   "<div class=\"mod8-hitbox\" data-page=\"rules\">"+(window.Words&&Words.get?Words.get('label_rules'):'KURALLAR').toUpperCase()+"</div>"+
                   "<div class=\"mod8-sandbox_page\" id=\"mod8-page-pop\"></div>"+
                   "<div class=\"mod8-sandbox_page\" id=\"mod8-page-pay\" hidden></div>"+
                   "<div class=\"mod8-sandbox_page\" id=\"mod8-page-rules\" hidden></div>"+
                 "</div>"+
              "</div>"+
            "</div>";

        // Initialize state/UI
        window.mod8_state = window.mod8_state || {};
        mod8_initState();
        mod8_renderUI();
        try{ mod8_buildEvolution(); mod8_renderEvolution(); }catch(e){}
        try{ mod8_renderMembersTriangle(); }catch(e){}
        mod8_initTabs();
        mod8_buildDistributionControls();
        mod8_buildPayoffsControls();
        mod8_buildRulesControls();

        // Events
        on(document.getElementById("mod8-start"), "click", function(){ mod8_startAutoplay(); try{ mod8_renderEvolution(); mod8_renderMembersTriangle(); }catch(e){} });
        on(document.getElementById("mod8-step"), "click", function(){
            // Run stepwise over 3 phases: 0->1->2->reset
            var p = (window.mod8_state.phase||0);
            if(p===0){
                window.mod8_state = mod8_stepPlay(window.mod8_state); mod8_renderUI(); try{ mod8_renderEvolution(); mod8_renderMembersTriangle(); }catch(e){}
            }else if(p===1){
                window.mod8_state = mod8_stepEliminate(window.mod8_state); mod8_renderUI(); try{ mod8_renderEvolution(); mod8_renderMembersTriangle(); }catch(e){}
            }else{
                window.mod8_state = mod8_stepReplicateReset(window.mod8_state); mod8_renderUI(); try{ mod8_renderEvolution(); mod8_renderMembersTriangle(); }catch(e){}
            }
        });
        on(document.getElementById("mod8-stop"), "click", function(){ mod8_stopAutoplay(); try{ mod8_renderEvolution(); mod8_renderMembersTriangle(); }catch(e){} });
        on(document.getElementById("mod8-reset"), "click", function(){ mod8_stopAutoplay(); mod8_initState(); mod8_renderUI(); try{ mod8_renderEvolution(); mod8_renderMembersTriangle(); }catch(e){} });
        var speedEl = document.getElementById("mod8-speed");
        if(speedEl){ on(speedEl, "input", function(e){ speedMs = parseInt(e.target.value,10)||1000; if(autoplayTimer){ mod8_stopAutoplay(); mod8_startAutoplay(); } }); }

        mounted = true;
        // Ensure member hats stay strategy-consistent during all renders (revertible by removing mod8-lock-hats)
        try{
            if(root.classList.contains('mod8-lock-hats') && typeof window.mod8_runOneRoundAndRender==='function' && !window.mod8_runOneRoundAndRender._mod8Wrapped){
                var __origRun = window.mod8_runOneRoundAndRender;
                window.mod8_runOneRoundAndRender = function(){
                    var r = __origRun();
                    try{ mod8_renderMembersTriangle(); }catch(e){}
                    return r;
                };
                window.mod8_runOneRoundAndRender._mod8Wrapped = true;
            }
            if(root.classList.contains('mod8-lock-hats') && typeof window.mod8_renderUI==='function' && !window.mod8_renderUI._mod8Wrapped){
                var __origRenderUI = window.mod8_renderUI;
                window.mod8_renderUI = function(){
                    var r2 = __origRenderUI.apply(this, arguments);
                    try{ mod8_renderMembersTriangle(); }catch(e){}
                    return r2;
                };
                window.mod8_renderUI._mod8Wrapped = true;
            }
        }catch(e){}
        // Sync sliders to current state on mount
        try{
            publish && publish('mod8/sync/speed', [mod8_getSpeed()]);
            publish && publish('mod8/sync/noise', [Math.round((window.mod8_state.noise||0)*100)]);
        }catch(e){}
    };

    // Public unmount
    window.mod8_unmount = function(){
        if(!mounted) return;
        mod8_stopAutoplay();
        offAll();
        root.innerHTML = "";
        root.hidden = true;
        mounted = false;
    };

    // Autoplay helpers
    function mod8_startAutoplay(){ if(autoplayTimer) return; autoplayTimer = setInterval(mod8_runOneRoundAndRender, speedMs); }
    function mod8_stopAutoplay(){ if(!autoplayTimer) return; clearInterval(autoplayTimer); autoplayTimer=null; }

    // Public speed setter for UI sliders
    window.mod8_setSpeed = function(ms){
        speedMs = parseInt(ms,10)||1000;
        if(autoplayTimer){ mod8_stopAutoplay(); mod8_startAutoplay(); }
    };
    // Public getter for UI initialization
    window.mod8_getSpeed = function(){ return speedMs; };

    // Wiring to slideshow (non-invasive): optional keyboard quick toggle
    document.addEventListener("keydown", function(e){ if(e.key==="8" && (e.metaKey||e.ctrlKey)){ mod8_mount(); } });
    var navBtn = document.getElementById("mod8-nav-link");
    if(navBtn){ navBtn.addEventListener('click', function(){ if(!mounted) mod8_mount(); }); }

    // Evolution bar build & render
    function mod8_buildEvolution(){
        var bar = document.getElementById('mod8-evolution'); if(!bar) return;
        if(bar.getAttribute('data-built')==='yes') return;
        bar.innerHTML = ''+
            '<div class="mod8-evolution-title">Evrim Süreci</div>'+
            '<div class="mod8-evolution-track">'+
              '<div class="mod8-evolution-fill"></div>'+
              '<div class="mod8-evolution-flag"><span class="mod8-flag-label"></span></div>'+
            '</div>';
        bar.setAttribute('data-built','yes');
    }
    function mod8_renderEvolution(){
        var bar = document.getElementById('mod8-evolution'); if(!bar) return;
        var s = window.mod8_state || {};
        var gen = Math.max(0, parseInt(s.gen||0,10));
        var max = parseInt(s.maxGen||15,10); if(!max||max<1) max=15; if(gen>max) gen=max;
        var pct = (gen/max)*100;
        var fill = bar.querySelector('.mod8-evolution-fill'); if(fill){ fill.style.width = pct+'%'; }
        var flag = bar.querySelector('.mod8-evolution-flag'); if(flag){ flag.style.left = pct+'%'; }
        var lbl = bar.querySelector('.mod8-flag-label'); if(lbl){ lbl.textContent = 'Jenerasyon '+gen+' / '+max; }
    }

    // Group members inside node: hide big icon & place 3 small hats in equilateral triangle with mini-scores
    function mod8_memberFrame(str){
        var k = (str||'').toUpperCase();
        if(k==='TIT_FOR_TAT') return 0;
        if(k==='DEFECTOR') return 1;
        if(k==='COOPERATOR') return 2;
        if(k==='GRUDGER') return 3;
        if(k==='PROBER') return 4;
        if(k==='TIT_FOR_TWO_TATS') return 5;
        if(k==='PAVLOV') return 6;
        return 7; // RANDOM
    }
    function mod8_renderMembersTriangle(){
        var stage = document.getElementById('mod8-stage'); if(!stage) return;
        var groups = (window.mod8_state&&window.mod8_state.groups)||[];
        for(var i=0;i<groups.length;i++){
            var node = document.getElementById('mod8-group-node-'+i) || document.getElementById('mod8-gn-'+i) || null; if(!node) continue;
            var g = groups[i]; if(!g) continue;
            // hide big icon & remove any previously injected inner nodes
            var ic = node.querySelector('.mod8-group-icon'); if(ic){ ic.style.display='none'; }
            var olds = node.querySelectorAll('.mod8-node-member, .mod8-node-score');
            for(var z=0;z<olds.length;z++){ olds[z].parentNode && olds[z].parentNode.removeChild(olds[z]); }
            // triangle inside the 80x80 node
            var cx=40, cy=40, r=24; var angs=[-Math.PI/2, Math.PI/6, 5*Math.PI/6];
            for(var k=0;k<3;k++){
                var m = g.members && g.members[k]; if(!m) continue;
                var mx = cx + r*Math.cos(angs[k]) - 12;
                var my = cy + r*Math.sin(angs[k]) - 12;
                // find existing outer wrap and move it inside the node
                var wrapId = 'mod8-member-'+i+'-'+k;
                var wrap = document.getElementById(wrapId);
                if(wrap){
                    // ensure absolute positioning inside node
                    wrap.style.position = 'absolute';
                    wrap.style.left = mx+'px';
                    wrap.style.top = my+'px';
                    wrap.style.transform = '';
                    wrap.style.zIndex = 2;
                    if(wrap.parentNode!==node){ node.appendChild(wrap); }
                    // ensure icon frame reflects strategy
                    var mmIcon = wrap.querySelector('.mod8-member');
                    if(mmIcon){ var frame = mod8_memberFrame(m.strategy); mmIcon.style.backgroundPosition = (-(frame*25))+'px 0px'; }
                    // ensure badge shows current coins
                    var badge = wrap.querySelector('.mod8-member-badge');
                    if(badge){ badge.textContent = String(Math.round(m.coins||0)); }
                }
            }
        }
    }
})();
 
 