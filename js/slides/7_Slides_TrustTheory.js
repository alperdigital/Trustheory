/**
 * TrustTheory Bölüm 7 – TrustTheory
 * 7. bölüm Sandbox'ın kopyası - grup çoğunluğu simülasyonu
 */

SLIDES.push({

	id: "trusttheory",
	onstart: function(self){

		console.log("=== TrustTheory Bölümü Başlatılıyor ===");
		
		// The tournament simulation
		Tournament.resetGlobalVariables();
		
		// Enable group mode for TrustTheory - grup bazlı seçilim
		Tournament.GROUP_MODE = true;
		Tournament.GROUP_SIZE = 3;
		Tournament.HOMOGENEOUS_GROUPS = true;
		Tournament.GROUP_VOTE_SOURCE = "perMemberHistory";
		Tournament.GROUP_FITNESS_METRIC = "avg_payoff";
		
		console.log("Group mode enabled:", Tournament.GROUP_MODE);
		console.log("Group size:", Tournament.GROUP_SIZE);
		
		// Adjust population to be odd multiple of 3
		var totalAgents = 0;
		for(var i = 0; i < Tournament.INITIAL_AGENTS.length; i++) {
			totalAgents += Tournament.INITIAL_AGENTS[i].count;
		}
		
		var adjustedTotal = window.ensurePopulationMultipleOf3 ? window.ensurePopulationMultipleOf3(totalAgents) : ensurePopulationMultipleOf3(totalAgents);
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
		
		console.log("Tournament objesi oluşturuldu:", self.objects.tournament);
		console.log("Tournament ID:", self.objects.tournament ? self.objects.tournament.id : "undefined");

		// Screw it, just ALL of the Sandbox UI
		self.add({id:"sandbox", type:"SandboxUI"});
		
		console.log("SandboxUI objesi oluşturuldu:", self.objects.sandbox);
		
		// Ensure Tournament is properly initialized for group mode
		setTimeout(function() {
			if (self.objects.tournament) {
				console.log("Tournament objesi bulundu, grup modu kontrol ediliyor...");
				console.log("Tournament GROUP_MODE:", self.objects.tournament.GROUP_MODE);
				console.log("Tournament agents count:", self.objects.tournament.agents ? self.objects.tournament.agents.length : "undefined");
				console.log("Tournament groups count:", self.objects.tournament.groups ? self.objects.tournament.groups.size : "undefined");
			} else {
				console.log("HATA: Tournament objesi bulunamadı!");
			}
		}, 1000);

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
