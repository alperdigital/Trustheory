/**
 * TrustTheory Bölüm 7 - PIXI Visualization
 * Handles the visual representation of groups and players
 */

/**
 * Creates the PIXI visualization system
 * @param {Object} container - DOM container for the canvas
 * @param {Object} state - Current game state
 * @param {Function} onStateChange - Callback when state changes
 * @returns {Object} View controller object
 */
export function createView(container, state, onStateChange) {
    const view = {
        container,
        state,
        onStateChange,
        app: null,
        groups: [],
        players: [],
        scoreLabels: [],
        groupLabels: []
    };
    
    // Initialize PIXI application
    initPIXI(view);
    
    // Create initial visualization
    render(view);
    
    return view;
}

/**
 * Initializes PIXI application
 * @param {Object} view - View controller object
 */
function initPIXI(view) {
    // Create PIXI application
    view.app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0xf0f0f0,
        antialias: true
    });
    
    // Add canvas to container
    view.container.appendChild(view.app.view);
    
    // Set up stage
    view.app.stage.sortableChildren = true;
    
    // Create background
    createBackground(view);
}

/**
 * Creates the background
 * @param {Object} view - View controller object
 */
function createBackground(view) {
    const background = new PIXI.Graphics();
    background.beginFill(0xf8f8f8);
    background.drawRect(0, 0, view.app.screen.width, view.app.screen.height);
    background.endFill();
    view.app.stage.addChild(background);
    
    // Add title
    const title = new PIXI.Text('Bölüm 7 – TrustTheory', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x333333,
        align: 'center'
    });
    title.x = view.app.screen.width / 2 - title.width / 2;
    title.y = 20;
    view.app.stage.addChild(title);
}

/**
 * Renders the current state
 * @param {Object} view - View controller object
 */
export function render(view) {
    // Clear existing visualization
    clearVisualization(view);
    
    // Create group visualizations
    createGroupVisualizations(view);
    
    // Create player visualizations
    createPlayerVisualizations(view);
    
    // Create score labels if needed
    if (view.state.ui.showScores) {
        createScoreLabels(view);
    }
}

/**
 * Clears existing visualization
 * @param {Object} view - View controller object
 */
function clearVisualization(view) {
    // Remove existing groups
    for (const group of view.groups) {
        view.app.stage.removeChild(group);
    }
    view.groups = [];
    
    // Remove existing players
    for (const player of view.players) {
        view.app.stage.removeChild(player);
    }
    view.players = [];
    
    // Remove existing labels
    for (const label of view.scoreLabels) {
        view.app.stage.removeChild(label);
    }
    view.scoreLabels = [];
    
    for (const label of view.groupLabels) {
        view.app.stage.removeChild(label);
    }
    view.groupLabels = [];
}

/**
 * Creates group visualizations
 * @param {Object} view - View controller object
 */
function createGroupVisualizations(view) {
    const groupsPerRow = 5;
    const groupSpacing = 150;
    const startX = 100;
    const startY = 100;
    
    for (let i = 0; i < view.state.groups.length; i++) {
        const group = view.state.groups[i];
        const row = Math.floor(i / groupsPerRow);
        const col = i % groupsPerRow;
        
        const x = startX + col * groupSpacing;
        const y = startY + row * 200;
        
        // Create group container
        const groupContainer = new PIXI.Container();
        groupContainer.x = x;
        groupContainer.y = y;
        groupContainer.zIndex = 1;
        
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
        if (view.state.ui.showScores) {
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
        
        view.app.stage.addChild(groupContainer);
        view.groups.push(groupContainer);
    }
}

/**
 * Creates player visualizations
 * @param {Object} view - View controller object
 */
function createPlayerVisualizations(view) {
    const groupsPerRow = 5;
    const groupSpacing = 150;
    const startX = 100;
    const startY = 100;
    
    for (let i = 0; i < view.state.groups.length; i++) {
        const group = view.state.groups[i];
        const row = Math.floor(i / groupsPerRow);
        const col = i % groupsPerRow;
        
        const groupX = startX + col * groupSpacing;
        const groupY = startY + row * 200;
        
        // Create players for this group
        for (let j = 0; j < group.memberIds.length; j++) {
            const memberId = group.memberIds[j];
            const player = view.state.players.find(p => p.id === memberId);
            
            if (player) {
                const playerX = groupX - 20 + j * 20;
                const playerY = groupY - 20 + j * 20;
                
                // Create player circle
                const playerCircle = new PIXI.Graphics();
                playerCircle.beginFill(getPlayerColor(player.action));
                playerCircle.drawCircle(0, 0, 8);
                playerCircle.endFill();
                playerCircle.x = playerX;
                playerCircle.y = playerY;
                playerCircle.zIndex = 2;
                
                // Create player border
                const playerBorder = new PIXI.Graphics();
                playerBorder.lineStyle(1, 0x000000, 1);
                playerBorder.drawCircle(0, 0, 8);
                playerBorder.x = playerX;
                playerBorder.y = playerY;
                playerBorder.zIndex = 3;
                
                // Create player score label if scores are shown
                if (view.state.ui.showScores) {
                    const playerScoreLabel = new PIXI.Text(player.totalScore.toString(), {
                        fontFamily: 'Arial',
                        fontSize: 8,
                        fill: 0x000000,
                        align: 'center'
                    });
                    playerScoreLabel.x = playerX - playerScoreLabel.width / 2;
                    playerScoreLabel.y = playerY + 12;
                    playerScoreLabel.zIndex = 4;
                    view.app.stage.addChild(playerScoreLabel);
                    view.scoreLabels.push(playerScoreLabel);
                }
                
                view.app.stage.addChild(playerCircle);
                view.app.stage.addChild(playerBorder);
                view.players.push(playerCircle, playerBorder);
            }
        }
    }
}

/**
 * Creates score labels
 * @param {Object} view - View controller object
 */
function createScoreLabels(view) {
    // Score labels are created in createPlayerVisualizations
    // This function is here for consistency with the architecture
}

/**
 * Gets color for group behavior
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
 * Gets color for player action
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
 * Updates the visualization when state changes
 * @param {Object} view - View controller object
 * @param {Object} newState - New state
 */
export function updateView(view, newState) {
    view.state = newState;
    render(view);
}

/**
 * Animates group elimination
 * @param {Object} view - View controller object
 * @param {number[]} eliminatedGroupIds - IDs of eliminated groups
 */
export function animateElimination(view, eliminatedGroupIds) {
    for (let i = 0; i < view.groups.length; i++) {
        const group = view.groups[i];
        const groupId = view.state.groups[i].id;
        
        if (eliminatedGroupIds.includes(groupId)) {
            // Fade out animation
            const fadeOut = () => {
                group.alpha -= 0.05;
                if (group.alpha > 0) {
                    requestAnimationFrame(fadeOut);
                } else {
                    view.app.stage.removeChild(group);
                }
            };
            fadeOut();
        }
    }
}

/**
 * Animates group replication
 * @param {Object} view - View controller object
 * @param {number[]} replicatedGroupIds - IDs of replicated groups
 */
export function animateReplication(view, replicatedGroupIds) {
    // For now, just re-render the entire view
    // In a more sophisticated implementation, we could animate new groups appearing
    render(view);
}

/**
 * Resizes the visualization
 * @param {Object} view - View controller object
 * @param {number} width - New width
 * @param {number} height - New height
 */
export function resizeView(view, width, height) {
    view.app.renderer.resize(width, height);
    render(view);
}

/**
 * Destroys the visualization
 * @param {Object} view - View controller object
 */
export function destroyView(view) {
    if (view.app) {
        view.app.destroy(true);
        view.app = null;
    }
}
