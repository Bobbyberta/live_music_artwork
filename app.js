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
        // Initialize DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.visualModeSelect = document.getElementById('visualMode');

        this.troubleshootBtn = document.getElementById('troubleshootBtn');
        this.debugToggleBtn = document.getElementById('debugToggleBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.fullscreenExitBtn = document.getElementById('fullscreenExitBtn');
        this.micStatus = document.getElementById('micStatus');
        this.audioLevel = document.getElementById('audioLevel');
        this.frequencyDisplay = document.getElementById('frequency');
        this.volumeDisplay = document.getElementById('volume');

        
        // State
        this.isFullscreen = false;
        this.originalCanvasSize = {
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Verify all elements exist
        if (!this.startBtn || !this.stopBtn || !this.canvas || !this.sensitivitySlider || 
            !this.visualModeSelect || !this.debugToggleBtn ||
            !this.micStatus || !this.audioLevel || !this.fullscreenBtn || !this.fullscreenExitBtn ||
            !this.frequencyDisplay || !this.volumeDisplay) {
            console.error('❌ Some DOM elements are missing');
            return;
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
            
            this.updateVisualizationMode(mode);
            

        });
        

        

        
        // Fullscreen
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Fullscreen exit button
        this.fullscreenExitBtn.addEventListener('click', () => {
            this.exitFullscreen();
        });
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('mozfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('MSFullscreenChange', () => {
            this.handleFullscreenChange();
        });
        
        // Debug toggle button
        this.debugToggleBtn.addEventListener('click', () => {
            this.toggleDebugInfo();
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
                    if (this.isFullscreen) {
                        this.exitFullscreen();
                    } else if (this.isRunning) {
                        this.stop();
                    }
                    break;
                case 'KeyF':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
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
            
            // Start audio processing with callback
            this.audioProcessor.addCallback((audioData) => {
                this.handleAudioData(audioData);
            });
            this.audioProcessor.startAnalysis();
            
            this.isRunning = true;
            this.updateUIState();
            
            // Update debug button text and visibility for current visualization
            this.updateDebugButtonText();
            this.updateDebugButtonVisibility(this.visualModeSelect.value);
            
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
        if (this.isFullscreen) {
            // Update canvas size in fullscreen mode
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Update visualization engine bounds if it exists
            if (this.visualizationEngine) {
                this.visualizationEngine.updateBounds(this.canvas.width, this.canvas.height);
            }
        }
    }



    updateVisualizationMode(mode) {
        // Update visualization mode if engine is running
        if (this.visualizationEngine) {
            this.visualizationEngine.setMode(mode);
            // Update debug button text for the new visualization
            this.updateDebugButtonText();
        }
        
        // Update debug button visibility
        this.updateDebugButtonVisibility(mode);
    }

    updateDebugButtonVisibility(mode) {
        // Show/hide debug button based on visualization support
        if (this.debugToggleBtn) {
            if (mode === 'balloon-float') {
                this.debugToggleBtn.style.display = 'inline-block';
            } else {
                this.debugToggleBtn.style.display = 'none';
            }
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



    setSensitivity(value) {
        if (this.sensitivitySlider) {
            this.sensitivitySlider.value = value;
            this.sensitivitySlider.dispatchEvent(new Event('input'));
        }
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        // Add fullscreen class to body
        document.body.classList.add('fullscreen-mode');
        
        // Store original canvas size
        this.originalCanvasSize = {
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Set canvas to full screen size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update canvas styling
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        
        // Update visualization engine bounds if it exists
        if (this.visualizationEngine) {
            this.visualizationEngine.updateBounds(this.canvas.width, this.canvas.height);
        }
        
        this.isFullscreen = true;
        this.fullscreenBtn.textContent = 'Exit Fullscreen';
        
        // Request browser fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        // Remove fullscreen class from body
        document.body.classList.remove('fullscreen-mode');
        
        // Restore original canvas size
        this.canvas.width = this.originalCanvasSize.width;
        this.canvas.height = this.originalCanvasSize.height;
        
        // Reset canvas styling
        this.canvas.style.width = '';
        this.canvas.style.height = '';
        
        // Update visualization engine bounds if it exists
        if (this.visualizationEngine) {
            this.visualizationEngine.updateBounds(this.canvas.width, this.canvas.height);
        }
        
        this.isFullscreen = false;
        this.fullscreenBtn.textContent = 'Toggle Fullscreen';
        
        // Exit browser fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        // Handle cases where user exits fullscreen using browser controls
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
            if (this.isFullscreen) {
                this.exitFullscreen();
            }
        }
    }

    toggleDebugInfo() {
        if (this.visualizationEngine) {
            // Get current debug state and toggle it
            const currentState = this.visualizationEngine.getDebugInfoState();
            this.visualizationEngine.toggleDebugInfo(!currentState);
            
            // Update button text
            this.debugToggleBtn.textContent = currentState ? 'Show Debug Info' : 'Hide Debug Info';
        }
    }
    
    // Update debug button text based on current state
    updateDebugButtonText() {
        if (this.visualizationEngine) {
            const currentState = this.visualizationEngine.getDebugInfoState();
            this.debugToggleBtn.textContent = currentState ? 'Hide Debug Info' : 'Show Debug Info';
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
        console.log('- liveMusicArtwork.setVisualizationMode(mode) - Set mode (audiotest, balloon-float)');

        console.log('- liveMusicArtwork.setSensitivity(1-10) - Set audio sensitivity');
        console.log('- liveMusicArtwork.debugAudio() - Show audio debug information');
        console.log('- liveMusicArtwork.testMicrophone() - Test microphone access manually');

        console.log('- liveMusicArtwork.setBalloonSettings(options) - Set balloon properties');
        console.log('- liveMusicArtwork.setBalloonBeatResponse(options) - Set balloon beat response');
        console.log('- liveMusicArtwork.setBalloonColors(options) - Set balloon color settings');
        console.log('- liveMusicArtwork.toggleBalloonBeatResponse(enabled) - Enable/disable balloon pop response');
        console.log('- liveMusicArtwork.resetBalloons() - Reset all balloons');
        console.log('- liveMusicArtwork.getBalloonMusicSpeed() - Get current music speed multiplier');

        console.log('- liveMusicArtwork.toggleDebugInfo(true/false) - Show/hide debug information');
        console.log('- liveMusicArtwork.getDebugInfoState() - Check if debug info is currently shown');
        
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
        

        
        // Balloon float control methods
        window.liveMusicArtwork.setBalloonSettings = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setBalloonSettings(settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.setBalloonBeatResponse = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setBalloonBeatResponse(settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.setBalloonColors = function(settings) {
            if (this.visualizationEngine) {
                this.visualizationEngine.setBalloonColors(settings);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.getBalloonMusicSpeed = function() {
            if (this.visualizationEngine) {
                const speed = this.visualizationEngine.getBalloonMusicSpeed();
                console.log(`🎈 Current music speed: ${speed.toFixed(2)}x`);
                return speed;
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
                return 0;
            }
        };
        
        window.liveMusicArtwork.toggleBalloonBeatResponse = function(enabled) {
            if (this.visualizationEngine) {
                this.visualizationEngine.toggleBalloonBeatResponse(enabled);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.resetBalloons = function() {
            if (this.visualizationEngine) {
                this.visualizationEngine.resetBalloons();
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        

        
        // Debug control methods
        window.liveMusicArtwork.toggleDebugInfo = function(show) {
            if (this.visualizationEngine) {
                this.visualizationEngine.toggleDebugInfo(show);
                console.log(`🐛 Debug info ${show ? 'enabled' : 'disabled'}`);
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
            }
        };
        
        window.liveMusicArtwork.getDebugInfoState = function() {
            if (this.visualizationEngine) {
                const state = this.visualizationEngine.getDebugInfoState();
                console.log(`🐛 Debug info is currently ${state ? 'enabled' : 'disabled'}`);
                return state;
            } else {
                console.log('⚠️ Visualization engine not initialized. Start the visualization first.');
                return false;
            }
        };
        
        // Add helpful examples
        console.log('');

        console.log('🎈 Balloon examples:');
        console.log('- liveMusicArtwork.setBalloonSettings({baseSize: 80, sizeVariance: 30, spawnRate: 0.6}) - Bigger balloons, more frequent spawning');
        console.log('- liveMusicArtwork.setBalloonBeatResponse({volumeThreshold: 20, cooldownTime: 60}) - Adjust beat response sensitivity');
        console.log('- liveMusicArtwork.setBalloonColors({volumeInfluence: 0.8, bassInfluence: 0.5}) - Colors more influenced by music');
        console.log('- liveMusicArtwork.getBalloonMusicSpeed() - Check current music speed multiplier');
        console.log('- liveMusicArtwork.toggleBalloonBeatResponse(false) - Disable balloon beat response');
        console.log('- liveMusicArtwork.toggleBalloonBeatResponse(true) - Enable balloon beat response');
        console.log('- liveMusicArtwork.resetBalloons() - Reset all balloons');
        console.log('Note: Balloons now pop on EVERY detected beat (if visible), speed responds to music tempo');
        console.log('');

        console.log('🐛 Debug Control examples:');
        console.log('- liveMusicArtwork.toggleDebugInfo(false) - Hide all debug information');
        console.log('- liveMusicArtwork.toggleDebugInfo(true) - Show debug information');
        console.log('- liveMusicArtwork.getDebugInfoState() - Check current debug state');
        
        // Troubleshooting guide button
        document.getElementById('troubleshootBtn').addEventListener('click', function() {
            alert(`Audio Troubleshooting Guide:

1. MICROPHONE PERMISSIONS
   - Check browser microphone permissions
   - Look for microphone icon in address bar
   - Grant permission when prompted

2. MICROPHONE SELECTION
   - Try different audio input devices
   - Check system microphone settings
   - Ensure microphone is not muted

3. AUDIO LEVELS
   - Speak louder or move closer to microphone
   - Check system audio input levels
   - Try adjusting the sensitivity slider

4. BROWSER COMPATIBILITY
   - Chrome/Firefox work best
   - Try refreshing the page
   - Check browser console for errors

5. COMMON ISSUES
   - Close other apps using microphone
   - Try in incognito/private mode
   - Restart browser if needed

The visualization needs audio input to work properly!`);
        });
        

        
        // Color control visibility
    } catch (error) {
        console.error('Failed to initialize Live Music Artwork:', error);
        alert('Failed to load application. Please refresh the page.');
    }
}); 