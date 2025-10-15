SLIDES.push({

	id: "environment",
	onstart: function(self){

		// The tournament simulation
		Tournament.resetGlobalVariables();
		self.add({id:"tournament_env", type:"Tournament", x:-20, y:-20});

		// Screw it, just ALL of the Sandbox UI
		self.add({id:"sandbox_env", type:"SandboxUI"});

		// Label & Button for next...
		self.add({
			id:"label_next_env", type:"TextBox",
			x:55, y:481, width:535, align:"right",
			text_id: "environment_end"
		});
		self.add({
			id:"button_next_env", type:"Button",
			x:605, y:485, size:"long",
			text_id:"environment_end_btn",
			message: "slideshow/scratch"
		});
		
	},
	onend: function(self){
		self.clear();
	}

});
