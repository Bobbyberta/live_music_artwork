// Main application controller for Live Music Artwork
class LiveMusicArtwork {
    constructor() {
        // Core components
        this.audioProcessor = null;
        this.visualizationEngine = null;
        
        // UI elements
        this.startBtn = null;
        this.stopBtn = null;
        this.sensitivitySlider = null;
        this.sensitivityValue = null;
        this.visualModeSelect = null;
        this.colorSchemeSelect = null;
        this.micStatus = null;
        this.audioLevel = null;
        this.fullscreenBtn = null;
        
        // Canvas
        this.canvas = null;
        
        // State
        this.isRunning = false;
        this.isPaused = false;
        
        // Troubleshooting
        this.troubleshootBtn = null;
        
        // Initialize
        this.initialize();
    }

    async initialize() {
        try {
            this.setupUIElements();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            
            // Create error notification container
            this.createErrorNotifications();
            
            console.log('Live Music Artwork initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            alert('Failed to initialize application. Please refresh the page.');
        }
    }

    setupUIElements() {
        // Main controls
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.visualModeSelect = document.getElementById('visualMode');
        this.colorSchemeSelect = document.getElementById('colorScheme');
        this.micStatus = document.getElementById('micStatus');
        this.audioLevel = document.getElementById('audioLevel');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Canvas
        this.canvas = document.getElementById('canvas');
        
        // Troubleshooting
        this.troubleshootBtn = document.getElementById('troubleshootBtn');
        
        // Color controls for beat background visualization
        this.colorControls = document.getElementById('colorControls');
        this.backgroundColorPicker = document.getElementById('backgroundColor');
        this.beatColorPicker = document.getElementById('beatColor');
        
        // Validate all elements exist
        const requiredElements = [
            this.startBtn, this.stopBtn, this.sensitivitySlider, 
            this.sensitivityValue, this.visualModeSelect, this.colorSchemeSelect,
            this.micStatus, this.audioLevel, this.fullscreenBtn, this.canvas,
            this.troubleshootBtn, this.colorControls, this.backgroundColorPicker,
            this.beatColorPicker
        ];
        
        const missingElements = requiredElements.filter(element => !element);
        if (missingElements.length > 0) {
            throw new Error('Missing required UI elements');
        }
    }

    setupEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        
        // Sensitivity control
        this.sensitivitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.sensitivityValue.textContent = value;
            if (this.audioProcessor) {
                this.audioProcessor.setSensitivity(value);
            }
        });
        
        // Visualization mode
        this.visualModeSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            
            if (this.visualizationEngine) {
                this.visualizationEngine.setMode(mode);
            }
            
            // Show/hide color controls based on mode
            this.toggleColorControls(mode === 'beatbackground');
        });
        
        // Color scheme
        this.colorSchemeSelect.addEventListener('change', (e) => {
            if (this.visualizationEngine) {
                this.visualizationEngine.setColorScheme(e.target.value);
            }
        });
        
        // Background color picker
        this.backgroundColorPicker.addEventListener('input', (e) => {
            if (this.visualizationEngine) {
                this.visualizationEngine.setBackgroundColor(e.target.value);
            }
        });
        
        // Beat color picker
        this.beatColorPicker.addEventListener('input', (e) => {
            if (this.visualizationEngine) {
                this.visualizationEngine.setBeatColor(e.target.value);
            }
        });
        
        // Fullscreen
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Troubleshooting guide
        this.troubleshootBtn.addEventListener('click', () => {
            this.showTroubleshootingGuide();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!this.isRunning) {
                        this.start();
                    } else {
                        this.stop();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (this.isRunning) {
                        this.stop();
                    }
                    break;
            }
        });
    }

    async start() {
        try {
            // Initialize audio processor
            this.audioProcessor = new AudioProcessor();
            await this.audioProcessor.initialize();
            
            // Initialize visualization engine
            this.visualizationEngine = new VisualizationEngine(this.canvas);
            this.visualizationEngine.setMode(this.visualModeSelect.value);
            this.visualizationEngine.setColorScheme(this.colorSchemeSelect.value);
            
            // Set up color controls based on current mode
            this.toggleColorControls(this.visualModeSelect.value === 'beatbackground');
            
            // If beat background mode, set the initial colors
            if (this.visualModeSelect.value === 'beatbackground') {
                this.visualizationEngine.setBackgroundColor(this.backgroundColorPicker.value);
                this.visualizationEngine.setBeatColor(this.beatColorPicker.value);
            }
            
            // Start audio processing with callback
            this.audioProcessor.addCallback((audioData) => {
                this.handleAudioData(audioData);
            });
            this.audioProcessor.startAnalysis();
            
            this.isRunning = true;
            this.updateUIState();
            
            this.showMessage('Visualization started! 🎵');
            
        } catch (error) {
            console.error('Failed to start visualization:', error);
            this.showError(error.message);
            this.stop();
        }
    }

    stop() {
        if (this.audioProcessor) {
            this.audioProcessor.stop();
            this.audioProcessor = null;
        }
        
        // Clear canvas
        if (this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.isRunning = false;
        this.isPaused = false;
        this.updateUIState();
        this.resetAudioDisplays();
        
        this.showMessage('Visualization stopped');
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
        }
    }

    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
        }
    }

    handleAudioData(audioData) {
        if (!this.isRunning || this.isPaused) return;
        
        // Add sensitivity to audio data
        audioData.sensitivity = parseInt(this.sensitivitySlider.value);
        
        // Update visualization
        if (this.visualizationEngine) {
            this.visualizationEngine.updateAudioData(audioData);
        }
        
        // Update UI displays
        this.updateAudioDisplays(audioData);
    }

    updateAudioDisplays(audioData) {
        if (!audioData) return;
        
        // Update audio level indicator
        this.updateAudioLevel(audioData.volume);
        
        // Update microphone status
        this.updateMicrophoneStatus(audioData.volume > 1);
        
        // Update frequency and volume display
        const freqElement = document.getElementById('frequency');
        const volumeElement = document.getElementById('volume');
        
        if (freqElement) {
            freqElement.textContent = audioData.dominantFrequency ? 
                audioData.dominantFrequency.toFixed(1) : '0';
        }
        
        if (volumeElement) {
            volumeElement.textContent = audioData.volume ? 
                audioData.volume.toFixed(1) : '0';
        }
    }

    updateAudioLevel(volume) {
        if (!this.audioLevel) return;
        
        const levelBar = this.audioLevel.querySelector('.level-bar');
        if (levelBar) {
            const percentage = Math.min(100, Math.max(0, volume));
            levelBar.style.width = `${percentage}%`;
            
            // Color coding based on level
            if (percentage < 20) {
                levelBar.className = 'level-bar level-low';
            } else if (percentage < 60) {
                levelBar.className = 'level-bar level-medium';
            } else {
                levelBar.className = 'level-bar level-high';
            }
        }
    }

    updateMicrophoneStatus(connected) {
        if (!this.micStatus) return;
        
        const statusDot = this.micStatus.querySelector('.status-dot');
        const statusText = this.micStatus.querySelector('span:last-child');
        
        if (statusDot && statusText) {
            if (connected) {
                statusDot.className = 'status-dot status-connected';
                statusText.textContent = 'Microphone: Connected';
            } else {
                statusDot.className = 'status-dot status-disconnected';
                statusText.textContent = 'Microphone: Disconnected';
            }
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
        this.updateAudioLevel(0);
        this.updateMicrophoneStatus(false);
        
        // Reset frequency and volume displays
        const freqElement = document.getElementById('frequency');
        const volumeElement = document.getElementById('volume');
        
        if (freqElement) freqElement.textContent = '0';
        if (volumeElement) volumeElement.textContent = '0';
    }

    handleResize() {
        // Handle canvas resizing if needed
        // The canvas size is managed by CSS, so this is mainly for future extensibility
    }

    toggleColorControls(show) {
        if (this.colorControls) {
            this.colorControls.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message) {
        console.log('✅', message);
        
        // Create a temporary message display
        const messageDiv = document.createElement('div');
        messageDiv.className = 'temp-message success';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #00ff87, #60efff);
            color: #1a1a2e;
            padding: 12px 24px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }

    showError(message) {
        console.error('❌', message);
        
        // Create error message display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'temp-message error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 1000;
            max-width: 80%;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Public API methods
    getCurrentAudioData() {
        return this.audioProcessor ? this.audioProcessor.getCurrentData() : null;
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

    createErrorNotifications() {
        // Create error notification container if it doesn't exist
        if (!document.getElementById('errorNotifications')) {
            const container = document.createElement('div');
            container.id = 'errorNotifications';
            container.className = 'error-notifications';
            document.body.appendChild(container);
        }
    }

    showAudioError(message) {
        console.error('🚨 Audio Error:', message);
        this.showNotification(message, 'error');
    }

    showAudioWarning(message) {
        console.warn('⚠️ Audio Warning:', message);
        this.showNotification(message, 'warning');
    }

    clearAudioError() {
        this.clearNotifications('error');
    }

    clearAudioWarning() {
        this.clearNotifications('warning');
    }

    showNotification(message, type = 'error') {
        const container = document.getElementById('errorNotifications');
        if (!container) return;

        // Remove existing notifications of the same type
        this.clearNotifications(type);

        // Create notification
        const notification = document.createElement('div');
        notification.className = `audio-notification audio-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'error' ? '🚨' : '⚠️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        container.appendChild(notification);

        // Auto-remove warnings after 10 seconds
        if (type === 'warning') {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 10000);
        }

        // Add click to close
        notification.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                notification.remove();
            }
        });
    }

    clearNotifications(type = null) {
        const container = document.getElementById('errorNotifications');
        if (!container) return;

        const selector = type ? `.audio-${type}` : '.audio-notification';
        const notifications = container.querySelectorAll(selector);
        notifications.forEach(notification => notification.remove());
    }

    showTroubleshootingGuide() {
        // Remove existing modal if present
        const existingModal = document.querySelector('.trouble-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'trouble-modal';
        modal.innerHTML = `
            <div class="trouble-content">
                <button class="trouble-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <h3>🔧 Audio Troubleshooting Guide</h3>
                
                <h4>🚨 Common Issues & Solutions:</h4>
                
                <h4>1. No Microphone Permission</h4>
                <ul>
                    <li>Click the <span class="highlight">microphone icon</span> in your browser's address bar</li>
                    <li>Select <span class="highlight">"Allow"</span> for microphone access</li>
                    <li>Refresh the page and try again</li>
                    <li>In Chrome: Settings → Privacy & Security → Site Settings → Microphone</li>
                </ul>

                <h4>2. HTTPS Required</h4>
                <ul>
                    <li>Microphone access requires <span class="highlight">HTTPS</span> or <span class="highlight">localhost</span></li>
                    <li>If using a web server, ensure it supports HTTPS</li>
                    <li>For local testing, use: <code>python3 -m http.server 8080</code></li>
                    <li>Then access via: <code>http://localhost:8080</code></li>
                </ul>

                <h4>3. Microphone Connection Lost (MediaStreamTrack ended)</h4>
                <ul>
                    <li><span class="highlight">Most common cause:</span> Another app took control of the microphone</li>
                    <li>Close other applications using the microphone (Zoom, Teams, Discord, Skype, etc.)</li>
                    <li>Close other browser tabs that might be using audio</li>
                    <li>Check if your microphone was physically disconnected</li>
                    <li>The app will automatically try to reconnect - watch for notifications</li>
                    <li>If auto-recovery fails, click "Stop" then "Start" to restart</li>
                </ul>

                <h4>4. Microphone in Use</h4>
                <ul>
                    <li>Only one application can use the microphone at a time</li>
                    <li>Exit video calling apps completely (don't just minimize)</li>
                    <li>Check your system tray for hidden apps using audio</li>
                    <li>Restart your browser if needed</li>
                </ul>

                <h4>5. Browser Compatibility</h4>
                <ul>
                    <li><span class="highlight">✅ Recommended:</span> Chrome 66+, Firefox 60+, Safari 14+, Edge 79+</li>
                    <li><span class="highlight">❌ Not supported:</span> Internet Explorer, very old browsers</li>
                    <li>Update your browser to the latest version</li>
                </ul>

                <h4>6. System Audio Settings</h4>
                <ul>
                    <li>Check that your microphone is not muted in system settings</li>
                    <li>Verify the correct microphone is selected as default</li>
                    <li>Test microphone in other applications first</li>
                    <li>Adjust microphone volume/gain if very quiet</li>
                </ul>

                <h4>🔍 Debug Steps:</h4>
                <ul>
                    <li>1. Open browser console (<span class="highlight">F12</span>) and look for error messages</li>
                    <li>2. Use <span class="highlight">"Audio Test"</span> mode to see debug information</li>
                    <li>3. Check the debug panel on the left side of the visualization</li>
                    <li>4. Try speaking loudly near the microphone</li>
                    <li>5. Adjust sensitivity slider (try setting to 10)</li>
                </ul>

                <h4>🎤 Testing Your Microphone:</h4>
                <ul>
                    <li>Try this test: <a href="https://mic-test.org" target="_blank" style="color: #60efff;">mic-test.org</a></li>
                    <li>Or use your computer's built-in voice recorder</li>
                    <li>If those don't work, the issue is with your system, not this app</li>
                </ul>

                <h4>💡 Still Having Issues?</h4>
                <ul>
                    <li>Try a different browser (Chrome is most reliable)</li>
                    <li>Check browser console for specific error messages</li>
                    <li>Try running from a proper web server instead of file://</li>
                    <li>Ensure you're not in private/incognito mode</li>
                </ul>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    try {
        window.liveMusicArtwork = new LiveMusicArtwork();
        
        // Add some helpful console commands for development
        console.log('%cLive Music Artwork loaded successfully!', 'color: #00ff87; font-size: 16px; font-weight: bold;');
        console.log('Available commands:');
        console.log('- liveMusicArtwork.start() - Start visualization');
        console.log('- liveMusicArtwork.stop() - Stop visualization');
        console.log('- liveMusicArtwork.setVisualizationMode(mode) - Set mode (audiotest, simple, beatbackground, windbreeze, leafpile)');
        console.log('- liveMusicArtwork.setColorScheme(scheme) - Set colors (celtic, fire, ocean, sunset)');
        console.log('- liveMusicArtwork.setSensitivity(1-10) - Set audio sensitivity');
        console.log('- liveMusicArtwork.debugAudio() - Show audio debug information');
        console.log('- liveMusicArtwork.testMicrophone() - Test microphone access manually');
        console.log('- liveMusicArtwork.toggleDampening(enabled) - Enable/disable beat dampening');
        console.log('- liveMusicArtwork.setDampening(options) - Set dampening parameters');
        console.log('- liveMusicArtwork.getDampeningSettings() - Show current dampening settings');
        console.log('- liveMusicArtwork.setWindSettings(options) - Set wind visualization parameters');
        console.log('- liveMusicArtwork.resetWindVisualization() - Reset wind visualization');
        console.log('- liveMusicArtwork.setLeafCount(count) - Set number of leaves (10-500)');
        console.log('- liveMusicArtwork.setLeafPhysics(options) - Set leaf physics parameters');
        console.log('- liveMusicArtwork.setLeafWind(options) - Set leaf wind parameters');
        console.log('- liveMusicArtwork.resetLeafPile() - Reset leaves to pile');
        console.log('- liveMusicArtwork.gatherLeaves() - Gather all leaves to center');
        console.log('- liveMusicArtwork.setLeafBeatResponse(options) - Set beat response parameters');
        console.log('- liveMusicArtwork.toggleLeafBeatResponse(enabled) - Enable/disable beat response');
        
        // Add debug methods to the instance
        window.liveMusicArtwork.debugAudio = function() {
            const audioProcessor = this.audioProcessor;
            console.log('🔍 Audio Debug Information:');
            console.log('- Audio Context:', audioProcessor?.audioContext);
            console.log('- Audio Context State:', audioProcessor?.audioContext?.state);
            console.log('- Is Active:', audioProcessor?.isActive);
            console.log('- Microphone Node:', audioProcessor?.microphone);
            console.log('- Analyser Node:', audioProcessor?.analyser);
            console.log('- Current Volume:', audioProcessor?.currentVolume);
            console.log('- Dominant Frequency:', audioProcessor?.dominantFrequency);
            console.log('- Stream:', audioProcessor?.stream);
            if (audioProcessor?.stream) {
                console.log('- Audio Tracks:', audioProcessor.stream.getAudioTracks());
            }
        };
        
        window.liveMusicArtwork.testMicrophone = async function() {
            console.log('🎤 Testing microphone access...');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('✅ Microphone access successful!');
                console.log('📊 Stream details:', stream);
                console.log('🎵 Audio tracks:', stream.getAudioTracks());
                
                // Stop the test stream
                stream.getTracks().forEach(track => track.stop());
                console.log('🔇 Test stream stopped');
            } catch (error) {
                console.error('❌ Microphone test failed:', error);
                console.log('Error name:', error.name);
                console.log('Error message:', error.message);
            }
        };
        
        // Add dampening control methods
        window.liveMusicArtwork.toggleDampening = function(enabled) {
            if (this.visualizationEngine) {
                this.visualizationEngine.toggleDampening(enabled);
                console.log(`🎛️ Dampening ${enabled ? 'enabled' : 'disabled'}`);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.setDampening = function(options) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setDampening(options);
                console.log('🎛️ Dampening settings updated:', options);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.getDampeningSettings = function() {
            if (this.visualizationEngine) {
                const settings = this.visualizationEngine.getDampeningSettings();
                console.log('🎛️ Current dampening settings:', settings);
                return settings;
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
                return null;
            }
        };
        
        // Add wind control methods
        window.liveMusicArtwork.setWindSettings = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setWindSettings(settings);
                console.log('🌬️ Wind settings updated:', settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.resetWindVisualization = function() {
            if (this.visualizationEngine) {
                this.visualizationEngine.resetWindVisualization();
                console.log('🌬️ Wind visualization reset');
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        // Add leaf pile control methods
        window.liveMusicArtwork.setLeafCount = function(count) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setLeafCount(count);
                console.log(`🍂 Leaf count set to: ${count}`);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.setLeafPhysics = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setLeafPhysics(settings);
                console.log('🍂 Leaf physics updated:', settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.setLeafWind = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setLeafWind(settings);
                console.log('🍂 Leaf wind settings updated:', settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.resetLeafPile = function() {
            if (this.visualizationEngine) {
                this.visualizationEngine.resetLeafPile();
                console.log('🍂 Leaf pile reset');
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.gatherLeaves = function() {
            if (this.visualizationEngine) {
                this.visualizationEngine.gatherLeaves();
                console.log('🍂 Leaves gathered to center');
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.setLeafBeatResponse = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setLeafBeatResponse(settings);
                console.log('🍂 Beat response settings updated:', settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.toggleLeafBeatResponse = function(enabled) {
            if (this.visualizationEngine) {
                this.visualizationEngine.toggleLeafBeatResponse(enabled);
                console.log(`🍂 Beat response ${enabled ? 'enabled' : 'disabled'}`);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        // Add helpful examples
        console.log('');
        console.log('🎛️ Dampening examples:');
        console.log('- liveMusicArtwork.toggleDampening(true) - Enable dampening');
        console.log('- liveMusicArtwork.setDampening({maxIntensity: 0.5, decayRate: 0.9}) - Gentle flash');
        console.log('- liveMusicArtwork.setDampening({maxIntensity: 0.9, decayRate: 0.85}) - Strong flash');
        console.log('- liveMusicArtwork.setDampening({smoothingFactor: 0.05}) - Very smooth transitions');
        console.log('');
        console.log('🌬️ Wind examples:');
        console.log('- liveMusicArtwork.setWindSettings({strength: 1.0, gentleness: 0.8}) - Gentle breeze');
        console.log('- liveMusicArtwork.setWindSettings({strength: 2.0, gentleness: 0.5}) - Strong wind');
        console.log('- liveMusicArtwork.setWindSettings({turbulence: 0.2, flowSpeed: 0.05}) - More chaotic');
        console.log('- liveMusicArtwork.setWindSettings({smoothing: 0.02}) - Very smooth movement');
        console.log('- liveMusicArtwork.resetWindVisualization() - Reset all particles');
        console.log('');
        console.log('🍂 Leaf pile examples:');
        console.log('- liveMusicArtwork.setLeafCount(300) - More leaves for bigger pile');
        console.log('- liveMusicArtwork.setLeafPhysics({gravity: 0.2, airResistance: 0.95}) - Heavier leaves');
        console.log('- liveMusicArtwork.setLeafWind({strength: 2.0, gentleness: 0.4}) - Stronger wind effect');
        console.log('- liveMusicArtwork.setLeafPhysics({bounceRestitution: 0.8}) - Bouncier leaves');
        console.log('- liveMusicArtwork.gatherLeaves() - Collect scattered leaves');
        console.log('- liveMusicArtwork.resetLeafPile() - Start fresh pile');
        console.log('');
        console.log('🥁 Beat response examples:');
        console.log('- liveMusicArtwork.setLeafBeatResponse({bounceForce: 12.0}) - Stronger beat bounce');
        console.log('- liveMusicArtwork.setLeafBeatResponse({radiusMultiplier: 2.0}) - Wider beat effect');
        console.log('- liveMusicArtwork.setLeafBeatResponse({volumeThreshold: 20}) - Higher volume needed');
        console.log('- liveMusicArtwork.toggleLeafBeatResponse(false) - Disable beat response');
        console.log('- liveMusicArtwork.toggleLeafBeatResponse(true) - Enable beat response');
        
    } catch (error) {
        console.error('Failed to initialize Live Music Artwork:', error);
        alert('Failed to load application. Please refresh the page.');
    }
}); 