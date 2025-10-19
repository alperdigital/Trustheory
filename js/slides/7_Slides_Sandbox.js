SLIDES.push({

	id: "sandbox",
	onstart: function(self){

		// The tournament simulation
		Tournament.resetGlobalVariables();
		
		// Keep normal mode for Bölüm 7 (no group mode)
		Tournament.GROUP_MODE = false;
		
		self.add({id:"tournament", type:"Tournament", x:-20, y:-20});

		// Screw it, just ALL of the Sandbox UI
		self.add({id:"sandbox", type:"SandboxUI"});

		// Expanded explanation text (no button) - 1.5x wider, moved down one line
		self.add({
			id:"label_next", type:"TextBox",
			x:55, y:470, width:900, align:"left",
			text_id: "sandbox_end"
		});
		
	},
	onend: function(self){
		// Reset to normal mode
		Tournament.resetGlobalVariables();
		self.clear();
	}

});