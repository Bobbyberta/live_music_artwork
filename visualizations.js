// Visualization engine for dual display music artwork
class VisualizationEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Animation state
        this.isRunning = false;
        this.animationId = null;
        
        // Audio data
        this.audioData = null;
        
        // Animation parameters
        this.time = 0;
        
        // Debug tracking
        this.maxVolumeDetected = 0;
        
        // Current visualization reference
        this.currentVisualization = null;
        
        // Color schemes
        this.colorSchemes = {
            celtic: {
                primary: ['#00ff87', '#60efff', '#88d8c0'],
                secondary: ['#7209b7', '#560bad', '#480ca8'],
                accent: ['#f72585', '#b5179e', '#7209b7']
            },
            fire: {
                primary: ['#ff6b35', '#f7931e', '#ffd23f'],
                secondary: ['#c1272d', '#a4161a', '#ba181b'],
                accent: ['#e85d04', '#dc2f02', '#9d0208']
            },
            ocean: {
                primary: ['#06ffa5', '#39a0ca', '#0077be'],
                secondary: ['#004e89', '#1a508b', '#0f3460'],
                accent: ['#7209b7', '#560bad', '#480ca8']
            },
            sunset: {
                primary: ['#ffbe0b', '#fb8500', '#ff006e'],
                secondary: ['#8338ec', '#3a86ff', '#06ffa5'],
                accent: ['#fb8500', '#ffb3c6', '#ffccd5']
            }
        };
        
        this.currentColorScheme = 'celtic';
        this.currentMode = 'audiotest';
        

        
        // Initialize all visualizations
        this.balloonFloatViz = new BalloonFloatVisualization();
        
        // Animation loop is now controlled by start() and stop() methods
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Set the current visualization reference
        switch(mode) {
            case 'balloon-float':
                this.currentVisualization = this.balloonFloatViz;
                break;
            default:
                this.currentVisualization = null;
        }
        
        console.log(`🎨 Visualization mode set to: ${mode}`);
    }

    setColorScheme(scheme) {
        if (this.colorSchemes[scheme]) {
            this.currentColorScheme = scheme;
            console.log(`🎨 Color scheme set to: ${scheme}`);
        }
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
        
        if (this.currentMode === 'audiotest') {
            this.renderAudioTest();
        } else if (this.currentMode === 'balloon-float') {
            this.renderBalloonFloat();
        } else {
            this.renderIdle();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear the canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }





    renderAudioTest() {
        const colors = this.colorSchemes[this.currentColorScheme];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(26, 26, 46, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (!this.audioData || this.audioData.volume < 1) {
            // No audio detected
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('NO AUDIO DETECTED', centerX, centerY - 50);
            
            this.ctx.font = '18px Arial';
            this.ctx.fillStyle = colors.accent[0];
            this.ctx.fillText('Check microphone and permissions', centerX, centerY - 10);
            this.ctx.fillText('Speak or play music near the microphone', centerX, centerY + 20);
            
            // Status indicators
            this.drawStatusIndicators(centerX, this.height - 40, colors);
            
            // Debug panel
            this.drawDebugPanel(20, 80, colors);
            return;
        }
        
        // Audio detected - show detailed test interface
        const volume = this.audioData.volume;
        const bassEnergy = this.audioData.bassEnergy || 0;
        const midEnergy = this.audioData.midEnergy || 0;
        const trebleEnergy = this.audioData.trebleEnergy || 0;
        const highEnergy = this.audioData.highEnergy || 0;
        const dominantFreq = this.audioData.dominantFrequency || 0;
        const dominantNote = this.audioData.dominantNote || 'Unknown';
        const beatDetected = this.audioData.beatDetected || false;
        
        // Large "DETECTING AUDIO" header
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = colors.primary[0];
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DETECTING AUDIO', centerX, 60);
        
        // Volume meter (large circle)
        const volumeRadius = 80;
        const fillRadius = (volume / 100) * volumeRadius;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, 150, volumeRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = colors.accent[0];
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        if (fillRadius > 0) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, 150, fillRadius, 0, Math.PI * 2);
            const volumeGradient = this.ctx.createRadialGradient(centerX, 150, 0, centerX, 150, fillRadius);
            volumeGradient.addColorStop(0, colors.primary[0] + 'CC');
            volumeGradient.addColorStop(1, colors.primary[0] + '44');
            this.ctx.fillStyle = volumeGradient;
            this.ctx.fill();
        }
        
        // Volume percentage
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`${volume.toFixed(1)}%`, centerX, 158);
        
        // Frequency range bars
        const barWidth = 40;
        const barSpacing = 60;
        const startX = centerX - (barSpacing * 2);
        const barMaxHeight = 80;
        const barBaseY = 320;
        
        const energies = [
            { label: 'Bass', value: bassEnergy, color: colors.primary[0] },
            { label: 'Mid', value: midEnergy, color: colors.primary[1] },
            { label: 'Treble', value: trebleEnergy, color: colors.primary[2] },
            { label: 'High', value: highEnergy, color: colors.secondary[0] }
        ];
        
        energies.forEach((energy, index) => {
            const x = startX + (index * barSpacing);
            const barHeight = (energy.value / 100) * barMaxHeight;
            
            // Bar background
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fillRect(x, barBaseY - barMaxHeight, barWidth, barMaxHeight);
            
            // Bar fill
            this.ctx.fillStyle = energy.color;
            this.ctx.fillRect(x, barBaseY - barHeight, barWidth, barHeight);
            
            // Label
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = colors.accent[0];
            this.ctx.textAlign = 'center';
            this.ctx.fillText(energy.label, x + barWidth/2, barBaseY + 20);
            this.ctx.fillText(`${energy.value.toFixed(0)}%`, x + barWidth/2, barBaseY + 35);
        });
        
        // Dominant frequency and note
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = colors.secondary[0];
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Dominant Frequency: ${dominantFreq.toFixed(1)} Hz`, centerX, 380);
        this.ctx.fillText(`Musical Note: ${dominantNote}`, centerX, 400);
        
        // Beat detection indicator
        if (beatDetected) {
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fillText('♪ BEAT DETECTED ♪', centerX, 430);
        }
        
        // Mini frequency spectrum
        this.drawMiniSpectrum(centerX - 150, 460, 300, 40, colors);
        
        // Audio history graph
        this.drawAudioHistory(centerX - 150, 520, 300, 60, colors);
        
        // Status indicators
        this.drawStatusIndicators(centerX, this.height - 40, colors);
        
        // Debug panel
        this.drawDebugPanel(20, 80, colors);
    }

    drawMiniSpectrum(x, y, width, height, colors) {
        if (!this.audioData || !this.audioData.rawFrequencyData) return;
        
        const data = this.audioData.rawFrequencyData;
        const barWidth = width / data.length;
        
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.fillRect(x, y, width, height);
        
        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / 255) * height;
            const hue = (i / data.length) * 360;
            
            this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            this.ctx.fillRect(x + i * barWidth, y + height - barHeight, barWidth - 1, barHeight);
        }
        
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = colors.accent[0];
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Frequency Spectrum', x, y - 5);
    }

    drawAudioHistory(x, y, width, height, colors) {
        // Simple placeholder for audio history
        this.ctx.strokeStyle = colors.primary[1];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < width; i += 2) {
            const historyValue = Math.sin((this.time + i * 0.02) * 3) * 0.3 + 0.5;
            const plotY = y + height - (historyValue * height);
            
            if (i === 0) {
                this.ctx.moveTo(x + i, plotY);
            } else {
                this.ctx.lineTo(x + i, plotY);
            }
        }
        
        this.ctx.stroke();
        
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = colors.accent[0];
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Audio History', x, y - 5);
    }

    drawStatusIndicators(centerX, y, colors) {
        const sensitivity = this.audioData?.sensitivity || 5;
        
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = colors.accent[0];
        
        const status = [
            `Sensitivity: ${sensitivity}/10`,
            `Sample Rate: 44.1kHz`,
            `FFT Size: 1024`,
            `Status: ${this.audioData && this.audioData.volume > 1 ? 'DETECTING AUDIO' : 'NO AUDIO'}`
        ];
        
        status.forEach((text, index) => {
            const statusColor = index === 3 ? 
                (this.audioData && this.audioData.volume > 1 ? colors.primary[0] : '#ff6b6b') : 
                colors.accent[0];
                
            this.ctx.fillStyle = statusColor;
            this.ctx.fillText(text, centerX + (index - 1.5) * 150, y);
        });
    }

    drawDebugPanel(x, y, colors) {
        const debugInfo = this.getDebugInfo();
        const panelWidth = 350;
        const panelHeight = 240;
        
        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // Border
        this.ctx.strokeStyle = colors.accent[0];
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Title
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = colors.primary[0];
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🔍 Audio Debug Info', x + 10, y + 20);
        
        // Debug information
        this.ctx.font = '12px monospace';
        let lineY = y + 40;
        const lineHeight = 16;
        
        debugInfo.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.fillText(item.label, x + 10, lineY);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(item.value, x + 160, lineY);
            lineY += lineHeight;
        });
        
        // Instructions
        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = colors.secondary[0];
        this.ctx.fillText('💡 Open browser console (F12) for detailed logs', x + 10, y + panelHeight - 10);
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
        // Fallback for unknown modes
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#60efff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Select a visualization mode', this.width/2, this.height/2);
    }







    renderBalloonFloat() {
        // Use the balloon float visualization
        this.balloonFloatViz.render(this.ctx, this.audioData, this.time, this.width, this.height);
    }







    // Methods to control balloon float settings
    setBalloonSettings(settings) {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.setBalloonSettings(settings);
        }
    }

    setBalloonBeatResponse(settings) {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.setBeatResponse(settings);
        }
    }

    setBalloonColors(settings) {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.setColorInfluence(settings);
        }
    }
    
    getBalloonMusicSpeed() {
        if (this.balloonFloatViz) {
            return this.balloonFloatViz.getCurrentMusicSpeed();
        }
        return 0;
    }

    toggleBalloonBeatResponse(enabled) {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.toggleBeatResponse(enabled);
        }
    }

    resetBalloons() {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.resetBalloons();
        }
    }
    
    setSpikeSettings(settings) {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.setSpikeSettings(settings);
        }
    }
    
    getSpikeSettings() {
        if (this.balloonFloatViz) {
            return this.balloonFloatViz.getSpikeSettings();
        }
        return null;
    }
    
    toggleSpikeDetection(enabled) {
        if (this.balloonFloatViz) {
            this.balloonFloatViz.toggleSpikeDetection(enabled);
        }
    }



    // Methods to control debug information display
    toggleDebugInfo(show) {
        // Apply to balloon visualization
        if (this.balloonFloatViz) {
            this.balloonFloatViz.toggleDebugInfo(show);
        }
        
        // Could be extended to other visualizations in the future
        // if (this.leafPileViz) {
        //     this.leafPileViz.toggleDebugInfo(show);
        // }
    }
    
    getDebugInfoState() {
        // Get state from balloon visualization (or could be a global setting)
        if (this.balloonFloatViz) {
            return this.balloonFloatViz.getDebugInfoState();
        }
        return true; // Default to showing debug info
    }
    
    // Update canvas bounds for all visualizations
    updateBounds(width, height) {
        this.width = width;
        this.height = height;
        
        // Update bounds for all visualizations that support it
        if (this.balloonFloatViz && this.balloonFloatViz.updateBounds) {
            this.balloonFloatViz.updateBounds(width, height);
        }
    }
} 