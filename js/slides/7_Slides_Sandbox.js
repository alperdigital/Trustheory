SLIDES.push({

	id: "sandbox",
	onstart: function(self){

		// The tournament simulation
		Tournament.resetGlobalVariables();
		
		// Enable group mode for Bölüm 7
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
		
		self.add({id:"tournament", type:"Tournament", x:-20, y:-20});

		// Screw it, just ALL of the Sandbox UI
		self.add({id:"sandbox", type:"SandboxUI"});

		// Expanded explanation text (no button)
		self.add({
			id:"label_next", type:"TextBox",
			x:55, y:450, width:600, align:"left",
			text_id: "sandbox_end"
		});
		
	},
	onend: function(self){
		// Reset to normal mode
		Tournament.resetGlobalVariables();
		self.clear();
	}

});