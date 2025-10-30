SLIDES.push({

	id: "group_intra",
	onstart: function(self){
		// Lazy-load Section 9 scripts only when this slide starts
		function ensureS9Loaded(cb){
			if(window.S9_mount){ cb(); return; }
			var files=[
				"section9/js/S9_main.js",
				"section9/js/S9_model.js",
				"section9/js/S9_strategies.js",
				"section9/js/S9_ui.js",
				"section9/js/S9_payoffs_ui.js"
			];
			var i=0; function next(){ if(i>=files.length){ cb(); return; }
				var s=document.createElement('script'); s.src=files[i++]; s.defer=true; s.onload=next; s.onerror=next; document.body.appendChild(s);
			}
			next();
		}
		ensureS9Loaded(function(){ try{ S9_mount(); }catch(e){ console.error("S9 mount error", e); } });
	},
	onend: function(self){
		try{ if(window.S9_unmount) S9_unmount(); }catch(e){ console.error("S9 unmount error", e); }
	}

});

 