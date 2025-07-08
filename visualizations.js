// Visualization engine for dual display music artwork
class VisualizationEngine {
    constructor() {
        this.canvas1 = null;
        this.canvas2 = null;
        this.ctx1 = null;
        this.ctx2 = null;
        this.width = 800;
        this.height = 600;
        this.isRunning = false;
        
        this.mode = 'audiotest';
        this.colorScheme = 'celtic';
        this.audioData = null;
        
        // Animation parameters
        this.time = 0;
        this.particles = [];
        this.celticKnots = [];
        this.waveforms = [];
        
        // Cross-screen particle system
        this.screen1Particles = [];
        this.screen2Particles = [];
        this.travelingParticles = [];
        this.particleTransferRate = 0.02; // Probability per frame of particle travel
        
        // Debug tracking
        this.maxVolumeDetected = 0;
        
        // Color schemes
        this.colorSchemes = {
            celtic: {
                primary: ['#00ff87', '#32cd32', '#228b22'],
                secondary: ['#ffd700', '#ffb347', '#daa520'],
                accent: ['#87ceeb', '#4682b4', '#1e90ff']
            },
            fire: {
                primary: ['#ff4500', '#ff6347', '#dc143c'],
                secondary: ['#ffa500', '#ffb347', '#ff8c00'],
                accent: ['#ffd700', '#ffff00', '#fff8dc']
            },
            ocean: {
                primary: ['#000080', '#191970', '#4169e1'],
                secondary: ['#00bfff', '#87ceeb', '#add8e6'],
                accent: ['#40e0d0', '#48d1cc', '#00ced1']
            },
            sunset: {
                primary: ['#ff69b4', '#ff1493', '#dc143c'],
                secondary: ['#ffa500', '#ff4500', '#ff6347'],
                accent: ['#dda0dd', '#da70d6', '#ba55d3']
            }
        };
    }

    initialize(canvas1Id, canvas2Id) {
        this.canvas1 = document.getElementById(canvas1Id);
        this.canvas2 = document.getElementById(canvas2Id);
        
        if (!this.canvas1 || !this.canvas2) {
            throw new Error('Canvas elements not found');
        }
        
        this.ctx1 = this.canvas1.getContext('2d');
        this.ctx2 = this.canvas2.getContext('2d');
        
        this.width = this.canvas1.width;
        this.height = this.canvas1.height;
        
        // Initialize particles and patterns
        this.initializeParticles();
        this.initializeCelticKnots();
        
        return true;
    }

    initializeParticles() {
        this.particles = [];
        this.screen1Particles = [];
        this.screen2Particles = [];
        this.travelingParticles = [];
        
        const particleCount = 50; // Reduced count per screen for better performance
        
        // Initialize particles for screen 1
        for (let i = 0; i < particleCount; i++) {
            this.screen1Particles.push(this.createParticle(1));
        }
        
        // Initialize particles for screen 2
        for (let i = 0; i < particleCount; i++) {
            this.screen2Particles.push(this.createParticle(2));
        }
        
        // Keep original particles array for other modes
        for (let i = 0; i < particleCount * 2; i++) {
            this.particles.push(this.createParticle(0));
        }
    }

    createParticle(screen = 0) {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            color: 0,
            age: 0,
            maxAge: Math.random() * 200 + 100,
            frequency: Math.random() * 0.1 + 0.05,
            screen: screen, // 0 = both, 1 = screen1, 2 = screen2
            trail: [],
            isTransitioning: false,
            transitionProgress: 0,
            targetScreen: screen
        };
    }

    initializeCelticKnots() {
        this.celticKnots = [];
        const knotCount = 5;
        
        for (let i = 0; i < knotCount; i++) {
            this.celticKnots.push({
                centerX: Math.random() * this.width,
                centerY: Math.random() * this.height,
                radius: Math.random() * 50 + 30,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                amplitude: 1,
                segments: 8
            });
        }
    }

    start() {
        this.isRunning = true;
        
        // Ensure bridge canvas is hidden when starting (unless in dual monitor complementary mode)
        if (!this.isDualMonitorMode() || this.mode !== 'complementary') {
            this.hideBridgeCanvas();
        }
        
        this.animate();
    }

    stop() {
        this.isRunning = false;
        
        // Clean up bridge canvas
        this.hideBridgeCanvas();
        if (this.bridgeCanvas && this.bridgeCanvas.parentNode) {
            this.bridgeCanvas.parentNode.removeChild(this.bridgeCanvas);
            this.bridgeCanvas = null;
        }
    }

    setMode(mode) {
        this.mode = mode;
        
        // Hide bridge canvas when not in complementary mode
        if (mode !== 'complementary') {
            this.hideBridgeCanvas();
        }
    }

    setColorScheme(scheme) {
        this.colorScheme = scheme;
    }

    updateAudioData(data) {
        this.audioData = data;
        
        // Track maximum volume for debugging
        if (data && data.volume > this.maxVolumeDetected) {
            this.maxVolumeDetected = data.volume;
        }
    }

    animate() {
        if (!this.isRunning) return;
        
        this.time += 0.016; // ~60fps
        
        // Clear canvases
        this.clearCanvas(this.ctx1);
        this.clearCanvas(this.ctx2);
        
        if (this.audioData) {
            switch (this.mode) {
                case 'audiotest':
                    this.renderAudioTest();
                    break;
                case 'complementary':
                    this.renderComplementary();
                    break;
                case 'mirror':
                    this.renderMirror();
                    break;
                case 'reactive':
                    this.renderReactive();
                    break;
            }
        } else {
            this.renderIdle();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    clearCanvas(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, this.width, this.height);
    }

    renderComplementary() {
        // Display 1: Frequency spectrum with Celtic patterns
        this.renderFrequencySpectrum(this.ctx1);
        this.renderCelticKnots(this.ctx1);
        
        // Display 2: Waveform with particle system
        this.renderWaveform(this.ctx2);
        
        // Render cross-screen particle system only in dual monitor mode
        if (this.isDualMonitorMode()) {
            this.updateCrossScreenParticles();
            this.renderCrossScreenParticles(this.ctx1, 1);
            this.renderCrossScreenParticles(this.ctx2, 2);
            this.renderTravelingParticles();
        } else {
            // Use regular particle system for single display mode
            this.renderParticles(this.ctx1);
            this.renderParticles(this.ctx2);
            this.hideBridgeCanvas(); // Ensure bridge is hidden
        }
        
        if (this.audioData.beatDetected) {
            this.triggerBeatEffect();
        }
    }

    renderMirror() {
        // Both displays show similar content
        this.renderFrequencySpectrum(this.ctx1);
        this.renderFrequencySpectrum(this.ctx2);
        this.renderParticles(this.ctx1);
        this.renderParticles(this.ctx2);
        
        // Hide bridge canvas in mirror mode
        this.hideBridgeCanvas();
    }

    renderReactive() {
        // Displays react differently to different frequency ranges
        if (this.audioData.frequencyBins.bass > 0.3) {
            this.renderBassVisualization(this.ctx1);
        } else {
            this.renderFrequencySpectrum(this.ctx1);
        }
        
        if (this.audioData.frequencyBins.high > 0.2) {
            this.renderHighFrequencyVisualization(this.ctx2);
        } else {
            this.renderWaveform(this.ctx2);
        }
        
        // Hide bridge canvas in reactive mode
        this.hideBridgeCanvas();
    }

    renderAudioTest() {
        // Simple audio testing visualization
        if (this.audioData) {
            this.renderAudioTestDisplay(this.ctx1, 1);
            this.renderAudioTestDisplay(this.ctx2, 2);
        } else {
            this.renderAudioTestNoData(this.ctx1, 1);
            this.renderAudioTestNoData(this.ctx2, 2);
        }
        
        // Hide bridge canvas in test mode
        this.hideBridgeCanvas();
    }

    renderAudioTestNoData(ctx, displayNum) {
        const colors = this.colorSchemes[this.colorScheme];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Clear with solid background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Title
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = colors.primary[0];
        ctx.textAlign = 'center';
        ctx.fillText(`Audio Test - Display ${displayNum}`, centerX, 40);
        
        // No data message
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('NO AUDIO DATA', centerX, centerY - 50);
        
        ctx.font = '18px Arial';
        ctx.fillStyle = colors.accent[0];
        ctx.fillText('Click "Start Visualization" to begin audio testing', centerX, centerY);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = colors.secondary[0];
        ctx.fillText('Make sure to allow microphone access when prompted', centerX, centerY + 40);
        
        // Status
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('Status: WAITING FOR AUDIO INITIALIZATION', centerX, this.height - 40);
    }

    renderAudioTestDisplay(ctx, displayNum) {
        const colors = this.colorSchemes[this.colorScheme];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Clear with solid background for better visibility
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Title
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = colors.primary[0];
        ctx.textAlign = 'center';
        ctx.fillText(`Audio Test - Display ${displayNum}`, centerX, 40);
        
        // Overall volume meter (large and prominent)
        this.drawVolumeMeter(ctx, centerX, 80, colors);
        
        // Frequency range bars
        this.drawFrequencyRanges(ctx, centerX, 200, colors);
        
        // Dominant frequency display
        this.drawDominantFrequency(ctx, centerX, 320, colors);
        
        // Beat detection indicator
        this.drawBeatIndicator(ctx, centerX, 380, colors);
        
        // Audio level history (simple waveform)
        this.drawAudioHistory(ctx, centerX, 450, colors);
        
        // Raw frequency spectrum (small)
        this.drawMiniSpectrum(ctx, 50, this.height - 120, colors);
        
        // Status indicators
        this.drawStatusIndicators(ctx, centerX, this.height - 40, colors);
        
        // Debug panel (only on display 1)
        if (displayNum === 1) {
            this.drawDebugPanel(ctx, 20, 80, colors);
        }
    }

    drawVolumeMeter(ctx, centerX, y, colors) {
        const volume = this.audioData.volume;
        const meterWidth = 400;
        const meterHeight = 40;
        
        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(centerX - meterWidth/2, y, meterWidth, meterHeight);
        
        // Volume bar
        const fillWidth = (volume / 100) * meterWidth;
        const gradient = ctx.createLinearGradient(centerX - meterWidth/2, 0, centerX + meterWidth/2, 0);
        gradient.addColorStop(0, colors.accent[0]);
        gradient.addColorStop(0.5, colors.primary[0]);
        gradient.addColorStop(1, colors.secondary[0]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - meterWidth/2, y, fillWidth, meterHeight);
        
        // Border
        ctx.strokeStyle = colors.primary[0];
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - meterWidth/2, y, meterWidth, meterHeight);
        
        // Volume text
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Volume: ${Math.round(volume)}%`, centerX, y + 28);
        
        // Label
        ctx.font = '14px Arial';
        ctx.fillStyle = colors.accent[0];
        ctx.fillText('Overall Audio Level', centerX, y - 10);
    }

    drawFrequencyRanges(ctx, centerX, y, colors) {
        const ranges = ['bass', 'midlow', 'mid', 'midhigh', 'high'];
        const labels = ['Bass', 'Mid-Low', 'Mid', 'Mid-High', 'High'];
        const barWidth = 60;
        const maxHeight = 80;
        const spacing = 80;
        const startX = centerX - (ranges.length * spacing) / 2;
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        ranges.forEach((range, index) => {
            const level = this.audioData.frequencyBins[range] || 0;
            const barHeight = level * maxHeight;
            const x = startX + index * spacing;
            
            // Background bar
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(x - barWidth/2, y + maxHeight - maxHeight, barWidth, maxHeight);
            
            // Level bar
            ctx.fillStyle = colors.primary[index % colors.primary.length];
            ctx.fillRect(x - barWidth/2, y + maxHeight - barHeight, barWidth, barHeight);
            
            // Border
            ctx.strokeStyle = colors.accent[0];
            ctx.lineWidth = 1;
            ctx.strokeRect(x - barWidth/2, y, barWidth, maxHeight);
            
            // Label
            ctx.fillStyle = colors.accent[0];
            ctx.fillText(labels[index], x, y + maxHeight + 15);
            
            // Value
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${Math.round(level * 100)}%`, x, y + maxHeight + 30);
        });
        
        // Title
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = colors.primary[0];
        ctx.fillText('Frequency Ranges', centerX, y - 15);
    }

    drawDominantFrequency(ctx, centerX, y, colors) {
        const freq = this.audioData.dominantFrequency;
        
        // Get musical note if AudioProcessor is available globally
        let note = { note: '', octave: 0 };
        if (window.liveMusicArtwork && window.liveMusicArtwork.audioProcessor) {
            note = window.liveMusicArtwork.audioProcessor.getMusicalNote(freq);
        }
        
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = colors.secondary[0];
        ctx.textAlign = 'center';
        ctx.fillText('Dominant Frequency', centerX, y);
        
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = colors.primary[0];
        ctx.fillText(`${Math.round(freq)} Hz`, centerX, y + 40);
        
        if (note.note) {
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = colors.accent[0];
            ctx.fillText(`${note.note}${note.octave}`, centerX, y + 70);
        }
    }

    drawBeatIndicator(ctx, centerX, y, colors) {
        const beatDetected = this.audioData.beatDetected;
        const radius = 30;
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = colors.secondary[0];
        ctx.textAlign = 'center';
        ctx.fillText('Beat Detection', centerX, y - 10);
        
        // Circle indicator
        ctx.beginPath();
        ctx.arc(centerX, y + 20, radius, 0, Math.PI * 2);
        
        if (beatDetected) {
            ctx.fillStyle = colors.primary[0];
            ctx.shadowBlur = 20;
            ctx.shadowColor = colors.primary[0];
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Pulse effect
            ctx.strokeStyle = colors.accent[0];
            ctx.lineWidth = 4;
            ctx.stroke();
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
            ctx.strokeStyle = colors.accent[0];
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Text
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = beatDetected ? '#000000' : colors.accent[0];
        ctx.fillText(beatDetected ? 'BEAT!' : 'No Beat', centerX, y + 26);
    }

    drawAudioHistory(ctx, centerX, y, colors) {
        // Simple visualization of recent audio levels
        if (!this.audioHistory) {
            this.audioHistory = new Array(100).fill(0);
        }
        
        // Add current volume to history
        this.audioHistory.push(this.audioData.volume / 100);
        if (this.audioHistory.length > 100) {
            this.audioHistory.shift();
        }
        
        const width = 300;
        const height = 60;
        const startX = centerX - width / 2;
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = colors.secondary[0];
        ctx.textAlign = 'center';
        ctx.fillText('Audio Level History', centerX, y - 10);
        
        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(startX, y, width, height);
        
        // Draw history line
        ctx.strokeStyle = colors.primary[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.audioHistory.forEach((level, index) => {
            const x = startX + (index / this.audioHistory.length) * width;
            const plotY = y + height - (level * height);
            
            if (index === 0) {
                ctx.moveTo(x, plotY);
            } else {
                ctx.lineTo(x, plotY);
            }
        });
        
        ctx.stroke();
        
        // Border
        ctx.strokeStyle = colors.accent[0];
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, y, width, height);
    }

    drawMiniSpectrum(ctx, x, y, colors) {
        const width = 200;
        const height = 80;
        const barCount = 32;
        const barWidth = width / barCount;
        
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = colors.secondary[0];
        ctx.textAlign = 'left';
        ctx.fillText('Frequency Spectrum', x, y - 10);
        
        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, y, width, height);
        
        // Draw spectrum bars
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * this.audioData.rawFrequencyData.length);
            const barHeight = (this.audioData.rawFrequencyData[dataIndex] / 255) * height;
            
            ctx.fillStyle = colors.primary[0];
            ctx.fillRect(x + i * barWidth, y + height - barHeight, barWidth - 1, barHeight);
        }
        
        // Border
        ctx.strokeStyle = colors.accent[0];
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    drawStatusIndicators(ctx, centerX, y, colors) {
        const sensitivity = this.audioData.sensitivity;
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.accent[0];
        
        const status = [
            `Sensitivity: ${sensitivity}/10`,
            `Sample Rate: 44.1kHz`,
            `FFT Size: 1024`,
            `Status: ${this.audioData.volume > 1 ? 'DETECTING AUDIO' : 'NO AUDIO'}`
        ];
        
        status.forEach((text, index) => {
            const statusColor = index === 3 ? 
                (this.audioData.volume > 1 ? colors.primary[0] : '#ff6b6b') : 
                colors.accent[0];
                
            ctx.fillStyle = statusColor;
            ctx.fillText(text, centerX + (index - 1.5) * 150, y);
        });
    }

    drawDebugPanel(ctx, x, y, colors) {
        const debugInfo = this.getDebugInfo();
        const panelWidth = 350;
        const panelHeight = 240;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // Border
        ctx.strokeStyle = colors.accent[0];
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Title
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = colors.primary[0];
        ctx.textAlign = 'left';
        ctx.fillText('🔍 Audio Debug Info', x + 10, y + 20);
        
        // Debug information
        ctx.font = '12px monospace';
        let lineY = y + 40;
        const lineHeight = 16;
        
        debugInfo.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillText(item.label, x + 10, lineY);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(item.value, x + 160, lineY);
            lineY += lineHeight;
        });
        
        // Instructions
        ctx.font = '11px Arial';
        ctx.fillStyle = colors.secondary[0];
        ctx.fillText('💡 Open browser console (F12) for detailed logs', x + 10, y + panelHeight - 10);
    }

    getDebugInfo() {
        const app = window.liveMusicArtwork;
        const audioProcessor = app ? app.audioProcessor : null;
        
        return [
            {
                label: 'Microphone Permission:',
                value: app && app.isRunning ? '✅ Granted' : '❌ Not granted',
                color: app && app.isRunning ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Audio Context State:',
                value: audioProcessor && audioProcessor.audioContext ? 
                    audioProcessor.audioContext.state : 'Not created',
                color: audioProcessor && audioProcessor.audioContext && 
                    audioProcessor.audioContext.state === 'running' ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Audio Processor Active:',
                value: audioProcessor && audioProcessor.isActive ? '✅ Yes' : '❌ No',
                color: audioProcessor && audioProcessor.isActive ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Microphone Connected:',
                value: audioProcessor && audioProcessor.microphone ? '✅ Yes' : '❌ No',
                color: audioProcessor && audioProcessor.microphone ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Analyser Node:',
                value: audioProcessor && audioProcessor.analyser ? '✅ Created' : '❌ Not created',
                color: audioProcessor && audioProcessor.analyser ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Raw Audio Data:',
                value: this.audioData && this.audioData.rawFrequencyData ? 
                    `${this.audioData.rawFrequencyData.length} samples` : 'No data',
                color: this.audioData && this.audioData.rawFrequencyData && 
                    this.audioData.rawFrequencyData.length > 0 ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'HTTPS/Localhost:',
                value: (location.protocol === 'https:' || location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1') ? '✅ Yes' : '❌ No',
                color: (location.protocol === 'https:' || location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1') ? '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Browser Support:',
                value: navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? 
                    '✅ Supported' : '❌ Not supported',
                color: navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? 
                    '#00ff87' : '#ff6b6b'
            },
            {
                label: 'Max Volume Detected:',
                value: this.maxVolumeDetected ? `${this.maxVolumeDetected.toFixed(1)}%` : '0%',
                color: this.maxVolumeDetected > 5 ? '#00ff87' : '#ffa500'
            },
            {
                label: 'Track Failures:',
                value: audioProcessor && audioProcessor.trackFailures ? 
                    `${audioProcessor.trackFailures} failures` : '0 failures',
                color: audioProcessor && audioProcessor.trackFailures > 0 ? '#ff6b6b' : '#00ff87'
            },
            {
                label: 'Track Muted:',
                value: audioProcessor && audioProcessor.isMuted ? '⚠️ Yes' : '✅ No',
                color: audioProcessor && audioProcessor.isMuted ? '#ffa500' : '#00ff87'
            }
        ];
    }

    renderIdle() {
        // Gentle ambient animation when no audio
        this.renderIdleParticles(this.ctx1);
        this.renderIdleCelticKnots(this.ctx2);
        
        // Ensure bridge canvas is hidden during idle state
        this.hideBridgeCanvas();
    }

    renderFrequencySpectrum(ctx) {
        if (!this.audioData) return;
        
        const colors = this.colorSchemes[this.colorScheme];
        const barWidth = this.width / this.audioData.rawFrequencyData.length;
        
        for (let i = 0; i < this.audioData.rawFrequencyData.length; i++) {
            const barHeight = (this.audioData.rawFrequencyData[i] / 255) * this.height * 0.8;
            const x = i * barWidth;
            
            // Create gradient for each bar
            const gradient = ctx.createLinearGradient(0, this.height, 0, this.height - barHeight);
            gradient.addColorStop(0, colors.primary[0]);
            gradient.addColorStop(0.5, colors.secondary[0]);
            gradient.addColorStop(1, colors.accent[0]);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, this.height - barHeight, barWidth - 1, barHeight);
            
            // Add glow effect for prominent frequencies
            if (this.audioData.rawFrequencyData[i] > 150) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = colors.primary[0];
                ctx.fillRect(x, this.height - barHeight, barWidth - 1, barHeight);
                ctx.shadowBlur = 0;
            }
        }
    }

    renderWaveform(ctx) {
        if (!this.audioData) return;
        
        const colors = this.colorSchemes[this.colorScheme];
        ctx.strokeStyle = colors.accent[0];
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const sliceWidth = this.width / this.audioData.rawTimeDomainData.length;
        let x = 0;
        
        for (let i = 0; i < this.audioData.rawTimeDomainData.length; i++) {
            const v = this.audioData.rawTimeDomainData[i];
            const y = (v + 1) * this.height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.stroke();
        
        // Add multiple waveforms with different phases for richness
        this.renderMultipleWaveforms(ctx);
    }

    renderMultipleWaveforms(ctx) {
        const colors = this.colorSchemes[this.colorScheme];
        
        for (let wave = 0; wave < 3; wave++) {
            ctx.strokeStyle = colors.primary[wave % colors.primary.length];
            ctx.lineWidth = 2 - wave * 0.5;
            ctx.globalAlpha = 0.7 - wave * 0.2;
            ctx.beginPath();
            
            const phase = wave * Math.PI / 3;
            const amplitude = this.audioData.volume * 0.01;
            
            for (let x = 0; x < this.width; x++) {
                const y = this.height / 2 + 
                         Math.sin((x * 0.02) + (this.time * 2) + phase) * 50 * amplitude +
                         Math.sin((x * 0.005) + (this.time * 0.5) + phase) * 30 * amplitude;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    renderCelticKnots(ctx) {
        const colors = this.colorSchemes[this.colorScheme];
        const amplitude = this.audioData ? this.audioData.volume * 0.02 : 0.1;
        
        this.celticKnots.forEach((knot, index) => {
            knot.rotation += knot.rotationSpeed;
            knot.amplitude = 1 + amplitude;
            
            ctx.save();
            ctx.translate(knot.centerX, knot.centerY);
            ctx.rotate(knot.rotation);
            
            ctx.strokeStyle = colors.secondary[index % colors.secondary.length];
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            
            this.drawCelticKnot(ctx, knot.radius * knot.amplitude, knot.segments);
            
            ctx.restore();
        });
    }

    drawCelticKnot(ctx, radius, segments) {
        ctx.beginPath();
        
        for (let i = 0; i <= segments * 4; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = radius * (1 + 0.3 * Math.sin(angle * 3));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
    }

    updateCrossScreenParticles() {
        const audioIntensity = this.audioData ? this.audioData.volume * 0.01 : 0.1;
        const transferProbability = this.particleTransferRate * (1 + audioIntensity);
        
        // Update particles and check for screen transfers
        this.updateParticleArray(this.screen1Particles, 1, transferProbability);
        this.updateParticleArray(this.screen2Particles, 2, transferProbability);
        
        // Update traveling particles
        this.updateTravelingParticles();
    }

    updateParticleArray(particles, screenId, transferProbability) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Update particle physics
            this.updateParticlePhysics(particle);
            
            // Check for screen transfer
            if (Math.random() < transferProbability && this.shouldTransferParticle(particle, screenId)) {
                this.initiateParticleTransfer(particle, screenId);
                particles.splice(i, 1);
            }
            
            // Remove old particles
            if (particle.age > particle.maxAge) {
                particles.splice(i, 1);
                // Replace with new particle
                particles.push(this.createParticle(screenId));
            }
        }
    }

    updateParticlePhysics(particle) {
        // Audio influence
        if (this.audioData) {
            const frequencyInfluence = this.audioData.frequencyBins.mid || 0;
            particle.vx += (Math.random() - 0.5) * frequencyInfluence * 0.1;
            particle.vy += (Math.random() - 0.5) * frequencyInfluence * 0.1;
        }
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.age++;
        
        // Wrap around screen boundaries
        if (particle.x < 0) particle.x = this.width;
        if (particle.x > this.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.height;
        if (particle.y > this.height) particle.y = 0;
        
        // Update trail
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 10) {
            particle.trail.shift();
        }
    }

    shouldTransferParticle(particle, currentScreen) {
        // Transfer particles that are near the edges and moving towards them
        const edgeThreshold = 50;
        const velocityThreshold = 0.5;
        
        if (currentScreen === 1) {
            // From screen 1 to screen 2 - particles moving right
            return particle.x > this.width - edgeThreshold && particle.vx > velocityThreshold;
        } else {
            // From screen 2 to screen 1 - particles moving left
            return particle.x < edgeThreshold && particle.vx < -velocityThreshold;
        }
    }

    initiateParticleTransfer(particle, fromScreen) {
        const targetScreen = fromScreen === 1 ? 2 : 1;
        
        // Create traveling particle
        const travelingParticle = {
            ...particle,
            fromScreen: fromScreen,
            targetScreen: targetScreen,
            transitionProgress: 0,
            startX: particle.x,
            startY: particle.y,
            isTransitioning: true
        };
        
        this.travelingParticles.push(travelingParticle);
    }

    updateTravelingParticles() {
        for (let i = this.travelingParticles.length - 1; i >= 0; i--) {
            const particle = this.travelingParticles[i];
            
            particle.transitionProgress += 0.02; // Speed of transition
            
            if (particle.transitionProgress >= 1) {
                // Transition complete - add to target screen
                const newParticle = {
                    ...particle,
                    x: particle.fromScreen === 1 ? 0 : this.width,
                    y: particle.y,
                    isTransitioning: false,
                    transitionProgress: 0,
                    age: 0 // Reset age for new screen
                };
                
                if (particle.targetScreen === 1) {
                    this.screen1Particles.push(newParticle);
                } else {
                    this.screen2Particles.push(newParticle);
                }
                
                this.travelingParticles.splice(i, 1);
            }
        }
    }

    renderCrossScreenParticles(ctx, screenId) {
        const colors = this.colorSchemes[this.colorScheme];
        const audioIntensity = this.audioData ? this.audioData.volume * 0.01 : 0.1;
        const particles = screenId === 1 ? this.screen1Particles : this.screen2Particles;
        
        particles.forEach((particle, index) => {
            // Draw particle trail
            this.drawParticleTrail(ctx, particle, colors);
            
            // Draw main particle
            const alpha = 1 - (particle.age / particle.maxAge);
            const size = particle.size * (1 + audioIntensity);
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = colors.accent[index % colors.accent.length];
            
            // Add glow effect for particles near edges (about to transfer)
            if (this.shouldTransferParticle(particle, screenId)) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = colors.primary[0];
            }
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Connect nearby particles
            this.connectNearbyParticles(ctx, particle, index, particles);
        });
    }

    drawParticleTrail(ctx, particle, colors) {
        if (particle.trail.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = colors.primary[0];
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        
        for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
    }

    renderTravelingParticles() {
        if (this.travelingParticles.length === 0) {
            this.hideBridgeCanvas();
            return;
        }
        
        // Only render bridge effects in dual monitor mode
        if (!this.isDualMonitorMode()) {
            return;
        }
        
        const colors = this.colorSchemes[this.colorScheme];
        
        this.travelingParticles.forEach(particle => {
            // Create visual bridge effect between screens
            this.renderParticleBridge(particle, colors);
        });
    }

    isDualMonitorMode() {
        // Check if we're in dual monitor mode by looking for app instance
        return window.liveMusicArtwork && window.liveMusicArtwork.isDualMonitorMode;
    }

    hideBridgeCanvas() {
        if (this.bridgeCanvas) {
            this.bridgeCanvas.style.display = 'none';
        }
    }

    showBridgeCanvas() {
        if (this.bridgeCanvas) {
            this.bridgeCanvas.style.display = 'block';
        }
    }

    renderParticleBridge(particle, colors) {
        // Only render bridge in dual monitor mode
        if (!this.isDualMonitorMode()) {
            return;
        }
        
        // Draw connecting line between the screens
        const canvas1Rect = this.canvas1.getBoundingClientRect();
        const canvas2Rect = this.canvas2.getBoundingClientRect();
        
        // Create a temporary canvas overlay for the bridge effect only when needed
        if (!this.bridgeCanvas) {
            this.bridgeCanvas = document.createElement('canvas');
            this.bridgeCanvas.style.position = 'fixed';
            this.bridgeCanvas.style.top = '0';
            this.bridgeCanvas.style.left = '0';
            this.bridgeCanvas.style.pointerEvents = 'none';
            this.bridgeCanvas.style.zIndex = '1000';
            this.bridgeCanvas.style.display = 'none'; // Hidden by default
            this.bridgeCanvas.width = window.innerWidth;
            this.bridgeCanvas.height = window.innerHeight;
            document.body.appendChild(this.bridgeCanvas);
        }
        
        // Show bridge canvas only when actually rendering particles
        this.showBridgeCanvas();
        
        const bridgeCtx = this.bridgeCanvas.getContext('2d');
        bridgeCtx.clearRect(0, 0, this.bridgeCanvas.width, this.bridgeCanvas.height);
        
        // Calculate positions
        const progress = particle.transitionProgress;
        const startX = particle.fromScreen === 1 ? canvas1Rect.right : canvas2Rect.left;
        const endX = particle.fromScreen === 1 ? canvas2Rect.left : canvas1Rect.right;
        const startY = canvas1Rect.top + particle.startY * (canvas1Rect.height / this.height);
        const endY = canvas2Rect.top + particle.y * (canvas2Rect.height / this.height);
        
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        
        // Draw traveling particle
        bridgeCtx.save();
        bridgeCtx.globalAlpha = 0.8;
        bridgeCtx.fillStyle = colors.primary[0];
        bridgeCtx.shadowBlur = 20;
        bridgeCtx.shadowColor = colors.primary[0];
        bridgeCtx.beginPath();
        bridgeCtx.arc(currentX, currentY, particle.size * 2, 0, Math.PI * 2);
        bridgeCtx.fill();
        
        // Draw connecting trail
        bridgeCtx.strokeStyle = colors.accent[0];
        bridgeCtx.lineWidth = 3;
        bridgeCtx.globalAlpha = 0.5;
        bridgeCtx.beginPath();
        bridgeCtx.moveTo(startX, startY);
        bridgeCtx.lineTo(currentX, currentY);
        bridgeCtx.stroke();
        
        bridgeCtx.restore();
    }

    renderParticles(ctx) {
        const colors = this.colorSchemes[this.colorScheme];
        const audioIntensity = this.audioData ? this.audioData.volume * 0.01 : 0.1;
        
        this.particles.forEach((particle, index) => {
            // Update particle based on audio
            if (this.audioData) {
                const frequencyInfluence = this.audioData.frequencyBins.mid || 0;
                particle.vx += (Math.random() - 0.5) * frequencyInfluence * 0.1;
                particle.vy += (Math.random() - 0.5) * frequencyInfluence * 0.1;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.age++;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;
            
            // Reset if too old
            if (particle.age > particle.maxAge) {
                particle.age = 0;
                particle.x = Math.random() * this.width;
                particle.y = Math.random() * this.height;
            }
            
            // Draw particle
            const alpha = 1 - (particle.age / particle.maxAge);
            const size = particle.size * (1 + audioIntensity);
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = colors.accent[index % colors.accent.length];
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Connect nearby particles
            this.connectNearbyParticles(ctx, particle, index);
        });
    }

    connectNearbyParticles(ctx, particle, index, particleArray = null) {
        const colors = this.colorSchemes[this.colorScheme];
        const maxDistance = 100;
        const particles = particleArray || this.particles;
        
        for (let i = index + 1; i < particles.length; i++) {
            const other = particles[i];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const alpha = (1 - distance / maxDistance) * 0.3;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = colors.primary[0];
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    renderBassVisualization(ctx) {
        const colors = this.colorSchemes[this.colorScheme];
        const bassIntensity = this.audioData.frequencyBins.bass;
        
        // Create expanding circles for bass hits
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) / 2;
        
        for (let i = 0; i < 5; i++) {
            const radius = (i + 1) * bassIntensity * maxRadius / 5;
            const alpha = (1 - i / 5) * bassIntensity;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = colors.primary[i % colors.primary.length];
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    renderHighFrequencyVisualization(ctx) {
        const colors = this.colorSchemes[this.colorScheme];
        const highIntensity = this.audioData.frequencyBins.high;
        
        // Create sparkle effect for high frequencies
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 5 * highIntensity;
            
            ctx.save();
            ctx.globalAlpha = highIntensity;
            ctx.fillStyle = colors.accent[Math.floor(Math.random() * colors.accent.length)];
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.accent[0];
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    renderIdleParticles(ctx) {
        // Gentle particle movement when no audio
        this.particles.forEach(particle => {
            particle.x += Math.sin(this.time + particle.frequency) * 0.5;
            particle.y += Math.cos(this.time + particle.frequency) * 0.5;
            
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#00ff87';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    renderIdleCelticKnots(ctx) {
        // Slow rotating Celtic knots when no audio
        this.celticKnots.forEach((knot, index) => {
            knot.rotation += 0.005;
            
            ctx.save();
            ctx.translate(knot.centerX, knot.centerY);
            ctx.rotate(knot.rotation);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            
            this.drawCelticKnot(ctx, knot.radius, knot.segments);
            ctx.restore();
        });
    }

    triggerBeatEffect() {
        // Flash effect on beat detection
        this.canvas1.classList.add('active-visualization');
        this.canvas2.classList.add('active-visualization');
        
        setTimeout(() => {
            this.canvas1.classList.remove('active-visualization');
            this.canvas2.classList.remove('active-visualization');
        }, 200);
        
        // Spawn new particles on beat
        if (this.mode === 'complementary') {
            // Add particles to both screens and some that will travel
            for (let i = 0; i < 5; i++) {
                // Screen 1 particles
                const particle1 = this.createParticle(1);
                particle1.vx = (Math.random() - 0.5) * 5;
                particle1.vy = (Math.random() - 0.5) * 5;
                particle1.size = Math.random() * 5 + 2;
                particle1.maxAge = 50;
                this.screen1Particles.push(particle1);
                
                // Screen 2 particles
                const particle2 = this.createParticle(2);
                particle2.vx = (Math.random() - 0.5) * 5;
                particle2.vy = (Math.random() - 0.5) * 5;
                particle2.size = Math.random() * 5 + 2;
                particle2.maxAge = 50;
                this.screen2Particles.push(particle2);
            }
            
            // Create immediate cross-screen transfer particles
            for (let i = 0; i < 3; i++) {
                const fromScreen = Math.random() > 0.5 ? 1 : 2;
                const particle = this.createParticle(fromScreen);
                particle.x = fromScreen === 1 ? this.width - 10 : 10;
                particle.y = Math.random() * this.height;
                particle.vx = fromScreen === 1 ? 2 : -2;
                particle.size = Math.random() * 5 + 2;
                particle.maxAge = 100;
                this.initiateParticleTransfer(particle, fromScreen);
            }
        } else {
            // Original behavior for other modes
            for (let i = 0; i < 10; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    size: Math.random() * 5 + 2,
                    color: 0,
                    age: 0,
                    maxAge: 50,
                    frequency: Math.random() * 0.1 + 0.05
                });
            }
        }
    }
}

// Export for use in other modules
window.VisualizationEngine = VisualizationEngine; 