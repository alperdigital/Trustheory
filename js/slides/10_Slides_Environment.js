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

		// Create the tournament with group settings (positioned like Bölüm 7)
		self.add({id:"tournament_env", type:"Tournament", x:-20, y:-20});

		// Add Sandbox UI
		self.add({id:"sandbox_env", type:"SandboxUI"});

		// Add explanation text with better positioning (similar to other sections)
		var title = self.add({
			id:"environment_title", type:"TextBox",
			x:55, y:20, width:400, align:"center",
			text_id: "environment_title"
		});
		var intro = self.add({
			id:"environment_intro", type:"TextBox",
			x:55, y:60, width:400, align:"left",
			text_id: "environment_intro"
		});
		var explanation = self.add({
			id:"environment_explanation", type:"TextBox",
			x:55, y:100, width:400, align:"left",
			text_id: "environment_explanation"
		});
		
	},
	onend: function(self){
		// Reset to normal mode
		Tournament.resetGlobalVariables();
		self.clear();
	}

});
