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

		// Layout constants
		const PANEL_W = 500;
		const GAP = 24;
		const PADDING = 24;
		const rightPanelX = 460; // Sandbox panel left position
		const leftWrapW = Math.max(300, rightPanelX - (PADDING + GAP));

		// Add explanation text with proper layout
		self.add({
			id:"environment_title", type:"TextBox",
			x:PADDING, y:PADDING, width:leftWrapW, align:"center",
			text_id: "environment_title"
		});
		self.add({
			id:"environment_intro", type:"TextBox",
			x:PADDING, y:PADDING+40, width:leftWrapW, align:"left",
			text_id: "environment_intro"
		});
		self.add({
			id:"environment_explanation", type:"TextBox",
			x:PADDING, y:PADDING+80, width:leftWrapW, align:"left",
			text_id: "environment_explanation"
		});

		// Create the tournament with group settings
		self.add({id:"tournament_env", type:"Tournament", x:-20, y:150});

		// Add Sandbox UI
		self.add({id:"sandbox_env", type:"SandboxUI"});

		// Label & Button for next... positioned after text
		var textHeight = PADDING + 80 + 60; // Approximate text height
		self.add({
			id:"label_next_env", type:"TextBox",
			x:PADDING, y:textHeight, width:leftWrapW, align:"right",
			text_id: "environment_end"
		});
		self.add({
			id:"button_next_env", type:"Button",
			x:PADDING + leftWrapW - 100, y:textHeight + 4, size:"long",
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
