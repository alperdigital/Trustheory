SLIDES.push({

	id: "group_intra",
	onstart: function(self){
		try{ if(window.S9_mount) S9_mount(); }catch(e){ console.error("S9 mount error", e); }
	},
	onend: function(self){
		try{ if(window.S9_unmount) S9_unmount(); }catch(e){ console.error("S9 unmount error", e); }
	}

});

 