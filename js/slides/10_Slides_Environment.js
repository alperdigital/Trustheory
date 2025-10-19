SLIDES.push({

	id: "environment",
	onstart: function(self){
		
		// The tournament simulation
		Tournament.resetGlobalVariables();
		
		// Enable group mode for Bölüm 10 - Çevre (Environment)
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
		
		var tournament = self.add({id:"environment_tournament", type:"Tournament", x:-20, y:-20});
		
		// Environment UI (copy of SandboxUI but with different ID)
		self.add({id:"environment_ui", type:"SandboxUI"});

		// Expanded explanation text (no button) - 1.5x wider, moved down one line
		self.add({
			id:"label_environment", type:"TextBox",
			x:55, y:470, width:900, align:"left",
			text_id: "environment_explanation"
		});
		
	},
	onend: function(self){
		// Reset to normal mode
		Tournament.resetGlobalVariables();
		self.clear();
	}

});