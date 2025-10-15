SLIDES.push({

	id: "environment",
	onstart: function(self){

		// Configure Tournament for group mode
		Tournament.resetGlobalVariables();
		
		// Set group mode settings
		Tournament.GROUP_MODE = true;
		Tournament.GROUP_SIZE = 3;
		Tournament.HOMOGENEOUS_GROUPS = true;
		Tournament.GROUP_VOTE_SOURCE = "perMemberHistory";
		Tournament.GROUP_FITNESS_METRIC = "avg_payoff";
		
		// Adjust population to be odd multiple of 3
		var totalAgents = 0;
		for(var i = 0; i < Tournament.INITIAL_AGENTS.length; i++) {
			totalAgents += Tournament.INITIAL_AGENTS[i].count;
		}
		
		var adjustedTotal = ensurePopulationMultipleOf3(totalAgents);
		if (adjustedTotal !== totalAgents) {
			// Adjust the random strategy count to reach target
			var randomConfig = Tournament.INITIAL_AGENTS.find(function(config) {
				return config.strategy === "random";
			});
			if (randomConfig) {
				randomConfig.count += (adjustedTotal - totalAgents);
			}
		}

		// Add explanation text
		self.add({
			id:"environment_title", type:"TextBox",
			x:55, y:20, width:535, align:"center",
			text_id: "environment_title"
		});
		self.add({
			id:"environment_intro", type:"TextBox",
			x:55, y:60, width:535, align:"left",
			text_id: "environment_intro"
		});
		self.add({
			id:"environment_explanation", type:"TextBox",
			x:55, y:100, width:535, align:"left",
			text_id: "environment_explanation"
		});

		// Create the tournament with group settings
		self.add({id:"tournament_env", type:"Tournament", x:-20, y:150});

		// Add Sandbox UI
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
		// Reset to normal mode
		Tournament.resetGlobalVariables();
		self.clear();
	}

});
