/**
 * TrustTheory Bölüm 7 - User Interface
 * Manages the control panel and user interactions
 */

import { makeInitialState, validateState } from './state.js';
import { initPopulationFromUI, validatePopulationConfig } from './init.js';
import { advancePhase, startSimulation, stopSimulation, getSimulationStatus } from './fsm.js';

/**
 * Creates the main UI control panel
 * @param {Object} container - DOM container for the UI
 * @param {Object} state - Current game state
 * @param {Function} onStateChange - Callback when state changes
 * @returns {Object} UI controller object
 */
export function createUIController(container, state, onStateChange) {
    const ui = {
        container,
        state,
        onStateChange,
        elements: {},
        intervalId: null
    };
    
    // Create UI elements
    createControlPanel(ui);
    createPopulationControls(ui);
    createPayoffControls(ui);
    createRuleControls(ui);
    createActionButtons(ui);
    
    // Bind event handlers
    bindEventHandlers(ui);
    
    // Initial render
    updateUI(ui);
    
    return ui;
}

/**
 * Creates the main control panel structure
 * @param {Object} ui - UI controller object
 */
function createControlPanel(ui) {
    const panel = document.createElement('div');
    panel.className = 'trust7-control-panel';
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 300px;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #333;
        border-radius: 10px;
        padding: 15px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Bölüm 7 – TrustTheory';
    title.style.cssText = 'margin: 0 0 15px 0; text-align: center; color: #333;';
    panel.appendChild(title);
    
    ui.container.appendChild(panel);
    ui.elements.panel = panel;
}

/**
 * Creates population configuration controls
 * @param {Object} ui - UI controller object
 */
function createPopulationControls(ui) {
    const section = document.createElement('div');
    section.className = 'population-section';
    section.style.cssText = 'margin-bottom: 15px;';
    
    const title = document.createElement('h4');
    title.textContent = 'Nüfus';
    title.style.cssText = 'margin: 0 0 10px 0; color: #555;';
    section.appendChild(title);
    
    // ALL_C groups
    const allCControl = createNumberControl('ALL_C Grupları', ui.state.config.population.ALL_C, 0, 10);
    section.appendChild(allCControl.container);
    ui.elements.allCInput = allCControl.input;
    
    // ALL_D groups
    const allDControl = createNumberControl('ALL_D Grupları', ui.state.config.population.ALL_D, 0, 10);
    section.appendChild(allDControl.container);
    ui.elements.allDInput = allDControl.input;
    
    // PROB_P groups
    const probPControl = createNumberControl('PROB_P Grupları', ui.state.config.population.PROB_P.count, 0, 10);
    section.appendChild(probPControl.container);
    ui.elements.probPCountInput = probPControl.input;
    
    // PROB_P probability
    const probPProbControl = createSliderControl('PROB_P Olasılığı', ui.state.config.population.PROB_P.p, 0, 1, 0.1);
    section.appendChild(probPProbControl.container);
    ui.elements.probPProbInput = probPProbControl.input;
    
    ui.elements.panel.appendChild(section);
}

/**
 * Creates payoff configuration controls
 * @param {Object} ui - UI controller object
 */
function createPayoffControls(ui) {
    const section = document.createElement('div');
    section.className = 'payoff-section';
    section.style.cssText = 'margin-bottom: 15px;';
    
    const title = document.createElement('h4');
    title.textContent = 'Ödüller';
    title.style.cssText = 'margin: 0 0 10px 0; color: #555;';
    section.appendChild(title);
    
    // T, R, P, S controls
    const tControl = createNumberControl('T (İhanet Kazancı)', ui.state.config.T, 0, 10);
    section.appendChild(tControl.container);
    ui.elements.tInput = tControl.input;
    
    const rControl = createNumberControl('R (İşbirliği Ödülü)', ui.state.config.R, 0, 10);
    section.appendChild(rControl.container);
    ui.elements.rInput = rControl.input;
    
    const pControl = createNumberControl('P (İhanet Cezası)', ui.state.config.P, 0, 10);
    section.appendChild(pControl.container);
    ui.elements.pInput = pControl.input;
    
    const sControl = createNumberControl('S (Aldatılma Cezası)', ui.state.config.S, 0, 10);
    section.appendChild(sControl.container);
    ui.elements.sInput = sControl.input;
    
    ui.elements.panel.appendChild(section);
}

/**
 * Creates rule configuration controls
 * @param {Object} ui - UI controller object
 */
function createRuleControls(ui) {
    const section = document.createElement('div');
    section.className = 'rule-section';
    section.style.cssText = 'margin-bottom: 15px;';
    
    const title = document.createElement('h4');
    title.textContent = 'Kurallar';
    title.style.cssText = 'margin: 0 0 10px 0; color: #555;';
    section.appendChild(title);
    
    // Total rounds
    const roundsControl = createNumberControl('Toplam Tur', ui.state.config.totalRounds, 1, 100);
    section.appendChild(roundsControl.container);
    ui.elements.roundsInput = roundsControl.input;
    
    // k eliminate
    const kControl = createNumberControl('Elenen Grup Sayısı (k)', ui.state.config.kEliminate, 1, 5);
    section.appendChild(kControl.container);
    ui.elements.kInput = kControl.input;
    
    // Mistake percent
    const mistakeControl = createSliderControl('Hata Olasılığı (%)', ui.state.config.mistakePercent, 0, 100, 5);
    section.appendChild(mistakeControl.container);
    ui.elements.mistakeInput = mistakeControl.input;
    
    ui.elements.panel.appendChild(section);
}

/**
 * Creates action buttons
 * @param {Object} ui - UI controller object
 */
function createActionButtons(ui) {
    const section = document.createElement('div');
    section.className = 'action-section';
    section.style.cssText = 'margin-bottom: 15px;';
    
    const title = document.createElement('h4');
    title.textContent = 'Kontroller';
    title.style.cssText = 'margin: 0 0 10px 0; color: #555;';
    section.appendChild(title);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 5px;';
    
    // ADIM button
    const stepButton = createButton('ADIM', () => handleStep(ui));
    buttonContainer.appendChild(stepButton);
    ui.elements.stepButton = stepButton;
    
    // BAŞLA button
    const startButton = createButton('BAŞLA', () => handleStart(ui));
    buttonContainer.appendChild(startButton);
    ui.elements.startButton = startButton;
    
    // DURDUR button
    const stopButton = createButton('DURDUR', () => handleStop(ui));
    buttonContainer.appendChild(stopButton);
    ui.elements.stopButton = stopButton;
    
    // SIFIRLA button
    const resetButton = createButton('SIFIRLA', () => handleReset(ui));
    buttonContainer.appendChild(resetButton);
    ui.elements.resetButton = resetButton;
    
    section.appendChild(buttonContainer);
    ui.elements.panel.appendChild(section);
}

/**
 * Creates a number input control
 * @param {string} label - Control label
 * @param {number} value - Initial value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} Control object with container and input
 */
function createNumberControl(label, value, min, max) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-bottom: 8px;';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label + ':';
    labelEl.style.cssText = 'display: block; margin-bottom: 2px; font-size: 12px;';
    container.appendChild(labelEl);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    input.min = min;
    input.max = max;
    input.style.cssText = 'width: 100%; padding: 2px; border: 1px solid #ccc; border-radius: 3px;';
    container.appendChild(input);
    
    return { container, input };
}

/**
 * Creates a slider control
 * @param {string} label - Control label
 * @param {number} value - Initial value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step value
 * @returns {Object} Control object with container and input
 */
function createSliderControl(label, value, min, max, step) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-bottom: 8px;';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label + ':';
    labelEl.style.cssText = 'display: block; margin-bottom: 2px; font-size: 12px;';
    container.appendChild(labelEl);
    
    const input = document.createElement('input');
    input.type = 'range';
    input.value = value;
    input.min = min;
    input.max = max;
    input.step = step;
    input.style.cssText = 'width: 100%;';
    container.appendChild(input);
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = value;
    valueDisplay.style.cssText = 'font-size: 11px; color: #666;';
    container.appendChild(valueDisplay);
    
    input.addEventListener('input', () => {
        valueDisplay.textContent = input.value;
    });
    
    return { container, input };
}

/**
 * Creates a button
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
 * Binds event handlers to UI elements
 * @param {Object} ui - UI controller object
 */
function bindEventHandlers(ui) {
    // Population controls
    ui.elements.allCInput.addEventListener('change', () => updatePopulationConfig(ui));
    ui.elements.allDInput.addEventListener('change', () => updatePopulationConfig(ui));
    ui.elements.probPCountInput.addEventListener('change', () => updatePopulationConfig(ui));
    ui.elements.probPProbInput.addEventListener('input', () => updatePopulationConfig(ui));
    
    // Payoff controls
    ui.elements.tInput.addEventListener('change', () => updatePayoffConfig(ui));
    ui.elements.rInput.addEventListener('change', () => updatePayoffConfig(ui));
    ui.elements.pInput.addEventListener('change', () => updatePayoffConfig(ui));
    ui.elements.sInput.addEventListener('change', () => updatePayoffConfig(ui));
    
    // Rule controls
    ui.elements.roundsInput.addEventListener('change', () => updateRuleConfig(ui));
    ui.elements.kInput.addEventListener('change', () => updateRuleConfig(ui));
    ui.elements.mistakeInput.addEventListener('input', () => updateRuleConfig(ui));
}

/**
 * Updates population configuration from UI
 * @param {Object} ui - UI controller object
 */
function updatePopulationConfig(ui) {
    const newConfig = {
        ALL_C: parseInt(ui.elements.allCInput.value) || 0,
        ALL_D: parseInt(ui.elements.allDInput.value) || 0,
        PROB_P: {
            count: parseInt(ui.elements.probPCountInput.value) || 0,
            p: parseFloat(ui.elements.probPProbInput.value) || 0
        }
    };
    
    const validation = validatePopulationConfig(newConfig);
    if (validation.isValid) {
        ui.state.config.population = newConfig;
        ui.state = initPopulationFromUI(ui.state);
        ui.onStateChange(ui.state);
    } else {
        alert(validation.message);
        // Revert to previous values
        updateUI(ui);
    }
}

/**
 * Updates payoff configuration from UI
 * @param {Object} ui - UI controller object
 */
function updatePayoffConfig(ui) {
    ui.state.config.T = parseInt(ui.elements.tInput.value) || 5;
    ui.state.config.R = parseInt(ui.elements.rInput.value) || 3;
    ui.state.config.P = parseInt(ui.elements.pInput.value) || 1;
    ui.state.config.S = parseInt(ui.elements.sInput.value) || 0;
    ui.onStateChange(ui.state);
}

/**
 * Updates rule configuration from UI
 * @param {Object} ui - UI controller object
 */
function updateRuleConfig(ui) {
    ui.state.config.totalRounds = parseInt(ui.elements.roundsInput.value) || 50;
    ui.state.config.kEliminate = parseInt(ui.elements.kInput.value) || 1;
    ui.state.config.mistakePercent = parseFloat(ui.elements.mistakeInput.value) || 0;
    ui.onStateChange(ui.state);
}

/**
 * Handles step button click
 * @param {Object} ui - UI controller object
 */
function handleStep(ui) {
    ui.state = advancePhase(ui.state);
    ui.onStateChange(ui.state);
    updateUI(ui);
}

/**
 * Handles start button click
 * @param {Object} ui - UI controller object
 */
function handleStart(ui) {
    ui.state = startSimulation(ui.state);
    ui.onStateChange(ui.state);
    updateUI(ui);
    
    // Start auto-advance
    ui.intervalId = setInterval(() => {
        if (ui.state.running) {
            ui.state = advancePhase(ui.state);
            ui.onStateChange(ui.state);
            updateUI(ui);
        } else {
            clearInterval(ui.intervalId);
        }
    }, ui.state.config.stepIntervalMs);
}

/**
 * Handles stop button click
 * @param {Object} ui - UI controller object
 */
function handleStop(ui) {
    ui.state = stopSimulation(ui.state);
    ui.onStateChange(ui.state);
    updateUI(ui);
    
    if (ui.intervalId) {
        clearInterval(ui.intervalId);
        ui.intervalId = null;
    }
}

/**
 * Handles reset button click
 * @param {Object} ui - UI controller object
 */
function handleReset(ui) {
    ui.state = makeInitialState();
    ui.state = initPopulationFromUI(ui.state);
    ui.onStateChange(ui.state);
    updateUI(ui);
    
    if (ui.intervalId) {
        clearInterval(ui.intervalId);
        ui.intervalId = null;
    }
}

/**
 * Updates UI elements to reflect current state
 * @param {Object} ui - UI controller object
 */
function updateUI(ui) {
    const status = getSimulationStatus(ui.state);
    
    // Update button states
    ui.elements.stepButton.disabled = !status.canAdvance;
    ui.elements.startButton.disabled = !status.canStart;
    ui.elements.stopButton.disabled = !status.canStop;
    
    // Update button styles
    ui.elements.stepButton.style.background = status.canAdvance ? '#f0f0f0' : '#e0e0e0';
    ui.elements.startButton.style.background = status.canStart ? '#e8f5e8' : '#e0e0e0';
    ui.elements.stopButton.style.background = status.canStop ? '#ffe8e8' : '#e0e0e0';
}
