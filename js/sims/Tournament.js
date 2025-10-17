// Debug counters for loop diagnosis
window.__DBG__ = window.__DBG__ || {};
__DBG__.rounds = (__DBG__.rounds||0);
__DBG__.decisions = 0;
__DBG__.phase = 'A';

function dbgOnRoundStart(sim){ 
	__DBG__.rounds++; 
	__DBG__.decisions = 0; 
	__DBG__.phase = 'A';
	console.debug("=== ROUND START #", __DBG__.rounds, "===");
}
function dbgOnDecision(){ 
	__DBG__.decisions++; 
}
function dbgOnRoundEnd(sim){
	console.debug("ROUND#", __DBG__.rounds, " decisions:", __DBG__.decisions,
	              " players:", sim.agents.length, " groups:", sim.groups?.size);
}
function dbgOnPhase(phase){
	__DBG__.phase = phase;
	console.debug("=== PHASE", phase, "===");
}

// Helper function to update AGENTS global variable from agents array
function _updateAGENTSFromAgents(agents){
	// Count each strategy type
	var strategyCounts = {};
	for(var i=0; i<agents.length; i++){
		var strategyName = agents[i].strategyName || agents[i].strategy;
		if(!strategyCounts[strategyName]) strategyCounts[strategyName] = 0;
		strategyCounts[strategyName]++;
	}
	
	// Update AGENTS array
	for(var i=0; i<AGENTS.length; i++){
		AGENTS[i].count = strategyCounts[AGENTS[i].strategy] || 0;
	}
	
	console.log("_updateAGENTSFromAgents: Updated AGENTS counts:", AGENTS.map(a => `${a.strategy}:${a.count}`).join(", "));
}

Tournament.resetGlobalVariables = function(){

	Tournament.SELECTION = 3; // 1 grup = 3 kişi
	Tournament.NUM_TURNS = 10;

	Tournament.INITIAL_AGENTS = [
		{strategy:"tft", count:3},     // 1 grup = 3 kişi
		{strategy:"all_d", count:3},   // 1 grup = 3 kişi
		{strategy:"all_c", count:3},   // 1 grup = 3 kişi
		{strategy:"grudge", count:3},  // 1 grup = 3 kişi
		{strategy:"prober", count:3},  // 1 grup = 3 kişi
		{strategy:"tf2t", count:3},    // 1 grup = 3 kişi
		{strategy:"pavlov", count:3},  // 1 grup = 3 kişi
		{strategy:"random", count:6}   // 2 grup = 6 kişi (toplam 27 kişi = 9 grup)
	];

	Tournament.FLOWER_CONNECTIONS = false;

	// Group settings
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
	self.groups = new Map(); // Group management

	// Group settings
	self.settings = {
		groupMode: Tournament.GROUP_MODE,
		groupSize: Tournament.GROUP_SIZE,
		homogeneousGroups: Tournament.HOMOGENEOUS_GROUPS,
		groupVoteSource: Tournament.GROUP_VOTE_SOURCE,
		groupFitnessMetric: Tournament.GROUP_FITNESS_METRIC
	};

	// Context for group decisions
	self.context = {
		settings: self.settings,
		groups: self.groups
	};

	// Debug logging for group decisions
	self.logGroupDecisions = function(){
		if (window.__GROUP_DEBUG__ && self.settings.groupMode) {
			console.log("=== GROUP DECISION LOG ===");
			console.log("Groups:", self.groups.size);
			for (const [groupId, group] of self.groups) {
				console.log(`Group ${groupId}:`, {
					strategy: group.strategy,
					members: group.members.length,
					color: group.color
				});
			}
		}
	};

	self.networkContainer = new PIXI.Container();
	self.agentsContainer = new PIXI.Container();
	app.stage.addChild(self.networkContainer);
	app.stage.addChild(self.agentsContainer);

	self.populateAgents = function(){

		// Clear EVERYTHING
		while(self.agents.length>0) self.agents[0].kill();
		
		// Convert to an array
		self.agents = _convertCountToArray(AGENTS);
		console.log("populateAgents: Created", self.agents.length, "agents");

		// Form groups if group mode is enabled
		if (self.settings.groupMode) {
			self.groups = formGroups(self.agents, {
				groupSize: self.settings.groupSize,
				homogeneous: self.settings.homogeneousGroups
			});
			console.log("populateAgents: Formed", self.groups.size, "groups");
		}

		// Put 'em in a ring
		var count = 0;
		for(var i=0; i<self.agents.length; i++){

			// Angle
			var angle = (i/self.agents.length)*Math.TAU - Math.TAU/4;

			// What kind of agent?
			var strategy = self.agents[i];
			var agent = new TournamentAgent({angle:angle, strategy:strategy, tournament:self});
			self.agentsContainer.addChild(agent.graphics);

			// Update group badge if in group mode
			if (self.settings.groupMode) {
				agent.updateGroupBadge();
			}

			// Remember me!
			self.agents[i] = agent;

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

	// Deterministic 4-Phase Evolutionary Loop
	self.agentsSorted = null;
	self.currentPhase = 'A';
	self.roundNumber = 0;
	
	self.playOneTournament = function(){
		dbgOnRoundStart(self);
		self.roundNumber++;
		
		// Update context with current groups
		self.context.groups = self.groups;
		
		// Log group decisions if debug mode is on
		if (window.__GROUP_DEBUG__ && self.settings.groupMode) {
			console.log("=== TOURNAMENT START (Round " + self.roundNumber + ") ===");
			self.logGroupDecisions();
		}
		
		// PHASE A: Group Voting
		dbgOnPhase('A');
		self.executePhaseA();
		
		// PHASE B: Round-Robin Matches
		dbgOnPhase('B');
		self.executePhaseB();
		
		// PHASE C: Group Selection
		dbgOnPhase('C');
		self.executePhaseC();
		
		// PHASE D: Cleanup
		dbgOnPhase('D');
		self.executePhaseD();
		
		// Log group scores after tournament
		if (window.__GROUP_DEBUG__ && self.settings.groupMode) {
			console.log("=== TOURNAMENT END (Round " + self.roundNumber + ") ===");
			const scores = computeGroupScores(self.groups, self.settings.groupFitnessMetric);
			console.log("Group Scores:", scores);
		}
		
		dbgOnRoundEnd(self);
	};
	
	// PHASE A: Group Voting - Each group decides C or D by majority
	self.executePhaseA = function(){
		if (!self.settings.groupMode) return;
		
		console.log("Phase A: Group voting for", self.groups.size, "groups");
		
		for (const [groupId, group] of self.groups) {
			// Each member votes based on their strategy preference
			const votes = group.members.map(member => {
				// For now, use their individual strategy decision
				// In the future, this could be based on strategyPreference
				return member.logic.play();
			});
			
			// Majority vote (2-1 or 3-0)
			const cooperators = votes.filter(v => v === PD.COOPERATE).length;
			const groupDecision = cooperators >= 2 ? PD.COOPERATE : PD.CHEAT;
			
			// Set currentAction for all group members
			group.members.forEach(member => {
				member.currentAction = groupDecision;
				member.roundScore = 0; // Reset round score
			});
			
			group.decision = groupDecision;
			
			if (window.__GROUP_DEBUG__) {
				console.log(`Group ${groupId} (${group.strategy}): votes=${votes}, decision=${groupDecision}`);
			}
		}
	};
	
	// PHASE B: Round-Robin Matches - Everyone plays everyone
	self.executePhaseB = function(){
		console.log("Phase B: Round-robin matches for", self.agents.length, "agents");
		
		// Reset all round scores
		for (var i = 0; i < self.agents.length; i++) {
			self.agents[i].roundScore = 0;
		}
		
		// Round-robin: everyone plays everyone else
		for (var i = 0; i < self.agents.length; i++) {
			var playerA = self.agents[i];
			for (var j = i + 1; j < self.agents.length; j++) {
				var playerB = self.agents[j];
				
				// Get decisions (from group voting or individual)
				var decisionA, decisionB;
				if (self.settings.groupMode) {
					decisionA = playerA.currentAction;
					decisionB = playerB.currentAction;
				} else {
					decisionA = playerA.logic.play();
					decisionB = playerB.logic.play();
				}
				
				// Apply noise if enabled
				if (Math.random() < PD.NOISE) {
					decisionA = (decisionA === PD.COOPERATE) ? PD.CHEAT : PD.COOPERATE;
				}
				if (Math.random() < PD.NOISE) {
					decisionB = (decisionB === PD.COOPERATE) ? PD.CHEAT : PD.COOPERATE;
				}
				
				// Get payoffs
				var payoffs = PD.getPayoffs(decisionA, decisionB);
				
				// Add to round scores
				playerA.roundScore += payoffs[0];
				playerB.roundScore += payoffs[1];
				
				// Add to total scores
				playerA.addPayoff(payoffs[0]);
				playerB.addPayoff(payoffs[1]);
				
				// Remember moves for individual strategies
				if (!self.settings.groupMode) {
					playerA.remember(decisionA, decisionB);
					playerB.remember(decisionB, decisionA);
				}
				
				dbgOnDecision();
				dbgOnDecision();
			}
		}
	};
	
	// PHASE C: Group Selection - Eliminate worst, reproduce best
	self.executePhaseC = function(){
		if (!self.settings.groupMode) {
			// Individual selection
			self.agentsSorted = _shuffleArray(self.agents.slice());
			self.agentsSorted.sort(function(a,b){ return a.coins-b.coins; });
			return;
		}
		
		console.log("Phase C: Group selection");
		
		// Calculate group scores
		const scores = computeGroupScores(self.groups, self.settings.groupFitnessMetric);
		
		if (scores.length <= 1) {
			console.log("Not enough groups for selection");
			return;
		}
		
		// Apply group selection
		self.groups = applyGroupSelection(self.agents, self.groups, self.settings);
		
		// Update context reference
		if (self.context) {
			self.context.groups = self.groups;
		}
		
		// Update AGENTS global variable
		_updateAGENTSFromAgents(self.agents);
	};
	
	// PHASE D: Cleanup - Reset for next round
	self.executePhaseD = function(){
		console.log("Phase D: Cleanup");
		
		// Reset round-specific data
		for (var i = 0; i < self.agents.length; i++) {
			var agent = self.agents[i];
			agent.currentAction = null;
			agent.roundScore = 0;
			
			// Reset logic for next round (if not in group mode)
			if (!self.settings.groupMode) {
				agent.resetLogic();
			}
		}
		
		// Clear group decisions
		if (self.settings.groupMode) {
			for (const [groupId, group] of self.groups) {
				group.decision = null;
			}
		}
	};

	// Get rid of X worst (now handled in Phase C)
	self.eliminateBottom = function(X){
		console.log("eliminateBottom called - this is now handled in Phase C");
		// Group selection is now handled in executePhaseC()
		// Individual selection is also handled there
		// This function is kept for compatibility but does nothing
	};
	self.actuallyRemoveAgent = function(agent){
		var index = self.agents.indexOf(agent);
		self.agents.splice(index,1);
	};

	// Reproduce the top X (now handled in Phase C)
	self.reproduceTop = function(X){
		console.log("reproduceTop called - this is now handled in Phase C");
		// Group selection is now handled in executePhaseC()
		// Individual selection is also handled there
		// This function is kept for compatibility but does nothing
	};

	// ANIMATE the PLAYING, ELIMINATING, or REPRODUCING
	var STAGE_REST = 0;
	var STAGE_PLAY = 1;
	var STAGE_ELIMINATE = 2;
	var STAGE_REPRODUCE = 3;
	var STAGE_PHASE_A = 4;
	var STAGE_PHASE_B = 5;
	var STAGE_PHASE_C = 6;
	var STAGE_PHASE_D = 7;
	self.STAGE = STAGE_REST;

	// AUTOPLAY
	self.isAutoPlaying = false;
	var _step = 0;
	var _nextStep = function(){
		if(self.STAGE!=STAGE_REST) return;
		// With the new 4-phase system, we just need to trigger play
		publish("tournament/play");
	};
	var _startAutoPlay = function(){
		console.log("Starting autoplay");
		self.isAutoPlaying = true;
		_nextStep();
	};
	var _stopAutoPlay = function(){
		console.log("Stopping autoplay");
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

		// PLAY! (Now executes the full 4-phase tournament)
		if(self.STAGE == STAGE_PLAY){
			console.log("Executing tournament in _tick");
			// Execute the complete tournament with all 4 phases
			self.playOneTournament();
			
			// Re-populate agents and network after group selection
			if (self.settings.groupMode) {
				console.log("Re-populating agents and network after tournament");
				self.populateAgents();
				self.createNetwork();
			}
			
			_playIndex = 0;
			_tweenTimer = 0;
			
			// If auto-playing, continue to next tournament after a delay
			if (self.isAutoPlaying) {
				console.log("Auto-playing: scheduling next tournament");
				setTimeout(function(){
					if (self.isAutoPlaying && self.STAGE == STAGE_REST) {
						console.log("Auto-playing: starting next tournament");
						self.STAGE = STAGE_PLAY;
					}
				}, 1000); // 1 second delay between tournaments
			}
			
			self.STAGE = STAGE_REST;
			publish("tournament/step/completed", ["play"]);
		}

		// ELIMINATE!
		if(self.STAGE == STAGE_ELIMINATE){
			self.eliminateBottom(Tournament.SELECTION);
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
				self.reproduceTop(Tournament.SELECTION);
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
		console.log("Starting tournament - STAGE_PLAY");
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
	self.roundScore = 0; // Score for current round
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

	// Group badge (if in group mode)
	var groupBadge = null;
	self.updateGroupBadge = function(){
		if (groupBadge) {
			g.removeChild(groupBadge);
		}
		
		if (self.groupId !== undefined && self.groupId !== null) {
			groupBadge = new PIXI.Graphics();
			groupBadge.beginFill(parseInt(pickGroupColor(self.groupId).replace("#", "0x")), 0.8);
			groupBadge.drawCircle(0, -30, 8);
			groupBadge.endFill();
			
			// Add group ID text
			var groupText = new PIXI.Text(self.groupId.toString(), {
				fontFamily: "Arial",
				fontSize: 10,
				fill: "#FFFFFF",
				align: "center"
			});
			groupText.anchor.set(0.5);
			groupBadge.addChild(groupText);
			
			g.addChild(groupBadge);
		}
	};

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
		console.log("updateScore called for agent", self.strategyName, "coins:", self.coins, "visible:", scoreText.visible);
	};
	self.updateScore();
	// Keep score text visible during tournament
	scoreText.visible = true;
	listen(self, "tournament/play", function(){
		scoreText.visible = true;
	});
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

