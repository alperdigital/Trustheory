// Section 8 Bootstrap - isolated mount/unmount & minimal nav integration
(function(){

    var root = null;
    var mounted = false;
    var autoplayTimer = null;
    var speedMs = 1000;

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
        var slideHost = document.getElementById("slideshow_container"); if(slideHost){ slideHost.style.display='none'; }
        root.innerHTML = ""+
            "<div class=\"mod8-panel\">"+
            "<button id=\"mod8-start\">Başlat</button>"+
            "<button id=\"mod8-step\">Adım</button>"+
            "<button id=\"mod8-stop\">Durdur</button>"+
            "<button id=\"mod8-reset\">Sıfırla</button>"+
            "<label style=\"margin-left:8px\">Hız <input id=\"mod8-speed\" type=\"range\" min=\"100\" max=\"2000\" step=\"50\" value=\"1000\"></label>"+
            "<span id=\"mod8-total-warning\" class=\"mod8-warning\"></span>"+
            "</div>"+
            "<div id=\"mod8-grid\" class=\"mod8-grid\"></div>"+
            "<div class=\"mod8-panel\"><span id=\"mod8-status\"></span></div>";

        // Initialize state/UI
        window.mod8_state = window.mod8_state || {};
        mod8_initState();
        mod8_renderUI();
        mod8_buildDistributionControls();

        // Events
        on(document.getElementById("mod8-start"), "click", function(){ mod8_startAutoplay(); });
        on(document.getElementById("mod8-step"), "click", function(){ mod8_runOneRoundAndRender(); });
        on(document.getElementById("mod8-stop"), "click", function(){ mod8_stopAutoplay(); });
        on(document.getElementById("mod8-reset"), "click", function(){ mod8_stopAutoplay(); mod8_initState(); mod8_renderUI(); });
        on(document.getElementById("mod8-speed"), "input", function(e){ speedMs = parseInt(e.target.value,10)||1000; if(autoplayTimer){ mod8_stopAutoplay(); mod8_startAutoplay(); } });

        mounted = true;
    };

    // Public unmount
    window.mod8_unmount = function(){
        if(!mounted) return;
        mod8_stopAutoplay();
        offAll();
        root.innerHTML = "";
        root.hidden = true;
        var slideHost = document.getElementById("slideshow_container"); if(slideHost){ slideHost.style.display='block'; }
        mounted = false;
    };

    // Autoplay helpers
    function mod8_startAutoplay(){ if(autoplayTimer) return; autoplayTimer = setInterval(mod8_runOneRoundAndRender, speedMs); }
    function mod8_stopAutoplay(){ if(!autoplayTimer) return; clearInterval(autoplayTimer); autoplayTimer=null; }

    // Wiring to slideshow (non-invasive): optional keyboard quick toggle
    document.addEventListener("keydown", function(e){ if(e.key==="8" && (e.metaKey||e.ctrlKey)){ mod8_mount(); } });
    var navBtn = document.getElementById("mod8-nav-link");
    if(navBtn){ navBtn.addEventListener('click', function(){ if(!mounted) mod8_mount(); }); }

})();
 