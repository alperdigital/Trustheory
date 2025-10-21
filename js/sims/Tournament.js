Tournament.resetGlobalVariables = function(){

	Tournament.SELECTION = 5;
	Tournament.NUM_TURNS = 10;

	Tournament.INITIAL_AGENTS = [
		{strategy:"tft", count:3},
		{strategy:"all_d", count:3},
		{strategy:"all_c", count:3},
		{strategy:"grudge", count:3},
		{strategy:"prober", count:3},
		{strategy:"tf2t", count:3},
		{strategy:"pavlov", count:3},
		{strategy:"random", count:4}
	];

	Tournament.FLOWER_CONNECTIONS = false;

	// Group mode settings (default: individual mode)
	Tournament.GROUP_MODE = false;
	Tournament.GROUP_SIZE = 3;
	Tournament.HOMOGENEOUS_GROUPS = true;
	Tournament.GROUP_VOTE_SOURCE = "perMemberHistory";
	Tournament.GROUP_FITNESS_METRIC = "avg_payoff";

	publish("pd/defaultPayoffs");

	PD.NOISE = 0;

};

Tournament.resetGlobalVariables();

subscribe("rules/evolution",function(value){
	Tournament.SELECTION = value;
});

subscribe("rules/turns",function(value){
	Tournament.NUM_TURNS = value;
});

// OH THAT'S SO COOL. Mostly C: Pavlov wins, Mostly D: tit for two tats wins (with 5% mistake!)
// ALSO, NOISE: tft vs all_d. no random: tft wins. low random: tf2t wins. high random: all_d wins. totally random: nobody wins

//////////////////////////////////////////////
//////////////////////////////////////////////

// REGULAR LOAD
Loader.addToManifest(Loader.manifest,{
	tournament_peep: "assets/tournament/tournament_peep.json",
	connection_flower: "assets/tournament/connection_flower.json",

	// SFX
	squeak: "assets/sounds/squeak.mp3",
	bonk: "assets/sounds/bonk.mp3"

});

function Tournament(config){

	var self = this;
	self.id = config.id;
	
	// APP
	var app = new PIXI.Application(500, 500, {transparent:true, resolution:2});
	self.dom = app.view;

	// DOM
	self.dom.className = "object";
	self.dom.style.width = 500;
	self.dom.style.height = 500;
	self.dom.style.left = config.x+"px";
	self.dom.style.top = config.y+"px";
	//self.dom.style.border = "1px solid rgba(0,0,0,0.2)";

	var _convertCountToArray = function(countList){
		var array = [];
		for(var i=0; i<AGENTS.length; i++){
			var A = AGENTS[i];
			var strategy = A.strategy;
			var count = A.count;
			for(var j=0; j<count; j++){
				array.push(strategy);
			}
		}
		return array;
	};

	self.agents = [];
	self.connections = [];

	self.networkContainer = new PIXI.Container();
	self.agentsContainer = new PIXI.Container();
	app.stage.addChild(self.networkContainer);
	app.stage.addChild(self.agentsContainer);

	self.populateAgents = function(){

		// Clear EVERYTHING
		while(self.agents.length>0) self.agents[0].kill();
		
		// Convert to an array
		var agentStrategies = _convertCountToArray(Tournament.INITIAL_AGENTS);
		self.agents = [];

		// Put 'em in a ring - CREATE AGENTS FIRST
		for(var i=0; i<agentStrategies.length; i++){

			// Angle
			var angle = (i/agentStrategies.length)*Math.TAU - Math.TAU/4;

			// What kind of agent?
			var strategy = agentStrategies[i];
			var agent = new TournamentAgent({angle:angle, strategy:strategy, tournament:self});
			self.agentsContainer.addChild(agent.graphics);

			// Remember me!
			self.agents.push(agent);

		}

		// Group mode: organize agents into groups AFTER creating agent objects
		if(Tournament.GROUP_MODE){
			self.groups = [];
			var groupSize = Tournament.GROUP_SIZE;
			
			// Shuffle agents for random group assignment
			var shuffledAgents = self.agents.slice();
			for(var i = shuffledAgents.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = shuffledAgents[i];
				shuffledAgents[i] = shuffledAgents[j];
				shuffledAgents[j] = temp;
			}
			
			// Create groups
			for(var g=0; g<shuffledAgents.length; g+=groupSize){
				var group = {
					members: [],
					groupStrategy: null,
					groupScore: 0
				};
				
				// Add members to group
				for(var m=0; m<groupSize && g+m<shuffledAgents.length; m++){
					group.members.push(shuffledAgents[g+m]);
				}
				
				// Determine group strategy (majority vote)
				var strategyCounts = {};
				for(var i=0; i<group.members.length; i++){
					var strategy = group.members[i].strategyName;
					strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
				}
				
				// Find majority strategy
				var maxCount = 0;
				var majorityStrategy = group.members[0].strategyName; // default
				for(var strategy in strategyCounts){
					if(strategyCounts[strategy] > maxCount){
						maxCount = strategyCounts[strategy];
						majorityStrategy = strategy;
					}
				}
				
				group.groupStrategy = majorityStrategy;
				self.groups.push(group);
			}
		}

		// (sort agents by depth)
		self.sortAgentsByDepth();

	};
	self.sortAgentsByDepth = function(){
		self.agentsContainer.children.sort(function(a,b){
			return a.y - b.y;
		});
	};

	self.createNetwork = function(){

		// Clear EVERYTHING
		while(self.connections.length>0) self.connections[0].kill();
		
		// Connect all of 'em
		for(var i=0; i<self.agents.length; i++){
			var playerA = self.agents[i];
			var flip = false;
			for(var j=i+1; j<self.agents.length; j++){
				var playerB = self.agents[j];
				var connection = new TournamentConnection({
					tournament: self,
					from: playerA,
					to: playerB,
					flower_flip: flip
				});
				self.networkContainer.addChild(connection.graphics);
				self.connections.push(connection);
				flip = !flip;
			}
		}

	};
	self.actuallyRemoveConnection = function(connection){
		var index = self.connections.indexOf(connection);
		self.connections.splice(index,1);
	};


	///////////////////////
	// RESET //////////////
	///////////////////////

	var AGENTS;
	self.reset = function(){

		// Agents & Network...
		AGENTS = JSON.parse(JSON.stringify(Tournament.INITIAL_AGENTS));
		self.populateAgents();
		self.createNetwork();

		// Animation...
		self.STAGE = STAGE_REST;
		_playIndex = 0;
		_tweenTimer = 0;

		// Stop autoplay!
		publish("tournament/autoplay/stop");
		_step = 0;

	};

	listen(self, "tournament/reset", self.reset);

	self.reset();

	////////////////////////////////////
	// SHOW MATCHES ////////////////////
	////////////////////////////////////

	self.playMatch = function(number){

		// GET OUR MATCH
		var matches = [];
		for(var a=0; a<self.agents.length; a++){
			for(var b=a+1; b<self.agents.length; b++){
				matches.push([self.agents[a], self.agents[b]]);
			}
		}
		var match = matches[number];

		// Highlight match
		self.dehighlightAllConnections();
		var connections = match[0].connections;
		var connection = connections.filter(function(c){
			if(c.from==match[0] && c.to==match[1]) return true;
			if(c.from==match[1] && c.to==match[0]) return true;
			return false;
		})[0];
		connection.highlight();

		// Actually PLAY the game -- HACK: HARD-CODE 10 ROUNDS
		var scores = PD.playRepeatedGame(match[0], match[1], 10);

		// Return ALL this data...
		return {
			charA: match[0].strategyName,
			charB: match[1].strategyName,
			scoreA: scores.totalA,
			scoreB: scores.totalB,
			payoffs: scores.payoffs
		}

	};
	self.dehighlightAllConnections = function(){
		for(var i=0; i<self.connections.length; i++) self.connections[i].dehighlight();
	};

	////////////////////////////////////
	// EVOLUTION ///////////////////////
	////////////////////////////////////

	// Play one tournament
	self.agentsSorted = null;
	self.playOneTournament = function(){
		if(Tournament.GROUP_MODE){
			// Group mode: play group-based tournament
			self.playGroupTournament();
		} else {
			// Individual mode: play individual tournament
			PD.playOneTournament(self.agents, Tournament.NUM_TURNS);
			self.agentsSorted = _shuffleArray(self.agents.slice());
			self.agentsSorted.sort(function(a,b){ return a.coins-b.coins; });
		}
	};

	// Group mode tournament
	self.playGroupTournament = function(){
		// Reset group scores
		for(var i=0; i<self.groups.length; i++){
			self.groups[i].groupScore = 0;
		}
		
		// Play matches between groups
		for(var g1=0; g1<self.groups.length; g1++){
			for(var g2=g1+1; g2<self.groups.length; g2++){
				var group1 = self.groups[g1];
				var group2 = self.groups[g2];
				
				// Play match between groups
				var scores = PD.playRepeatedGame(
					{strategyName: group1.groupStrategy, coins: 0},
					{strategyName: group2.groupStrategy, coins: 0},
					Tournament.NUM_TURNS
				);
				
				// Add scores to group totals
				group1.groupScore += scores.totalA;
				group2.groupScore += scores.totalB;
			}
		}
		
		// Sort groups by score (highest first)
		self.groups.sort(function(a,b){ return b.groupScore - a.groupScore; });
		
		// Update individual agent scores for display
		for(var i=0; i<self.groups.length; i++){
			var group = self.groups[i];
			for(var j=0; j<group.members.length; j++){
				var member = group.members[j];
				if(member && member.coins !== undefined){
					member.coins = group.groupScore;
					member.updateScore();
				}
			}
		}
	};

	// Get rid of X worst
	self.eliminateBottom = function(X){
		if(Tournament.GROUP_MODE){
			// Group mode: eliminate worst groups
			self.eliminateWorstGroups(X);
		} else {
			// Individual mode: eliminate worst agents
			var worst = self.agentsSorted.slice(0,X);

			// For each one, subtract from AGENTS count, and KILL.
			for(var i=0; i<worst.length; i++){
				var badAgent = worst[i];
				var config = Tournament.INITIAL_AGENTS.find(function(config){
					return config.strategy==badAgent.strategyName;
				});
				config.count--; // remove one
				badAgent.eliminate(); // ELIMINATE
			}
		}
	};

	// Group mode: eliminate worst groups
	self.eliminateWorstGroups = function(X){
		// Eliminate worst X groups (they are at the end after sorting)
		var groupsToEliminate = self.groups.slice(self.groups.length-X, self.groups.length);
		
		for(var i=0; i<groupsToEliminate.length; i++){
			var worstGroup = groupsToEliminate[i];
			
			// Remove group members from Tournament.INITIAL_AGENTS
			for(var j=0; j<worstGroup.members.length; j++){
				var member = worstGroup.members[j];
				var memberStrategy = member.strategyName;
				var config = Tournament.INITIAL_AGENTS.find(function(config){
					return config.strategy==memberStrategy;
				});
				if(config) config.count--;
			}
		}
		
		// Remove eliminated groups from groups array
		self.groups.splice(self.groups.length-X, X);
		
		// Recreate groups after elimination
		self.populateAgents();
	};
	self.actuallyRemoveAgent = function(agent){
		var index = self.agents.indexOf(agent);
		self.agents.splice(index,1);
	};

	// Reproduce the top X
	self.reproduceTop = function(X){
		if(Tournament.GROUP_MODE){
			// Group mode: reproduce best groups
			self.reproduceBestGroups(X);
		} else {
			// Individual mode: reproduce best agents
			var best = self.agentsSorted.slice(self.agentsSorted.length-X, self.agentsSorted.length);

			// For each one, add to Tournament.INITIAL_AGENTS count
			for(var i=0; i<best.length; i++){
				var goodAgent = best[i];
				var config = Tournament.INITIAL_AGENTS.find(function(config){
					return config.strategy==goodAgent.strategyName;
				});
				config.count++; // ADD one
			}

			// ADD agents, splicing right AFTER
			for(var i=0; i<best.length; i++){

				// Properties...
				var goodAgent = best[i];
				var angle = goodAgent.angle + 0.1;
				var strategy = goodAgent.strategyName;

				// Create agent!
				var agent = new TournamentAgent({angle:angle, strategy:strategy, tournament:self});
				self.agentsContainer.addChild(agent.graphics);

				// Splice RIGHT AFTER
				var index = self.agents.indexOf(goodAgent);
				self.agents.splice(index, 0, agent);

			}

			// What are the agents' GO-TO angles?
			for(var i=0; i<self.agents.length; i++){
				var agent = self.agents[i];
				var angle = (i/self.agents.length)*Math.TAU - Math.TAU/4;
				agent.gotoAngle = angle;
			}

			// ADD connections
			self.createNetwork();
		}
	};

	// Group mode: reproduce best groups
	self.reproduceBestGroups = function(X){
		// Get best X groups (they are at the beginning after sorting)
		var bestGroups = self.groups.slice(0, X);
		
		// For each best group, add members to Tournament.INITIAL_AGENTS
		for(var i=0; i<bestGroups.length; i++){
			var bestGroup = bestGroups[i];
			
			// Add group members to Tournament.INITIAL_AGENTS
			for(var j=0; j<bestGroup.members.length; j++){
				var member = bestGroup.members[j];
				var memberStrategy = member.strategyName;
				var config = Tournament.INITIAL_AGENTS.find(function(config){
					return config.strategy==memberStrategy;
				});
				if(config) config.count++;
			}
		}
		
		// Recreate groups after reproduction
		self.populateAgents();
	};

	// ANIMATE the PLAYING, ELIMINATING, or REPRODUCING
	var STAGE_REST = 0;
	var STAGE_PLAY = 1;
	var STAGE_ELIMINATE = 2;
	var STAGE_REPRODUCE = 3;
	self.STAGE = STAGE_REST;

	// AUTOPLAY
	self.isAutoPlaying = false;
	var _step = 0;
	var _nextStep = function(){
		if(self.STAGE!=STAGE_REST) return;
		if(_step==0) publish("tournament/play");
		if(_step==1) publish("tournament/eliminate");
		if(_step==2) publish("tournament/reproduce");
		_step = (_step+1)%3;
	};
	var _startAutoPlay = function(){
		self.isAutoPlaying = true;
		_nextStep();
		setTimeout(function(){
			if(self.isAutoPlaying) _startAutoPlay();
		},150);
	};
	var _stopAutoPlay = function(){
		self.isAutoPlaying = false;
	};
	listen(self, "tournament/autoplay/start", _startAutoPlay);
	listen(self, "tournament/autoplay/stop", _stopAutoPlay);
	listen(self, "tournament/step", function(){
		publish("tournament/autoplay/stop");
		_nextStep();
	});

	// ANIMATE
	var _playIndex = 0;
	var _tweenTimer = 0;
	var _tick = function(delta){

		// Tick
		Tween.tick();

		// PLAY!
		if(self.STAGE == STAGE_PLAY){
			if(Tournament.GROUP_MODE){
				// Group mode: play group tournament directly
				self.playGroupTournament();
				_playIndex = 0;
				_tweenTimer = 0;
				self.STAGE = STAGE_REST;
				publish("tournament/step/completed", ["play"]);
			} else {
				// Individual mode: play individual tournament
				if(_playIndex>0 && _playIndex<self.agents.length+1) self.agents[_playIndex-1].dehighlightConnections();
				if(_playIndex>1 && _playIndex<self.agents.length+2) self.agents[_playIndex-2].dehighlightConnections();
				if(_playIndex<self.agents.length){
					self.agents[_playIndex].highlightConnections();
					_playIndex += self.isAutoPlaying ? 2 : 1;
				}else{
					self.playOneTournament(); // FOR REAL, NOW.
					_playIndex = 0;
					_tweenTimer = 0;
					self.STAGE = STAGE_REST;
					publish("tournament/step/completed", ["play"]);
				}
			}
		}

		// ELIMINATE!
		if(self.STAGE == STAGE_ELIMINATE){
			if(Tournament.GROUP_MODE){
				// Group mode: eliminate worst groups
				self.eliminateWorstGroups(1); // Eliminate 1 worst group
			} else {
				// Individual mode: eliminate worst agents
				self.eliminateBottom(Tournament.SELECTION);
			}
			_tweenTimer++;
			if(_tweenTimer==_s(0.3) || self.isAutoPlaying){
				_tweenTimer = 0;
				self.STAGE = STAGE_REST;
				publish("tournament/step/completed", ["eliminate"]);
			}
		}

		// REPRODUCE!
		if(self.STAGE == STAGE_REPRODUCE){

			// Start
			if(_tweenTimer==0){
				if(Tournament.GROUP_MODE){
					// Group mode: reproduce best groups
					self.reproduceBestGroups(1); // Reproduce 1 best group
				} else {
					// Individual mode: reproduce best agents
					self.reproduceTop(Tournament.SELECTION);
				}
			}

			// Middle...
			_tweenTimer += self.isAutoPlaying ? 0.15 : 0.05;
			if(_tweenTimer>1) _tweenTimer=1;
			for(var i=0;i<self.agents.length;i++){
				var a = self.agents[i];
				a.tweenAngle(_tweenTimer);
				a.updatePosition();
			}
			self.sortAgentsByDepth();
			for(var i=0;i<self.connections.length;i++) self.connections[i].updateGraphics();

		// End
		if(_tweenTimer>=1){
			_tweenTimer = 0;
			self.STAGE = STAGE_REST;
			
			// Reset all agent scores after reproduction
			for(var i=0; i<self.agents.length; i++){
				self.agents[i].coins = 0;
				self.agents[i].updateScore();
			}
			
			// Reset group scores in group mode
			if(Tournament.GROUP_MODE && self.groups){
				for(var i=0; i<self.groups.length; i++){
					self.groups[i].groupScore = 0;
				}
			}
			
			publish("tournament/step/completed", ["reproduce"]);
		}

		}

	};
	app.ticker.add(_tick);

	// PLAY A TOURNAMENT
	self._startPlay = function(){
		if(!self.isAutoPlaying){
			Loader.sounds.coin_get.volume(0.1).play();
		}
		self.STAGE=STAGE_PLAY;
	};
	listen(self, "tournament/play", self._startPlay);
	self._startEliminate = function(){
		if(!self.isAutoPlaying){
			Loader.sounds.squeak.volume(0.4).play();
		}
		self.STAGE=STAGE_ELIMINATE;
	};
	listen(self, "tournament/eliminate", self._startEliminate);
	self._startReproduce = function(){
		if(!self.isAutoPlaying){
			Loader.sounds.bonk.volume(0.3).play();
		}
		self.STAGE=STAGE_REPRODUCE;
	};
	listen(self, "tournament/reproduce", self._startReproduce);

	// Add...
	self.add = function(){
		_add(self);
	};

	// Remove...
	self.remove = function(){
		_stopAutoPlay();
		for(var i=0; i<self.agents.length; i++) unlisten(self.agents[i]);
		unlisten(self);
		app.destroy();
		_remove(self);
	};

}

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

function TournamentConnection(config){

	var self = this;
	self.config = config;
	self.tournament = config.tournament;

	// Connect from & to
	self.from = config.from;
	self.to = config.to;
	self.from.connections.push(self);
	self.to.connections.push(self);

	// Graphics!
	var g;
	if(Tournament.FLOWER_CONNECTIONS){
		g = _makeMovieClip("connection_flower");
		g.anchor.x = 0;
		g.anchor.y = 0;
		g.scale.set(0.5);
	}else{
		g = _makeMovieClip("connection");
		g.anchor.x = 0;
		g.anchor.y = 0.5;
		g.height = 1;
	}
	self.graphics = g;
	var _flowerLong = false;
	var _updateFlower = function(highlight){
		var frame = 0;
		if(highlight) frame+=2;
		if(_flowerLong) frame+=1;
		g.gotoAndStop(frame);
	};
	if(config.flower_flip){
		g.scale.y *= -1;
	}

	// Highlight or no?
	self.highlight = function(){
		if(Tournament.FLOWER_CONNECTIONS){
			_updateFlower(true);
		}else{
			g.height = 3;
			g.gotoAndStop(1);
		}
	};
	self.dehighlight = function(){
		if(Tournament.FLOWER_CONNECTIONS){
			_updateFlower(false);
		}else{
			g.height = 1;
			g.gotoAndStop(0);
		}
	};
	self.dehighlight();

	// Stretch dat bad boy
	self.updateGraphics = function(){
		
		var f = self.from.graphics;
		var t = self.to.graphics;
		var dx = t.x-f.x;
		var dy = t.y-f.y;
		var a = Math.atan2(dy,dx);
		var dist = Math.sqrt(dx*dx+dy*dy);

		g.x = f.x; 
		g.y = f.y;

		if(Tournament.FLOWER_CONNECTIONS){
			if(dist<250){
				_flowerLong = false;
				if(config.flower_flip){
					g.rotation = a+Math.TAU/10;
				}else{
					g.rotation = a-Math.TAU/10;
				}
			}else{
				_flowerLong = true;
				if(config.flower_flip){
					g.rotation = a+Math.TAU/5;
				}else{
					g.rotation = a-Math.TAU/5;
				}
			}
			_updateFlower();
		}else{
			g.rotation = a;
			g.width = dist;
		}

	};
	self.updateGraphics();

	// KILL
	self.IS_DEAD = false;
	self.kill = function(){
		if(self.IS_DEAD) return;
		self.IS_DEAD = true;
		self.graphics.parent.removeChild(self.graphics); // remove self's graphics
		self.tournament.actuallyRemoveConnection(self);
	};

};

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

function TournamentAgent(config){

	var self = this;
	self.strategyName = config.strategy;
	self.tournament = config.tournament;
	self.angle = config.angle;
	self.gotoAngle = self.angle;

	// Connections
	self.connections = [];
	self.highlightConnections = function(){
		for(var i=0;i<self.connections.length;i++) self.connections[i].highlight();
	};
	self.dehighlightConnections = function(){
		for(var i=0;i<self.connections.length;i++) self.connections[i].dehighlight();
	};
	self.clearConnections = function(){
		for(var i=0;i<self.connections.length;i++){
			self.connections[i].kill();
		}
		self.connections = [];
	};

	// Number of coins
	self.coins = 0;
	self.addPayoff = function(payoff){
		self.coins += payoff;
		self.updateScore();
	};

	// What's the image?
	var g = new PIXI.Container();
	self.graphics = g;

	// Body!
	var body = _makeMovieClip("tournament_peep");
	body.gotoAndStop(PEEP_METADATA[config.strategy].frame);
	body.scale.set(0.5);
	body.anchor.x = 0.5;
	body.anchor.y = 0.75;
	g.addChild(body);

	// Score!
	var textStyle = new PIXI.TextStyle({
	    fontFamily: "FuturaHandwritten",
	    fontSize: 16,
	    fill: "#444"
	});
	var scoreText = new PIXI.Text("", textStyle);
	scoreText.anchor.x = 0.5;
	g.addChild(scoreText);
	self.updateScore = function(){
		scoreText.visible = true;
		scoreText.text = self.coins;
	};
	self.updateScore();
	scoreText.visible = false;
	listen(self, "tournament/reproduce",function(){
		scoreText.visible = false;
	});

	// What's the play logic?
	var LogicClass = window["Logic_"+self.strategyName];
	self.logic = new LogicClass();
	self.play = function(){
		return self.logic.play();
	};
	self.remember = function(own, other){
		self.logic.remember(own, other);
	};

	// Reset!
	self.resetCoins = function(){
		self.coins = 0; // reset coins;
		self.updateScore();
	}
	self.resetLogic = function(){
		self.logic = new LogicClass(); // reset logic
	};

	// Tween angle...
	self.tweenAngle = function(t){
		self.angle = self.gotoAngle*t + self.angle*(1-t);
	};
	self.updatePosition = function(){
		g.x = Math.cos(self.angle)*200 + 250;
		g.y = Math.sin(self.angle)*200 + 265;
		scoreText.x = -Math.cos(self.angle)*40;
		scoreText.y = -Math.sin(self.angle)*48 - 22;
		body.scale.x = Math.abs(body.scale.x) * ((Math.cos(self.angle)<0) ? 1 : -1);
	};
	self.updatePosition();

	// ELIMINATE
	self.eliminate = function(){

		// INSTA-KILL ALL CONNECTIONS
		self.clearConnections();
		scoreText.visible = false;

		// Tween -- DIE!
		var duration = self.tournament.isAutoPlaying ? 0.13 : 0.3;
		Tween_get(g).to({
			alpha: 0,
			x: g.x+Math.random()*20-10,
			y: g.y+Math.random()*20-10,
			rotation: Math.random()*0.5-0.25
		}, _s(duration), Ease.circOut).call(self.kill);

	};

	// KILL (actually insta-remove)
	self.kill = function(){

		// Remove ANY tweens
		Tween.removeTweens(g);
		
		// NOW remove graphics.
		g.parent.removeChild(g);

		// AND remove self from tournament
		self.tournament.actuallyRemoveAgent(self);

		// Unsub
		unlisten(self);

	};

}

