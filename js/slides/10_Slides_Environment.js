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
		const leftWrapW = Math.max(320, rightPanelX - (PADDING + GAP));

		// Create text container for masking
		var textContainer = new PIXI.Container();
		textContainer.zIndex = 10;
		
		// Add explanation text with proper layout
		var title = self.add({
			id:"environment_title", type:"TextBox",
			x:PADDING, y:PADDING, width:leftWrapW, align:"center",
			text_id: "environment_title"
		});
		var intro = self.add({
			id:"environment_intro", type:"TextBox",
			x:PADDING, y:PADDING+40, width:leftWrapW, align:"left",
			text_id: "environment_intro"
		});
		var explanation = self.add({
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
		var labelNext = self.add({
			id:"label_next_env", type:"TextBox",
			x:PADDING, y:textHeight, width:leftWrapW, align:"right",
			text_id: "environment_end"
		});
		var buttonNext = self.add({
			id:"button_next_env", type:"Button",
			x:PADDING + leftWrapW - 100, y:textHeight + 4, size:"long",
			text_id:"environment_end_btn",
			message: "slideshow/scratch"
		});

		// Create mask for text area (prevent overflow into panel)
		var leftMask = new PIXI.Graphics()
			.beginFill(0x000000)
			.drawRect(0, 0, rightPanelX - GAP, 600)
			.endFill();
		textContainer.mask = leftMask;
		
		// Resize handler
		function relayout() {
			const newLeftWrapW = Math.max(320, rightPanelX - (PADDING + GAP));
			
			// Update text widths
			if (title && title.dom) title.dom.style.width = newLeftWrapW + "px";
			if (intro && intro.dom) intro.dom.style.width = newLeftWrapW + "px";
			if (explanation && explanation.dom) explanation.dom.style.width = newLeftWrapW + "px";
			if (labelNext && labelNext.dom) labelNext.dom.style.width = newLeftWrapW + "px";
			
			// Update button position
			if (buttonNext && buttonNext.dom) {
				buttonNext.dom.style.left = (PADDING + newLeftWrapW - 100) + "px";
			}
			
			// Update mask
			leftMask.clear();
			leftMask.beginFill(0x000000)
				.drawRect(0, 0, rightPanelX - GAP, 600)
				.endFill();
		}
		
		// Add resize listener
		window.addEventListener('resize', relayout);
		
		// Store cleanup function
		self._cleanup = function() {
			window.removeEventListener('resize', relayout);
		};
		
	},
	onend: function(self){
		// Cleanup resize listener
		if (self._cleanup) {
			self._cleanup();
		}
		
		// Reset to normal mode
		Tournament.resetGlobalVariables();
		self.clear();
	}

});
