// Main application controller for Live Music Artwork
class LiveMusicArtwork {
    constructor() {
        this.audioProcessor = null;
        this.visualizationEngine = null;
        this.isRunning = false;
        
        // UI elements
        this.startBtn = null;
        this.stopBtn = null;
        this.sensitivitySlider = null;
        this.sensitivityValue = null;
        this.visualModeSelect = null;
        this.colorSchemeSelect = null;
        this.micStatus = null;
        this.audioLevel = null;
        
        // Audio display elements
        this.freq1Element = null;
        this.amp1Element = null;
        this.freq2Element = null;
        this.amp2Element = null;
        
        // Dual monitor support
        this.dualMonitorBtn = null;
        this.fullscreenBtn = null;
        this.display2Window = null;
        this.isDualMonitorMode = false;
        this.display2Ready = false;
        
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // Update UI every 100ms
    }

    async initialize() {
        try {
            // Initialize components
            this.audioProcessor = new AudioProcessor();
            this.visualizationEngine = new VisualizationEngine();
            
            // Initialize visualization engine
            this.visualizationEngine.initialize('canvas1', 'canvas2');
            
            // Set up UI elements
            this.setupUIElements();
            this.setupEventListeners();
            
            // Set up audio callback
            this.audioProcessor.addCallback((data) => this.handleAudioData(data));
            
            console.log('Live Music Artwork initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Initialization failed: ' + error.message);
            return false;
        }
    }

    setupUIElements() {
        // Get UI elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.visualModeSelect = document.getElementById('visualMode');
        this.colorSchemeSelect = document.getElementById('colorScheme');
        this.micStatus = document.getElementById('micStatus');
        this.audioLevel = document.querySelector('.level-bar');
        
        // Audio display elements
        this.freq1Element = document.getElementById('freq1');
        this.amp1Element = document.getElementById('amp1');
        this.freq2Element = document.getElementById('freq2');
        this.amp2Element = document.getElementById('amp2');
        
        // Dual monitor controls
        this.dualMonitorBtn = document.getElementById('dualMonitorBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Validate all elements exist
        const requiredElements = [
            this.startBtn, this.stopBtn, this.sensitivitySlider, 
            this.sensitivityValue, this.visualModeSelect, this.colorSchemeSelect,
            this.micStatus, this.audioLevel, this.dualMonitorBtn, this.fullscreenBtn
        ];
        
        if (requiredElements.some(el => !el)) {
            throw new Error('Some UI elements are missing from the HTML');
        }
    }

    setupEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', async () => {
            await this.start();
        });
        
        // Stop button
        this.stopBtn.addEventListener('click', () => {
            this.stop();
        });
        
        // Sensitivity slider
        this.sensitivitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.sensitivityValue.textContent = value;
            if (this.audioProcessor) {
                this.audioProcessor.setSensitivity(value);
            }
        });
        
        // Visualization mode
        this.visualModeSelect.addEventListener('change', (e) => {
            if (this.visualizationEngine) {
                this.visualizationEngine.setMode(e.target.value);
            }
            // Update Display 2
            if (this.isDualMonitorMode && this.display2Ready) {
                this.sendToDisplay2('SETTINGS_UPDATE', { mode: e.target.value });
            }
        });
        
        // Color scheme
        this.colorSchemeSelect.addEventListener('change', (e) => {
            if (this.visualizationEngine) {
                this.visualizationEngine.setColorScheme(e.target.value);
            }
            // Update Display 2
            if (this.isDualMonitorMode && this.display2Ready) {
                this.sendToDisplay2('SETTINGS_UPDATE', { colorScheme: e.target.value });
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.isRunning) {
                        this.stop();
                    } else {
                        this.start();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.stop();
                    break;
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                this.pause();
            } else if (!document.hidden && this.isRunning) {
                this.resume();
            }
        });
        
        // Dual monitor controls
        this.dualMonitorBtn.addEventListener('click', () => {
            this.toggleDualMonitorMode();
        });
        
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Listen for messages from Display 2 window
        window.addEventListener('message', (event) => {
            this.handleDisplay2Message(event);
        });
    }

    async start() {
        try {
            this.showMessage('Requesting microphone access...');
            
            // Initialize audio processor
            await this.audioProcessor.initialize();
            
            // Start visualization
            this.visualizationEngine.start();
            
            // Start Display 2 if in dual monitor mode
            if (this.isDualMonitorMode && this.display2Ready) {
                this.sendToDisplay2('START_VISUALIZATION');
            }
            
            this.isRunning = true;
            this.updateUIState();
            this.updateMicrophoneStatus(true);
            
            this.showMessage('Live music visualization started!');
            
            console.log('Application started successfully');
        } catch (error) {
            console.error('Failed to start application:', error);
            this.showError('Failed to start: ' + error.message);
            this.updateMicrophoneStatus(false);
        }
    }

    stop() {
        if (!this.isRunning) return;
        
        // Stop audio processing
        if (this.audioProcessor) {
            this.audioProcessor.stop();
        }
        
        // Stop visualization
        if (this.visualizationEngine) {
            this.visualizationEngine.stop();
        }
        
        // Stop Display 2 if in dual monitor mode
        if (this.isDualMonitorMode && this.display2Ready) {
            this.sendToDisplay2('STOP_VISUALIZATION');
        }
        
        this.isRunning = false;
        this.updateUIState();
        this.updateMicrophoneStatus(false);
        this.resetAudioDisplays();
        
        this.showMessage('Visualization stopped');
        console.log('Application stopped');
    }

    pause() {
        if (this.visualizationEngine) {
            this.visualizationEngine.stop();
        }
    }

    resume() {
        if (this.visualizationEngine && this.isRunning) {
            this.visualizationEngine.start();
        }
    }

    handleAudioData(audioData) {
        // Update visualization engine
        if (this.visualizationEngine) {
            this.visualizationEngine.updateAudioData(audioData);
        }
        
        // Send audio data to Display 2 if available
        if (this.isDualMonitorMode && this.display2Ready) {
            this.sendToDisplay2('AUDIO_DATA', audioData);
        }
        
        // Update UI periodically to avoid overwhelming the browser
        const now = Date.now();
        if (now - this.lastUpdateTime > this.updateInterval) {
            this.updateAudioDisplays(audioData);
            this.updateAudioLevel(audioData.volume);
            this.lastUpdateTime = now;
        }
    }

    updateAudioDisplays(audioData) {
        // Update frequency and amplitude displays
        if (this.freq1Element) {
            this.freq1Element.textContent = Math.round(audioData.dominantFrequency);
        }
        
        if (this.amp1Element) {
            this.amp1Element.textContent = Math.round(audioData.volume);
        }
        
        // Display 2 shows peak frequency in high range
        const highFreqBin = audioData.frequencyBins.midhigh || 0;
        const estimatedHighFreq = 3000 * highFreqBin; // Rough estimation
        
        if (this.freq2Element) {
            this.freq2Element.textContent = Math.round(estimatedHighFreq);
        }
        
        if (this.amp2Element) {
            this.amp2Element.textContent = Math.round(audioData.volume);
        }
    }

    updateAudioLevel(volume) {
        if (this.audioLevel) {
            const percentage = Math.min(100, Math.max(0, volume));
            this.audioLevel.style.width = percentage + '%';
        }
    }

    updateMicrophoneStatus(connected) {
        if (!this.micStatus) return;
        
        const statusDot = this.micStatus.querySelector('.status-dot');
        const statusText = this.micStatus.querySelector('span:last-child');
        
        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Microphone: Connected';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Microphone: Disconnected';
        }
    }

    updateUIState() {
        if (this.isRunning) {
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.startBtn.textContent = 'Running...';
        } else {
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.startBtn.textContent = 'Start Visualization';
        }
    }

    resetAudioDisplays() {
        if (this.freq1Element) this.freq1Element.textContent = '0';
        if (this.amp1Element) this.amp1Element.textContent = '0';
        if (this.freq2Element) this.freq2Element.textContent = '0';
        if (this.amp2Element) this.amp2Element.textContent = '0';
        
        if (this.audioLevel) {
            this.audioLevel.style.width = '0%';
        }
    }

    handleResize() {
        // Re-initialize canvases if needed
        if (this.visualizationEngine && this.isRunning) {
            // The visualization engine will handle resize automatically
            // due to CSS responsive design
        }
    }

    showMessage(message) {
        console.log(message);
        
        // Create temporary message display
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 135, 0.9);
            color: #1a1a2e;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            transition: opacity 0.3s ease;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        console.error(message);
        
        // Create temporary error display
        const errorEl = document.createElement('div');
        errorEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            transition: opacity 0.3s ease;
            max-width: 300px;
        `;
        errorEl.textContent = message;
        
        document.body.appendChild(errorEl);
        
        setTimeout(() => {
            errorEl.style.opacity = '0';
            setTimeout(() => {
                if (errorEl.parentNode) {
                    errorEl.parentNode.removeChild(errorEl);
                }
            }, 300);
        }, 5000);
    }

    // Public API methods
    getCurrentAudioData() {
        return this.audioProcessor ? this.audioProcessor.audioData : null;
    }

    isVisualizationRunning() {
        return this.isRunning;
    }

    setVisualizationMode(mode) {
        if (this.visualModeSelect) {
            this.visualModeSelect.value = mode;
            this.visualModeSelect.dispatchEvent(new Event('change'));
        }
    }

    setColorScheme(scheme) {
        if (this.colorSchemeSelect) {
            this.colorSchemeSelect.value = scheme;
            this.colorSchemeSelect.dispatchEvent(new Event('change'));
        }
    }

    setSensitivity(value) {
        if (this.sensitivitySlider) {
            this.sensitivitySlider.value = value;
            this.sensitivitySlider.dispatchEvent(new Event('input'));
        }
    }

    // Dual Monitor Functionality
    toggleDualMonitorMode() {
        if (!this.isDualMonitorMode) {
            this.openDualMonitorMode();
        } else {
            this.closeDualMonitorMode();
        }
    }

    async openDualMonitorMode() {
        try {
            // Calculate window position for second monitor
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const windowWidth = 900;
            const windowHeight = 700;
            
            // Try to position on second monitor (if available)
            const leftPosition = screenWidth;
            
            // Open Display 2 window
            this.display2Window = window.open(
                'display2.html',
                'Display2Window',
                `width=${windowWidth},height=${windowHeight},left=${leftPosition},top=100,resizable=yes,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`
            );
            
            if (!this.display2Window) {
                throw new Error('Could not open Display 2 window. Please allow popups for this site.');
            }
            
            // Wait for Display 2 to load
            this.display2Window.focus();
            
            // Update UI
            this.isDualMonitorMode = true;
            this.updateDualMonitorUI();
            this.showInstructions();
            
            this.showMessage('Display 2 opened! Drag the new window to your second monitor.');
            
        } catch (error) {
            console.error('Failed to open dual monitor mode:', error);
            this.showError('Failed to open dual monitor mode: ' + error.message);
        }
    }

    closeDualMonitorMode() {
        if (this.display2Window && !this.display2Window.closed) {
            this.display2Window.close();
        }
        
        this.display2Window = null;
        this.isDualMonitorMode = false;
        this.display2Ready = false;
        
        this.updateDualMonitorUI();
        this.hideInstructions();
        
        this.showMessage('Dual monitor mode closed');
    }

    updateDualMonitorUI() {
        const displaysContainer = document.querySelector('.displays-container');
        const display2Wrapper = document.querySelector('.display-wrapper:nth-child(2)');
        
        if (this.isDualMonitorMode) {
            this.dualMonitorBtn.textContent = 'Close Dual Monitor Mode';
            this.fullscreenBtn.disabled = false;
            
            // Hide Display 2 from main window
            displaysContainer.classList.add('single-display');
            display2Wrapper.classList.add('hidden');
            
        } else {
            this.dualMonitorBtn.textContent = 'Open Dual Monitor Mode';
            this.fullscreenBtn.disabled = true;
            
            // Show both displays in main window
            displaysContainer.classList.remove('single-display');
            display2Wrapper.classList.remove('hidden');
        }
    }

    showInstructions() {
        const existingInstructions = document.querySelector('.monitor-instructions');
        if (existingInstructions) return;
        
        const instructions = document.createElement('div');
        instructions.className = 'monitor-instructions';
        instructions.innerHTML = `
            <h4>🖥️ Dual Monitor Setup Instructions</h4>
            <ul>
                <li><strong>Drag</strong> the new "Display 2" window to your second monitor</li>
                <li><strong>Resize</strong> or maximize the window on the second monitor</li>
                <li><strong>Press F11</strong> in either window for fullscreen mode</li>
                <li><strong>Use complementary mode</strong> to see particles travel between displays</li>
                <li><strong>Close this popup</strong> by clicking "Close Dual Monitor Mode"</li>
            </ul>
            <p><em>Both displays will show synchronized visualizations with cross-screen particle effects!</em></p>
        `;
        
        document.querySelector('.controls').appendChild(instructions);
    }

    hideInstructions() {
        const instructions = document.querySelector('.monitor-instructions');
        if (instructions) {
            instructions.remove();
        }
    }

    handleDisplay2Message(event) {
        if (event.origin !== window.location.origin) return;
        
        const { type, data } = event.data;
        
        switch (type) {
            case 'DISPLAY2_LOADED':
                console.log('Display 2 window loaded');
                this.initializeDisplay2();
                break;
                
            case 'DISPLAY2_READY':
                console.log('Display 2 ready');
                this.display2Ready = true;
                if (this.isRunning) {
                    this.sendToDisplay2('START_VISUALIZATION');
                }
                break;
                
            case 'DISPLAY2_CLOSED':
                console.log('Display 2 window closed');
                this.closeDualMonitorMode();
                break;
        }
    }

    initializeDisplay2() {
        if (!this.display2Window || this.display2Window.closed) return;
        
        // Send initialization data
        this.sendToDisplay2('INIT_DISPLAY2', {
            mode: this.visualModeSelect.value,
            colorScheme: this.colorSchemeSelect.value
        });
    }

    sendToDisplay2(type, data = null) {
        if (this.display2Window && !this.display2Window.closed) {
            this.display2Window.postMessage({ type, data }, window.location.origin);
        }
    }

    toggleFullscreen() {
        // Toggle fullscreen for main window
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.liveMusicArtwork = new LiveMusicArtwork();
        await window.liveMusicArtwork.initialize();
        
        // Add some helpful console commands for development
        console.log('%cLive Music Artwork loaded successfully!', 'color: #00ff87; font-size: 16px; font-weight: bold;');
        console.log('Available commands:');
        console.log('- liveMusicArtwork.start() - Start visualization');
        console.log('- liveMusicArtwork.stop() - Stop visualization');
        console.log('- liveMusicArtwork.setVisualizationMode(mode) - Set mode (complementary, mirror, reactive)');
        console.log('- liveMusicArtwork.setColorScheme(scheme) - Set colors (celtic, fire, ocean, sunset)');
        console.log('- liveMusicArtwork.setSensitivity(1-10) - Set audio sensitivity');
        
    } catch (error) {
        console.error('Failed to initialize Live Music Artwork:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>Initialization Error</h3>
            <p>${error.message}</p>
            <p><small>Please refresh the page and ensure microphone permissions are granted.</small></p>
        `;
        
        document.body.appendChild(errorDiv);
    }
}); 