SLIDES.push({

	id: "environment",
	onstart: function(self){
		
		// Create independent tournament instance for Environment
		// This ensures complete separation from Bölüm 7
		var environmentTournament = new Tournament();
		
		// Configure Environment-specific settings
		environmentTournament.GROUP_MODE = true;
		environmentTournament.GROUP_SIZE = 3;
		environmentTournament.HOMOGENEOUS_GROUPS = true;
		environmentTournament.GROUP_VOTE_SOURCE = "perMemberHistory";
		environmentTournament.GROUP_FITNESS_METRIC = "avg_payoff";
		
		// Store in slideshow objects with unique ID
		self.objects.environment_tournament = environmentTournament;
		
		// Add tournament to scene
		var tournamentSprite = self.add({id:"environment_tournament", type:"Tournament", x:-20, y:-20});
		
		// Create independent UI for Environment
		self.add({id:"environment_ui", type:"SandboxUI"});

		// Environment-specific explanation text
		self.add({
			id:"label_environment", type:"TextBox",
			x:55, y:470, width:900, align:"left",
			text_id: "environment_explanation"
		});
		
	},
	onend: function(self){
		// Clean up Environment-specific objects
		if (self.objects.environment_tournament) {
			self.objects.environment_tournament = null;
		}
		self.clear();
	}

});