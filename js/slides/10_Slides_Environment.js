SLIDES.push({

	id: "environment",
	onstart: function(self){
		
		// The tournament simulation - same as 7. bölüm but configured for groups
		Tournament.resetGlobalVariables();
		
		// Enable group mode for Bölüm 11 - Çevre (Environment)
		Tournament.GROUP_MODE = true;
		Tournament.GROUP_SIZE = 3;
		Tournament.HOMOGENEOUS_GROUPS = true;
		Tournament.GROUP_VOTE_SOURCE = "perMemberHistory";
		Tournament.GROUP_FITNESS_METRIC = "avg_payoff";
		
		// Set population to exactly 30 for Bölüm 11 - Çevre (Environment)
		// 30 people = 10 groups of 3 people each
		// Start with 1 group per strategy (8 groups) + 2 extra groups for tft and all_d
		Tournament.INITIAL_AGENTS = [
			{strategy: "tft", count: 6},      // 2 groups
			{strategy: "all_d", count: 6},   // 2 groups
			{strategy: "all_c", count: 3},   // 1 group
			{strategy: "grudge", count: 3},  // 1 group
			{strategy: "prober", count: 3},  // 1 group
			{strategy: "tf2t", count: 3},    // 1 group
			{strategy: "pavlov", count: 3},  // 1 group
			{strategy: "random", count: 3}   // 1 group
		];
		
		// Tournament and UI directly in slide
		self.add({id:"environment_tournament", type:"Tournament", x:-20, y:-20});
		self.add({id:"environment_ui", type:"SandboxUI"});

		// Explanation text - ensure it's visible
		self.add({
			id:"label_environment", type:"TextBox",
			x:55, y:470, width:900, align:"left",
			text: "Bu bölümde grup psikolojisini inceliyoruz. Oyuncular 3'lü gruplar halinde organize olur ve her grup, kendi üyelerinin çoğunluk oyuna göre karar verir. Her tur sonunda en kötü grup elenir, en iyi grup çoğalır. Bu grup dinamikleri güven oluşumunu nasıl etkiler?"
		});
		
	},
	onend: function(self){
		Tournament.resetGlobalVariables();
		self.clear();
	}

});