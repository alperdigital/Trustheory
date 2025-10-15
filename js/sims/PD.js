var PEEP_METADATA = {
	   tft: {frame:0, color:"#4089DD"}, 
	 all_d: {frame:1, color:"#52537F"},
	 all_c: {frame:2, color:"#FF75FF"},
	grudge: {frame:3, color:"#efc701"},
	prober: {frame:4, color:"#f6b24c"},
	  tf2t: {frame:5, color:"#88A8CE"},
	pavlov: {frame:6, color:"#86C448"},
	random: {frame:7, color:"#FF5E5E"}
};

var PD = {};
PD.COOPERATE = "COOPERATE";
PD.CHEAT = "CHEAT";

PD.PAYOFFS_DEFAULT = {
	P: 0, // punishment: neither of you get anything
	S: -1, // sucker: you put in coin, other didn't.
	R: 2, // reward: you both put 1 coin in, both got 3 back
	T: 3 // temptation: you put no coin, got 3 coins anyway
};

PD.PAYOFFS = JSON.parse(JSON.stringify(PD.PAYOFFS_DEFAULT));

subscribe("pd/editPayoffs", function(payoffs){
	PD.PAYOFFS = payoffs;
});
subscribe("pd/editPayoffs/P", function(value){ PD.PAYOFFS.P = value; });
subscribe("pd/editPayoffs/S", function(value){ PD.PAYOFFS.S = value; });
subscribe("pd/editPayoffs/R", function(value){ PD.PAYOFFS.R = value; });
subscribe("pd/editPayoffs/T", function(value){ PD.PAYOFFS.T = value; });
subscribe("pd/defaultPayoffs", function(){

	PD.PAYOFFS = JSON.parse(JSON.stringify(PD.PAYOFFS_DEFAULT));

	publish("pd/editPayoffs/P", [PD.PAYOFFS.P]);
	publish("pd/editPayoffs/S", [PD.PAYOFFS.S]);
	publish("pd/editPayoffs/R", [PD.PAYOFFS.R]);
	publish("pd/editPayoffs/T", [PD.PAYOFFS.T]);

});

PD.NOISE = 0;
subscribe("rules/noise",function(value){
	PD.NOISE = value;
});

PD.getPayoffs = function(move1, move2){
	var payoffs = PD.PAYOFFS;
	if(move1==PD.CHEAT && move2==PD.CHEAT) return [payoffs.P, payoffs.P]; // both punished
	if(move1==PD.COOPERATE && move2==PD.CHEAT) return [payoffs.S, payoffs.T]; // sucker - temptation
	if(move1==PD.CHEAT && move2==PD.COOPERATE) return [payoffs.T, payoffs.S]; // temptation - sucker
	if(move1==PD.COOPERATE && move2==PD.COOPERATE) return [payoffs.R, payoffs.R]; // both rewarded
};

PD.playOneGame = function(playerA, playerB, context){

	// Make your moves! Use group decision if context is provided
	var A, B;
	if (context && context.settings && context.settings.groupMode) {
		A = decideWithGroup(playerA, playerB, context);
		B = decideWithGroup(playerB, playerA, context);
	} else {
		A = playerA.play();
		B = playerB.play();
	}

	// Noise: random mistakes, flip around!
	if(Math.random()<PD.NOISE) A = ((A==PD.COOPERATE) ? PD.CHEAT : PD.COOPERATE);
	if(Math.random()<PD.NOISE) B = ((B==PD.COOPERATE) ? PD.CHEAT : PD.COOPERATE);
	
	// Get payoffs
	var payoffs = PD.getPayoffs(A,B);

	// Remember own & other's moves (or mistakes)
	playerA.remember(A, B);
	playerB.remember(B, A);

	// Add to scores (only in tournament?)
	playerA.addPayoff(payoffs[0]);
	playerB.addPayoff(payoffs[1]);

	// Return the payoffs...
	return payoffs;

};

PD.playRepeatedGame = function(playerA, playerB, turns, context){

	// I've never met you before, let's pretend
	playerA.resetLogic();
	playerB.resetLogic();

	// Play N turns
	var scores = {
		totalA:0,
		totalB:0,
		payoffs:[]
	};
	for(var i=0; i<turns; i++){
		var p = PD.playOneGame(playerA, playerB, context);
		scores.payoffs.push(p);
		scores.totalA += p[0];
		scores.totalB += p[1];
	}

	// Return the scores...
	return scores;

};

PD.playOneTournament = function(agents, turns, context){

	// Reset everyone's coins
	for(var i=0; i<agents.length; i++){
		agents[i].resetCoins();
	}

	// Round robin!
	for(var i=0; i<agents.length; i++){
		var playerA = agents[i];
		for(var j=i+1; j<agents.length; j++){
			var playerB = agents[j];
			PD.playRepeatedGame(playerA, playerB, turns, context);
		}	
	}

}

///////////////////////////////////////////////////////
// GROUP DECISION WRAPPER
///////////////////////////////////////////////////////

/**
 * Group-based decision wrapper
 * If groupMode is enabled, uses majority vote from group members
 * Otherwise, uses individual agent decision
 * @param {Object} player - The focal player making the decision
 * @param {Object} opponent - The opponent player
 * @param {Object} context - Game context (contains groups, settings, etc.)
 * @returns {string} Decision: PD.COOPERATE or PD.CHEAT
 */
function decideWithGroup(player, opponent, context) {
    // If group mode is disabled, use individual decision
    if (!context || !context.settings || !context.settings.groupMode) {
        return player.logic.play();
    }
    
    // Get the group for this player
    const groups = context.groups;
    if (!groups || !player.groupId) {
        return player.logic.play(); // Fallback to individual
    }
    
    const group = groups.get(player.groupId);
    if (!group || !group.members || group.members.length === 0) {
        return player.logic.play(); // Fallback to individual
    }
    
    // Collect votes from all group members
    const votes = [];
    for (const member of group.members) {
        let vote;
        
        if (context.settings.groupVoteSource === 'focalHistory') {
            // All members use focal player's history
            const focalLogic = new (window["Logic_" + player.strategyName])();
            // Copy focal player's memory to this logic
            if (player.logic.remember) {
                // This is a simplified approach - in a real implementation,
                // we'd need to properly transfer the memory state
                vote = focalLogic.play();
            } else {
                vote = focalLogic.play();
            }
        } else {
            // Each member uses their own history (perMemberHistory)
            vote = member.logic.play();
        }
        
        votes.push(vote);
    }
    
    // Count cooperation votes
    const cooperateVotes = votes.filter(vote => vote === PD.COOPERATE).length;
    const decision = (cooperateVotes >= 2) ? PD.COOPERATE : PD.CHEAT;
    
    // Debug logging
    if (window.__GROUP_DEBUG__) {
        console.debug({
            player: player.strategyName,
            opponent: opponent.strategyName,
            groupId: player.groupId,
            votes: votes,
            cooperateVotes: cooperateVotes,
            decision: decision,
            groupSize: group.members.length
        });
    }
    
    return decision;
};

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

function Logic_tft(){
	var self = this;
	var otherMove = PD.COOPERATE;
	self.play = function(){
		return otherMove;
	};
	self.remember = function(own, other){
		otherMove = other;
	};
}

function Logic_tf2t(){
	var self = this;
	var howManyTimesCheated = 0;
	self.play = function(){
		if(howManyTimesCheated>=2){
			return PD.CHEAT; // retaliate ONLY after two betrayals
		}else{
			return PD.COOPERATE;
		}
	};
	self.remember = function(own, other){
		if(other==PD.CHEAT){
			howManyTimesCheated++;
		}else{
			howManyTimesCheated = 0;
		}
	};
}

function Logic_grudge(){
	var self = this;
	var everCheatedMe = false;
	self.play = function(){
		if(everCheatedMe) return PD.CHEAT;
		return PD.COOPERATE;
	};
	self.remember = function(own, other){
		if(other==PD.CHEAT) everCheatedMe=true;
	};
}

function Logic_all_d(){
	var self = this;
	self.play = function(){
		return PD.CHEAT;
	};
	self.remember = function(own, other){
		// nah
	};
}

function Logic_all_c(){
	var self = this;
	self.play = function(){
		return PD.COOPERATE;
	};
	self.remember = function(own, other){
		// nah
	};
}

function Logic_random(){
	var self = this;
	self.play = function(){
		return (Math.random()>0.5 ? PD.COOPERATE : PD.CHEAT);
	};
	self.remember = function(own, other){
		// nah
	};
}

// Start off Cooperating
// Then, if opponent cooperated, repeat past move. otherwise, switch.
function Logic_pavlov(){
	var self = this;
	var myLastMove = PD.COOPERATE;
	self.play = function(){
		return myLastMove;
	};
	self.remember = function(own, other){
		myLastMove = own; // remember MISTAKEN move
		if(other==PD.CHEAT) myLastMove = ((myLastMove==PD.COOPERATE) ? PD.CHEAT : PD.COOPERATE); // switch!
	};
}

// TEST by Cooperate | Cheat | Cooperate | Cooperate
// If EVER retaliates, keep playing TFT
// If NEVER retaliates, switch to ALWAYS DEFECT
function Logic_prober(){

	var self = this;

	var moves = [PD.COOPERATE, PD.CHEAT, PD.COOPERATE, PD.COOPERATE];
	var everCheatedMe = false;

	var otherMove = PD.COOPERATE;
	self.play = function(){
		if(moves.length>0){
			// Testing phase
			var move = moves.shift();
			return move;
		}else{
			if(everCheatedMe){
				return otherMove; // TFT
			}else{
				return PD.CHEAT; // Always Cheat
			}
		}
	};
	self.remember = function(own, other){
		if(moves.length>0){
			if(other==PD.CHEAT) everCheatedMe=true; // Testing phase: ever retaliated?
		}
		otherMove = other; // for TFT
	};

}
