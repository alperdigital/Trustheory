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
        mod8_initTabs();
        mod8_buildDistributionControls();
        mod8_buildPayoffsControls();
        mod8_buildRulesControls();

        // Events
        on(document.getElementById("mod8-start"), "click", function(){ mod8_startAutoplay(); });
        on(document.getElementById("mod8-step"), "click", function(){
            // Run stepwise over 3 phases: 0->1->2->reset
            var p = (window.mod8_state.phase||0);
            if(p===0){
                window.mod8_state = mod8_stepPlay(window.mod8_state); mod8_renderUI();
            }else if(p===1){
                window.mod8_state = mod8_stepEliminate(window.mod8_state); mod8_renderUI();
            }else{
                window.mod8_state = mod8_stepReplicateReset(window.mod8_state); mod8_renderUI();
            }
        });
        on(document.getElementById("mod8-stop"), "click", function(){ mod8_stopAutoplay(); });
        on(document.getElementById("mod8-reset"), "click", function(){ mod8_stopAutoplay(); mod8_initState(); mod8_renderUI(); });
        var speedEl = document.getElementById("mod8-speed");
        if(speedEl){ on(speedEl, "input", function(e){ speedMs = parseInt(e.target.value,10)||1000; if(autoplayTimer){ mod8_stopAutoplay(); mod8_startAutoplay(); } }); }

        mounted = true;
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

})();
 
 