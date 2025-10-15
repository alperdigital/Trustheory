// Group Tournament - 3'lü gruplar halinde çoğunluk kararı sistemi
GroupTournament.resetGlobalVariables = function(){
	GroupTournament.SELECTION = 5;
	GroupTournament.NUM_TURNS = 10;
	GroupTournament.GROUP_SIZE = 3; // 3'lü gruplar

	GroupTournament.INITIAL_AGENTS = [
		{strategy:"tft", count:3},    // 1 grup Dengeli
		{strategy:"all_d", count:3},  // 1 grup Kötümser
		{strategy:"all_c", count:3},  // 1 grup İyimser
		{strategy:"grudge", count:3}, // 1 grup İntikamcı
		{strategy:"prober", count:3}, // 1 grup Araştırmacı
		{strategy:"pavlov", count:3}, // 1 grup Sade
		{strategy:"random", count:3}  // 1 grup Kaotik
	];

	GroupTournament.FLOWER_CONNECTIONS = false;

	publish("pd/defaultPayoffs");

	PD.NOISE = 0;
};

GroupTournament.resetGlobalVariables();

subscribe("rules/evolution",function(value){
	GroupTournament.SELECTION = value;
});

subscribe("rules/turns",function(value){
	GroupTournament.NUM_TURNS = value;
});

Loader.addToManifest(Loader.manifest,{
	tournament_peep: "assets/tournament/tournament_peep.json",
	connection_flower: "assets/tournament/connection_flower.json",
	squeak: "assets/sounds/squeak.mp3",
	bonk: "assets/sounds/bonk.mp3"
});

function GroupTournament(config){
	var self = this;
	self.id = config.id;
	
	var app = new PIXI.Application(500, 500, {transparent:true, resolution:2});
	self.dom = app.view;

	self.dom.className = "object";
	self.dom.style.width = 500;
	self.dom.style.height = 500;
	self.dom.style.left = config.x+"px";
	self.dom.style.top = config.y+"px";

	var _convertCountToGroups = function(countList){
		var groups = [];
		var strategies = [];
		
		// Tüm stratejileri bir array'e çevir
		for(var i=0; i<countList.length; i++){
			var A = countList[i];
			for(var j=0; j<A.count; j++){
				strategies.push(A.strategy);
			}
		}

		// Stratejileri karıştır
		for (var i = strategies.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = strategies[i];
			strategies[i] = strategies[j];
			strategies[j] = temp;
		}

		// 3'lü gruplar oluştur
		for(var i=0; i<strategies.length; i+=GroupTournament.GROUP_SIZE){
			var groupStrategies = strategies.slice(i, i+GroupTournament.GROUP_SIZE);
			if(groupStrategies.length === GroupTournament.GROUP_SIZE){
				groups.push(groupStrategies);
			}
		}
		return groups;
	};

	self.groups = [];
	self.connections = [];

	self.networkContainer = new PIXI.Container();
	self.groupsContainer = new PIXI.Container();
	app.stage.addChild(self.networkContainer);
	app.stage.addChild(self.groupsContainer);

	self.populateGroups = function(){
		while(self.groups.length>0) self.groups[0].kill();
		
		var groupList = _convertCountToGroups(GroupTournament.INITIAL_AGENTS);
		self.groups = [];

		var count = 0;
		for(var i=0; i<groupList.length; i++){
			var group = new GroupAgent({
				index: i,
				total: groupList.length,
				strategies: groupList[i],
				container: self.groupsContainer
			});
			self.groups.push(group);
		}
		self.createConnections();
	};

	self.createConnections = function(){
		while(self.connections.length>0) self.connections[0].kill();

		for(var i=0; i<self.groups.length; i++){
			for(var j=i+1; j<self.groups.length; j++){
				var groupA = self.groups[i];
				var groupB = self.groups[j];
				var connection = new GroupConnection(groupA, groupB, self.networkContainer);
				self.connections.push(connection);
			}
		}
	};

	// Grup karar alma mekanizması
	self.makeGroupDecision = function(group, opponentGroup){
		var strategies = group.strategies;
		var cooperateVotes = 0;
		var cheatVotes = 0;
		
		// Her strateji için karar ver
		for(var i=0; i<strategies.length; i++){
			var strategy = strategies[i];
			var decision = self.getStrategyDecision(strategy, opponentGroup);
			
			if(decision === PD.COOPERATE) {
				cooperateVotes++;
			} else {
				cheatVotes++;
			}
		}
		
		// Çoğunluk kararı
		return (cooperateVotes >= cheatVotes) ? PD.COOPERATE : PD.CHEAT;
	};

	self.getStrategyDecision = function(strategy, opponentGroup){
		// Basit strateji kararları (gerçek implementasyon daha karmaşık olabilir)
		switch(strategy) {
			case "all_c": return PD.COOPERATE;
			case "all_d": return PD.CHEAT;
			case "tft": 
				return opponentGroup.lastDecision || PD.COOPERATE;
			case "grudge":
				return opponentGroup.hasCheated ? PD.CHEAT : PD.COOPERATE;
			case "prober":
				// Basit prober logic
				return Math.random() < 0.1 ? PD.CHEAT : PD.COOPERATE;
			case "pavlov":
				// Basit pavlov logic
				return Math.random() < 0.5 ? PD.COOPERATE : PD.CHEAT;
			case "random":
				return Math.random() < 0.5 ? PD.COOPERATE : PD.CHEAT;
			default: return PD.COOPERATE;
		}
	};

	self.playGroupGame = function(groupA, groupB){
		var decisionA = self.makeGroupDecision(groupA, groupB);
		var decisionB = self.makeGroupDecision(groupB, groupA);

		var payoffs = PD.getPayoffs(decisionA, decisionB);

		groupA.addPayoff(payoffs[0]);
		groupB.addPayoff(payoffs[1]);

		groupA.lastDecision = decisionA;
		groupB.lastDecision = decisionB;

		// Cheat tracking for grudge
		if(decisionA === PD.CHEAT) groupA.hasCheated = true;
		if(decisionB === PD.CHEAT) groupB.hasCheated = true;

		return payoffs;
	};

	self.playOneRound = function(){
		// Her grup için skor sıfırla
		for(var i=0; i<self.groups.length; i++){
			self.groups[i].roundScore = 0;
		}

		// Tüm grup çiftleri arasında oyun oyna
		for(var i=0; i<self.groups.length; i++){
			for(var j=i+1; j<self.groups.length; j++){
				self.playGroupGame(self.groups[i], self.groups[j]);
			}
		}
	};

	self.reproduce = function(){
		var newGroups = [];
		var totalScore = 0;
		
		// Toplam skor hesapla
		for(var i=0; i<self.groups.length; i++){
			totalScore += self.groups[i].totalScore;
		}

		// En kötü grubu ele, en iyi grubu çoğalt
		if(self.groups.length > 1){
			// Grupları skora göre sırala
			var sortedGroups = self.groups.slice().sort(function(a,b){
				return a.totalScore - b.totalScore;
			});

			// En kötü grubu kaldır
			var worstGroup = sortedGroups[0];
			worstGroup.eliminate();

			// En iyi grubu çoğalt
			var bestGroup = sortedGroups[sortedGroups.length-1];
			var newGroup = new GroupAgent({
				index: self.groups.length,
				total: self.groups.length,
				strategies: bestGroup.strategies.slice(), // Kopyala
				container: self.groupsContainer
			});
			self.groups.push(newGroup);
		}

		// Bağlantıları yeniden oluştur
		self.createConnections();
	};

	self.reset = function(){
		GroupTournament.INITIAL_AGENTS = JSON.parse(JSON.stringify(GroupTournament.INITIAL_AGENTS));
		self.populateGroups();
	};

	self.isAutoPlaying = false;
	self.autoPlay = function(){
		if(self.isAutoPlaying) return;
		self.isAutoPlaying = true;
		_autoPlayLoop();
	};

	var _autoPlayLoop = function(){
		if(!self.isAutoPlaying) return;
		self.playOneRound();
		self.reproduce();
		if(self.groups.length > 0){
			requestAnimationFrame(_autoPlayLoop);
		} else {
			self.isAutoPlaying = false;
			publish("grouptournament/autoplay/stop");
		}
	};

	subscribe("grouptournament/autoplay/start", function(){
		self.autoPlay();
	});
	subscribe("grouptournament/autoplay/stop", function(){
		self.isAutoPlaying = false;
	});
	subscribe("grouptournament/step", function(){
		self.playOneRound();
		self.reproduce();
	});
	subscribe("grouptournament/reset", function(){
		self.reset();
	});

	self.populateGroups();
}

function GroupAgent(config){
	var self = this;
	self.index = config.index;
	self.total = config.total;
	self.strategies = config.strategies;
	self.container = config.container;
	
	self.totalScore = 0;
	self.roundScore = 0;
	self.lastDecision = null;
	self.hasCheated = false;
	
	self.sprite = new PIXI.Sprite();
	self.sprite.anchor.set(0.5);
	
	var angle = (self.index / self.total) * Math.PI * 2;
	var radius = 150;
	self.sprite.x = 250 + Math.cos(angle) * radius;
	self.sprite.y = 250 + Math.sin(angle) * radius;
	
	Loader.load("tournament_peep", function(spriteSheet){
		var dominant = self.getDominantStrategy();
		var frame = PEEP_METADATA[dominant] ? PEEP_METADATA[dominant].frame : 2;
		self.sprite.texture = spriteSheet.textures[frame];
		self.updateColor();
	});
	
	self.container.addChild(self.sprite);
	
	self.getDominantStrategy = function(){
		var counts = {};
		for(var i=0; i<self.strategies.length; i++){
			var strategy = self.strategies[i];
			counts[strategy] = (counts[strategy] || 0) + 1;
		}
		
		var dominant = "all_c";
		var maxCount = 0;
		for(var strategy in counts){
			if(counts[strategy] > maxCount){
				maxCount = counts[strategy];
				dominant = strategy;
			}
		}
		return dominant;
	};
	
	self.updateColor = function(){
		var dominant = self.getDominantStrategy();
		var color = PEEP_METADATA[dominant] ? PEEP_METADATA[dominant].color : "#FF75FF";
		self.sprite.tint = parseInt(color.replace("#", "0x"));
	};
	
	self.addPayoff = function(payoff){
		self.totalScore += payoff;
		self.roundScore += payoff;
	};

	self.eliminate = function(){
		self.container.removeChild(self.sprite);
	};

	self.kill = function(){
		self.container.removeChild(self.sprite);
	};
}

function GroupConnection(groupA, groupB, container){
	var self = this;
	self.groupA = groupA;
	self.groupB = groupB;
	self.container = container;

	self.graphic = new PIXI.Graphics();
	self.container.addChild(self.graphic);

	self.update = function(){
		self.graphic.clear();
		self.graphic.lineStyle(2, 0xCCCCCC, 0.5);
		self.graphic.moveTo(self.groupA.sprite.x, self.groupA.sprite.y);
		self.graphic.lineTo(self.groupB.sprite.x, self.groupB.sprite.y);
	};

	self.kill = function(){
		self.container.removeChild(self.graphic);
	};

	self.update();
}