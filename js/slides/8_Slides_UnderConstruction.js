SLIDES.push({
	id: "under_construction",
	onstart: function(self){
        // Lazy-load Section 8 scripts when this slide starts
        function ensureMod8Loaded(cb){
            if(window.mod8_mount){ cb(); return; }
            var files=[
                "js/modules/section8/state.js?v11",
                "js/modules/section8/strategies.js?v11",
                "js/modules/section8/payoffs.js?v11",
                "js/modules/section8/simulation.js?v11",
                "js/modules/section8/ui.js?v11",
                "js/modules/section8/lib/payoffs_ui.js?v11",
                "js/modules/section8/lib/population_slider.js?v11",
                "js/modules/section8/bootstrap.js?v11"
            ];
            var i=0; function next(){ if(i>=files.length){ cb(); return; }
                var s=document.createElement('script'); s.src=files[i++]; s.defer=true; s.onload=next; s.onerror=next; document.body.appendChild(s);
            }
            next();
        }
        ensureMod8Loaded(function(){ try{ mod8_mount(); }catch(e){ console.error('mod8 mount error', e); } });
        // No extra UI; show only the simulation and its controls
	},
	onend: function(self){
        if(typeof mod8_unmount==="function"){ mod8_unmount(); }
        self.clear();
	}
});
