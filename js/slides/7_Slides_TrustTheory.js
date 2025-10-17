/**
 * TrustTheory Bölüm 7 – TrustTheory
 * Yeni grup çoğunluğu simülasyonu
 */

SLIDES.push({

	id: "trusttheory",
	onstart: function(self){

		// Create container for the new simulation
		const container = document.createElement('div');
		container.id = 'trust7-container';
		container.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: #f0f0f0;
			z-index: 1000;
		`;
		
		// Add to slideshow
		self.dom.appendChild(container);
		
		// Initialize the TrustTheory simulation
		initTrust7(container);
		
		// Store reference for cleanup
		self.trust7Container = container;
		self.trust7Simulation = window.trust7Simulation;
		
		console.log('TrustTheory Bölüm 7 initialized');
	},
	
	onend: function(self){
		// Clean up when leaving the slide
		if (self.trust7Container) {
			self.dom.removeChild(self.trust7Container);
			self.trust7Container = null;
		}
		
		if (self.trust7Simulation) {
			// Stop any running simulations
			if (self.trust7Simulation.stop) {
				self.trust7Simulation.stop();
			}
			self.trust7Simulation = null;
		}
		
		console.log('TrustTheory Bölüm 7 cleaned up');
	}

});

/**
 * Initialize the TrustTheory simulation
 * @param {HTMLElement} container - Container element for the simulation
 */
function initTrust7(container) {
	// Create the main simulation container
	const simContainer = document.createElement('div');
	simContainer.id = 'trust7-simulation';
	simContainer.style.cssText = `
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	`;
	
	// Create UI container
	const uiContainer = document.createElement('div');
	uiContainer.id = 'trust7-ui';
	uiContainer.style.cssText = `
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 1001;
	`;
	
	// Create visualization container
	const vizContainer = document.createElement('div');
	vizContainer.id = 'trust7-visualization';
	vizContainer.style.cssText = `
		flex: 1;
		position: relative;
		background: #f8f8f8;
	`;
	
	simContainer.appendChild(uiContainer);
	simContainer.appendChild(vizContainer);
	container.appendChild(simContainer);
	
	// Initialize the simulation modules
	// Note: Since we're using ES modules, we need to load them dynamically
	// For now, we'll create a simplified version that works with the existing system
	
	// Create a simple simulation state
	const state = {
		round: 1,
		phase: 'SHOW',
		running: false,
		players: [],
		groups: [],
		idSeq: 1,
		config: {
			T: 5, R: 3, P: 1, S: 0,
			kEliminate: 1,
			totalRounds: 50,
			mistakePercent: 0,
			population: {
				ALL_C: 3,
				ALL_D: 3,
				PROB_P: { count: 4, p: 0.6 }
			},
			stepIntervalMs: 350
		},
		ui: {
			showScores: false
		}
	};
	
	// Initialize population
	initPopulation(state);
	
	// Create UI controls
	createSimpleUI(uiContainer, state);
	
	// Create PIXI visualization
	createPIXIVisualization(vizContainer, state);
	
	// Store global reference
	window.trust7Simulation = {
		state: state,
		container: simContainer,
		uiContainer: uiContainer,
		vizContainer: vizContainer,
		stop: function() {
			state.running = false;
		}
	};
	
	console.log('TrustTheory simulation initialized with', state.players.length, 'players and', state.groups.length, 'groups');
}

/**
 * Initialize population with 30 players in 10 groups
 * @param {Object} state - Simulation state
 */
function initPopulation(state) {
	state.players = [];
	state.groups = [];
	state.idSeq = 1;
	
	// Create groups based on population configuration
	const config = state.config.population;
	
	// ALL_C groups
	for (let i = 0; i < config.ALL_C; i++) {
		createGroup(state, 'ALL_C');
	}
	
	// ALL_D groups
	for (let i = 0; i < config.ALL_D; i++) {
		createGroup(state, 'ALL_D');
	}
	
	// PROB_P groups
	for (let i = 0; i < config.PROB_P.count; i++) {
		createGroup(state, 'PROB_P');
	}
	
	console.log('Population initialized:', state.players.length, 'players,', state.groups.length, 'groups');
}

/**
 * Create a group with 3 players
 * @param {Object} state - Simulation state
 * @param {string} behavior - Group behavior type
 */
function createGroup(state, behavior) {
	const groupId = state.idSeq++;
	const group = {
		id: groupId,
		behavior: behavior,
		memberIds: [],
		decision: 'C',
		roundScore: 0,
		totalScore: 0
	};
	
	// Create 3 players for this group
	for (let i = 0; i < 3; i++) {
		const playerId = state.idSeq++;
		const player = {
			id: playerId,
			groupId: groupId,
			behavior: behavior,
			intended: behavior === 'ALL_C' ? 'C' : behavior === 'ALL_D' ? 'D' : 'C',
			action: 'C',
			roundScore: 0,
			totalScore: 0
		};
		
		state.players.push(player);
		group.memberIds.push(playerId);
	}
	
	state.groups.push(group);
}

/**
 * Create simple UI controls
 * @param {HTMLElement} container - UI container
 * @param {Object} state - Simulation state
 */
function createSimpleUI(container, state) {
	const panel = document.createElement('div');
	panel.style.cssText = `
		background: rgba(255, 255, 255, 0.95);
		border: 2px solid #333;
		border-radius: 10px;
		padding: 15px;
		font-family: Arial, sans-serif;
		font-size: 14px;
		width: 300px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.3);
	`;
	
	// Title
	const title = document.createElement('h3');
	title.textContent = 'Bölüm 7 – TrustTheory';
	title.style.cssText = 'margin: 0 0 15px 0; text-align: center; color: #333;';
	panel.appendChild(title);
	
	// Status display
	const status = document.createElement('div');
	status.id = 'trust7-status';
	status.style.cssText = 'margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 5px;';
	status.innerHTML = `
		<div><strong>Tur:</strong> <span id="trust7-round">${state.round}</span></div>
		<div><strong>Faz:</strong> <span id="trust7-phase">${state.phase}</span></div>
		<div><strong>Oyuncular:</strong> <span id="trust7-players">${state.players.length}</span></div>
		<div><strong>Gruplar:</strong> <span id="trust7-groups">${state.groups.length}</span></div>
	`;
	panel.appendChild(status);
	
	// Control buttons
	const buttonContainer = document.createElement('div');
	buttonContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px;';
	
	// ADIM button
	const stepButton = createButton('ADIM', () => {
		advancePhase(state);
		updateUI(state);
		updateVisualization(state);
	});
	buttonContainer.appendChild(stepButton);
	
	// BAŞLA button
	const startButton = createButton('BAŞLA', () => {
		state.running = true;
		startAutoPlay(state);
		updateUI(state);
	});
	buttonContainer.appendChild(startButton);
	
	// DURDUR button
	const stopButton = createButton('DURDUR', () => {
		state.running = false;
		updateUI(state);
	});
	buttonContainer.appendChild(stopButton);
	
	// SIFIRLA button
	const resetButton = createButton('SIFIRLA', () => {
		state.running = false;
		state.round = 1;
		state.phase = 'SHOW';
		state.ui.showScores = false;
		initPopulation(state);
		updateUI(state);
		updateVisualization(state);
	});
	buttonContainer.appendChild(resetButton);
	
	panel.appendChild(buttonContainer);
	
	// Configuration section
	const configSection = document.createElement('div');
	configSection.innerHTML = `
		<h4 style="margin: 0 0 10px 0; color: #555;">Konfigürasyon</h4>
		<div style="font-size: 12px;">
			<div><strong>Ödüller:</strong> T=${state.config.T}, R=${state.config.R}, P=${state.config.P}, S=${state.config.S}</div>
			<div><strong>Elenen Grup:</strong> ${state.config.kEliminate}</div>
			<div><strong>Hata Olasılığı:</strong> ${state.config.mistakePercent}%</div>
		</div>
	`;
	panel.appendChild(configSection);
	
	container.appendChild(panel);
	
	// Store references for updates
	state.uiElements = {
		round: document.getElementById('trust7-round'),
		phase: document.getElementById('trust7-phase'),
		players: document.getElementById('trust7-players'),
		groups: document.getElementById('trust7-groups')
	};
}

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Button element
 */
function createButton(text, onClick) {
	const button = document.createElement('button');
	button.textContent = text;
	button.style.cssText = `
		padding: 8px 12px;
		border: 1px solid #333;
		border-radius: 4px;
		background: #f0f0f0;
		cursor: pointer;
		font-size: 12px;
		flex: 1;
		min-width: 60px;
	`;
	button.addEventListener('click', onClick);
	return button;
}

/**
 * Create PIXI visualization
 * @param {HTMLElement} container - Visualization container
 * @param {Object} state - Simulation state
 */
function createPIXIVisualization(container, state) {
	// Check if PIXI is available
	if (typeof PIXI === 'undefined') {
		console.warn('PIXI.js not available, using simple HTML visualization');
		createSimpleVisualization(container, state);
		return;
	}
	
	// Create PIXI application
	const app = new PIXI.Application({
		width: container.clientWidth || 800,
		height: container.clientHeight || 600,
		backgroundColor: 0xf8f8f8,
		antialias: true
	});
	
	container.appendChild(app.view);
	
	// Store reference
	state.pixiApp = app;
	
	// Create initial visualization
	updateVisualization(state);
}

/**
 * Create simple HTML visualization as fallback
 * @param {HTMLElement} container - Visualization container
 * @param {Object} state - Simulation state
 */
function createSimpleVisualization(container, state) {
	const title = document.createElement('h2');
	title.textContent = 'Bölüm 7 – TrustTheory Simülasyonu';
	title.style.cssText = 'text-align: center; margin: 20px 0; color: #333;';
	container.appendChild(title);
	
	const groupsContainer = document.createElement('div');
	groupsContainer.id = 'trust7-groups-container';
	groupsContainer.style.cssText = `
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 20px;
		padding: 20px;
		max-width: 1000px;
		margin: 0 auto;
	`;
	container.appendChild(groupsContainer);
	
	// Store reference for updates
	state.htmlContainer = groupsContainer;
	
	// Create initial visualization
	updateSimpleVisualization(state);
}

/**
 * Update the visualization
 * @param {Object} state - Simulation state
 */
function updateVisualization(state) {
	if (state.pixiApp) {
		updatePIXIVisualization(state);
	} else if (state.htmlContainer) {
		updateSimpleVisualization(state);
	}
}

/**
 * Update PIXI visualization
 * @param {Object} state - Simulation state
 */
function updatePIXIVisualization(state) {
	if (!state.pixiApp) return;
	
	const app = state.pixiApp;
	
	// Clear existing content
	app.stage.removeChildren();
	
	// Create title
	const title = new PIXI.Text('Bölüm 7 – TrustTheory Simülasyonu', {
		fontFamily: 'Arial',
		fontSize: 24,
		fill: 0x333333,
		align: 'center'
	});
	title.x = app.screen.width / 2 - title.width / 2;
	title.y = 20;
	app.stage.addChild(title);
	
	// Create group visualizations
	const groupsPerRow = 5;
	const groupSpacing = 150;
	const startX = 100;
	const startY = 100;
	
	for (let i = 0; i < state.groups.length; i++) {
		const group = state.groups[i];
		const row = Math.floor(i / groupsPerRow);
		const col = i % groupsPerRow;
		
		const x = startX + col * groupSpacing;
		const y = startY + row * 200;
		
		// Create group container
		const groupContainer = new PIXI.Container();
		groupContainer.x = x;
		groupContainer.y = y;
		
		// Create group background
		const groupBg = new PIXI.Graphics();
		groupBg.beginFill(getGroupColor(group.behavior));
		groupBg.drawRoundedRect(-50, -50, 100, 100, 10);
		groupBg.endFill();
		groupBg.alpha = 0.3;
		groupContainer.addChild(groupBg);
		
		// Create group border
		const groupBorder = new PIXI.Graphics();
		groupBorder.lineStyle(2, getGroupColor(group.behavior), 1);
		groupBorder.drawRoundedRect(-50, -50, 100, 100, 10);
		groupContainer.addChild(groupBorder);
		
		// Create group label
		const groupLabel = new PIXI.Text(`Grup ${group.id}`, {
			fontFamily: 'Arial',
			fontSize: 12,
			fill: 0x333333,
			align: 'center'
		});
		groupLabel.x = -groupLabel.width / 2;
		groupLabel.y = -60;
		groupContainer.addChild(groupLabel);
		
		// Create behavior label
		const behaviorLabel = new PIXI.Text(group.behavior, {
			fontFamily: 'Arial',
			fontSize: 10,
			fill: 0x666666,
			align: 'center'
		});
		behaviorLabel.x = -behaviorLabel.width / 2;
		behaviorLabel.y = 60;
		groupContainer.addChild(behaviorLabel);
		
		// Create group score label if scores are shown
		if (state.ui.showScores) {
			const scoreLabel = new PIXI.Text(`Toplam: ${group.totalScore}`, {
				fontFamily: 'Arial',
				fontSize: 10,
				fill: 0x000000,
				align: 'center'
			});
			scoreLabel.x = -scoreLabel.width / 2;
			scoreLabel.y = 75;
			groupContainer.addChild(scoreLabel);
		}
		
		// Create players for this group
		for (let j = 0; j < group.memberIds.length; j++) {
			const memberId = group.memberIds[j];
			const player = state.players.find(p => p.id === memberId);
			
			if (player) {
				const playerX = -20 + j * 20;
				const playerY = -20 + j * 20;
				
				// Create player circle
				const playerCircle = new PIXI.Graphics();
				playerCircle.beginFill(getPlayerColor(player.action));
				playerCircle.drawCircle(0, 0, 8);
				playerCircle.endFill();
				playerCircle.x = playerX;
				playerCircle.y = playerY;
				
				// Create player border
				const playerBorder = new PIXI.Graphics();
				playerBorder.lineStyle(1, 0x000000, 1);
				playerBorder.drawCircle(0, 0, 8);
				playerBorder.x = playerX;
				playerBorder.y = playerY;
				
				// Create player score label if scores are shown
				if (state.ui.showScores) {
					const playerScoreLabel = new PIXI.Text(player.totalScore.toString(), {
						fontFamily: 'Arial',
						fontSize: 8,
						fill: 0x000000,
						align: 'center'
					});
					playerScoreLabel.x = playerX - playerScoreLabel.width / 2;
					playerScoreLabel.y = playerY + 12;
					groupContainer.addChild(playerScoreLabel);
				}
				
				groupContainer.addChild(playerCircle);
				groupContainer.addChild(playerBorder);
			}
		}
		
		app.stage.addChild(groupContainer);
	}
}

/**
 * Get color for group behavior
 * @param {string} behavior - Group behavior type
 * @returns {number} Color value
 */
function getGroupColor(behavior) {
	switch (behavior) {
		case 'ALL_C':
			return 0x4CAF50; // Green
		case 'ALL_D':
			return 0xF44336; // Red
		case 'PROB_P':
			return 0x2196F3; // Blue
		default:
			return 0x9E9E9E; // Gray
	}
}

/**
 * Get color for player action
 * @param {string} action - Player action ('C' or 'D')
 * @returns {number} Color value
 */
function getPlayerColor(action) {
	switch (action) {
		case 'C':
			return 0x4CAF50; // Green
		case 'D':
			return 0xF44336; // Red
		default:
			return 0x9E9E9E; // Gray
	}
}

/**
 * Advance to the next phase
 * @param {Object} state - Simulation state
 */
function advancePhase(state) {
	switch (state.phase) {
		case 'SHOW':
			// Phase 1: Show scores
			state.ui.showScores = true;
			state.phase = 'ELIMINATE';
			console.log('Phase: SHOW → ELIMINATE');
			break;
			
		case 'ELIMINATE':
			// Phase 2: Eliminate worst groups
			eliminateWorstGroups(state);
			state.phase = 'REPLICATE';
			console.log('Phase: ELIMINATE → REPLICATE');
			break;
			
		case 'REPLICATE':
			// Phase 3: Hide scores and prepare for next round
			state.ui.showScores = false;
			cleanupRound(state);
			console.log('Phase: REPLICATE → SHOW (next round)');
			break;
			
		default:
			console.error('Unknown phase:', state.phase);
			state.phase = 'SHOW';
	}
}

/**
 * Eliminate worst groups
 * @param {Object} state - Simulation state
 */
function eliminateWorstGroups(state) {
	// Sort groups by total score (worst first)
	const sortedGroups = [...state.groups].sort((a, b) => {
		if (a.totalScore !== b.totalScore) {
			return a.totalScore - b.totalScore;
		}
		// Tie-breaking: smallest groupId first
		return a.id - b.id;
	});
	
	// Get the k worst groups
	const groupsToEliminate = sortedGroups.slice(0, state.config.kEliminate);
	const eliminatedIds = new Set(groupsToEliminate.map(g => g.id));
	
	// Remove eliminated groups
	state.groups = state.groups.filter(group => !eliminatedIds.has(group.id));
	
	// Remove players from eliminated groups
	state.players = state.players.filter(player => !eliminatedIds.has(player.groupId));
	
	console.log(`Eliminated ${groupsToEliminate.length} groups:`, groupsToEliminate.map(g => ({
		id: g.id,
		behavior: g.behavior,
		totalScore: g.totalScore
	})));
	
	// Replicate best groups
	replicateBestGroups(state);
}

/**
 * Replicate best groups
 * @param {Object} state - Simulation state
 */
function replicateBestGroups(state) {
	// Sort groups by total score (best first)
	const sortedGroups = [...state.groups].sort((a, b) => {
		if (a.totalScore !== b.totalScore) {
			return b.totalScore - a.totalScore;
		}
		// Tie-breaking: largest groupId first
		return b.id - a.id;
	});
	
	// Get the k best groups
	const groupsToReplicate = sortedGroups.slice(0, state.config.kEliminate);
	
	// Replicate each group
	for (const originalGroup of groupsToReplicate) {
		const newGroupId = state.idSeq++;
		const newGroup = {
			id: newGroupId,
			behavior: originalGroup.behavior,
			memberIds: [],
			decision: originalGroup.decision,
			roundScore: 0,
			totalScore: 0
		};
		
		// Create 3 new players for this group
		for (let i = 0; i < 3; i++) {
			const newPlayerId = state.idSeq++;
			const newPlayer = {
				id: newPlayerId,
				groupId: newGroupId,
				behavior: originalGroup.behavior,
				intended: originalGroup.behavior === 'ALL_C' ? 'C' : 
						 originalGroup.behavior === 'ALL_D' ? 'D' : 'C',
				action: originalGroup.decision,
				roundScore: 0,
				totalScore: 0
			};
			
			state.players.push(newPlayer);
			newGroup.memberIds.push(newPlayerId);
		}
		
		state.groups.push(newGroup);
	}
	
	console.log(`Replicated ${groupsToReplicate.length} groups:`, groupsToReplicate.map(g => ({
		id: g.id,
		behavior: g.behavior,
		totalScore: g.totalScore
	})));
}

/**
 * Cleanup round
 * @param {Object} state - Simulation state
 */
function cleanupRound(state) {
	// Reset round scores for all players
	for (const player of state.players) {
		player.roundScore = 0;
	}
	
	// Reset round scores for all groups
	for (const group of state.groups) {
		group.roundScore = 0;
	}
	
	// Increment round number
	state.round++;
	
	// Reset phase to SHOW for next round
	state.phase = 'SHOW';
	
	// Hide scores for next round
	state.ui.showScores = false;
}

/**
 * Start auto play
 * @param {Object} state - Simulation state
 */
function startAutoPlay(state) {
	if (state.autoPlayInterval) {
		clearInterval(state.autoPlayInterval);
	}
	
	state.autoPlayInterval = setInterval(() => {
		if (state.running) {
			advancePhase(state);
			updateUI(state);
			updateVisualization(state);
		} else {
			clearInterval(state.autoPlayInterval);
		}
	}, state.config.stepIntervalMs);
}

/**
 * Update UI elements
 * @param {Object} state - Simulation state
 */
function updateUI(state) {
	if (state.uiElements) {
		state.uiElements.round.textContent = state.round;
		state.uiElements.phase.textContent = state.phase;
		state.uiElements.players.textContent = state.players.length;
		state.uiElements.groups.textContent = state.groups.length;
	}
}

/**
 * Update simple HTML visualization
 * @param {Object} state - Simulation state
 */
function updateSimpleVisualization(state) {
	if (!state.htmlContainer) return;
	
	// Clear existing content
	state.htmlContainer.innerHTML = '';
	
	// Create group visualizations
	for (let i = 0; i < state.groups.length; i++) {
		const group = state.groups[i];
		
		// Create group container
		const groupDiv = document.createElement('div');
		groupDiv.style.cssText = `
			border: 2px solid ${getGroupColorHex(group.behavior)};
			border-radius: 10px;
			padding: 15px;
			text-align: center;
			background: ${getGroupColorHex(group.behavior)}20;
			min-height: 120px;
		`;
		
		// Create group label
		const groupLabel = document.createElement('div');
		groupLabel.textContent = `Grup ${group.id}`;
		groupLabel.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #333;';
		groupDiv.appendChild(groupLabel);
		
		// Create behavior label
		const behaviorLabel = document.createElement('div');
		behaviorLabel.textContent = group.behavior;
		behaviorLabel.style.cssText = 'font-size: 12px; color: #666; margin-bottom: 10px;';
		groupDiv.appendChild(behaviorLabel);
		
		// Create group score label if scores are shown
		if (state.ui.showScores) {
			const scoreLabel = document.createElement('div');
			scoreLabel.textContent = `Toplam: ${group.totalScore}`;
			scoreLabel.style.cssText = 'font-size: 12px; color: #000; margin-bottom: 10px;';
			groupDiv.appendChild(scoreLabel);
		}
		
		// Create players for this group
		const playersContainer = document.createElement('div');
		playersContainer.style.cssText = 'display: flex; justify-content: center; gap: 5px;';
		
		for (let j = 0; j < group.memberIds.length; j++) {
			const memberId = group.memberIds[j];
			const player = state.players.find(p => p.id === memberId);
			
			if (player) {
				const playerDiv = document.createElement('div');
				playerDiv.style.cssText = `
					width: 20px;
					height: 20px;
					border-radius: 50%;
					background: ${getPlayerColorHex(player.action)};
					border: 1px solid #000;
					position: relative;
				`;
				
				// Create player score label if scores are shown
				if (state.ui.showScores) {
					const playerScoreLabel = document.createElement('div');
					playerScoreLabel.textContent = player.totalScore.toString();
					playerScoreLabel.style.cssText = `
						position: absolute;
						top: 25px;
						left: 50%;
						transform: translateX(-50%);
						font-size: 8px;
						color: #000;
					`;
					playerDiv.appendChild(playerScoreLabel);
				}
				
				playersContainer.appendChild(playerDiv);
			}
		}
		
		groupDiv.appendChild(playersContainer);
		state.htmlContainer.appendChild(groupDiv);
	}
}

/**
 * Get color hex for group behavior
 * @param {string} behavior - Group behavior type
 * @returns {string} Color hex value
 */
function getGroupColorHex(behavior) {
	switch (behavior) {
		case 'ALL_C':
			return '#4CAF50'; // Green
		case 'ALL_D':
			return '#F44336'; // Red
		case 'PROB_P':
			return '#2196F3'; // Blue
		default:
			return '#9E9E9E'; // Gray
	}
}

/**
 * Get color hex for player action
 * @param {string} action - Player action ('C' or 'D')
 * @returns {string} Color hex value
 */
function getPlayerColorHex(action) {
	switch (action) {
		case 'C':
			return '#4CAF50'; // Green
		case 'D':
			return '#F44336'; // Red
		default:
			return '#9E9E9E'; // Gray
	}
}
