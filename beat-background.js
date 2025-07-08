/**
 * BEAT BACKGROUND VISUALIZATION
 * 
 * A simple but effective visualization that changes background color on beat detection.
 * Perfect for ambient lighting effects during performances.
 */

class BeatBackgroundVisualization {
    constructor() {
        // Default colors
        this.backgroundColor = '#1a1a2e';
        this.beatColor = '#ff6b6b';
        
        // Animation state
        this.beatFlashIntensity = 0;
        this.beatFlashDecay = 0.92;
        this.lastBeatTime = 0;
        this.beatFlashDuration = 300; // milliseconds
        
        // Dampening controls for smoother transitions
        this.dampening = {
            enabled: true,
            maxIntensity: 0.7,        // Maximum flash intensity (0.0 to 1.0)
            smoothingFactor: 0.15,    // How quickly to approach target intensity (0.0 to 1.0)
            minIntensity: 0.02,       // Minimum intensity before stopping flash
            attackTime: 0.05,         // How quickly intensity rises on beat
            decayRate: 0.88           // How quickly intensity fades (slower = more dampening)
        };
        
        // Smoothed flash intensity for dampening
        this.smoothedFlashIntensity = 0;
        this.targetFlashIntensity = 0;
        
        // Volume-based brightness
        this.volumeBrightness = 0;
        this.volumeSmoothing = 0.8;
        
        // Beat detection history for smoother effects
        this.beatHistory = [];
        this.beatHistoryLength = 5;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        console.log(`🎨 Background color set to: ${color}`);
    }

    setBeatColor(color) {
        this.beatColor = color;
        console.log(`🎨 Beat color set to: ${color}`);
    }

    // Set dampening controls
    setDampening(options) {
        this.dampening = { ...this.dampening, ...options };
        console.log(`🎛️ Dampening updated:`, this.dampening);
    }

    // Enable/disable dampening
    toggleDampening(enabled) {
        this.dampening.enabled = enabled;
        console.log(`🎛️ Dampening ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Convert hex color to RGB values
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Interpolate between two colors
    interpolateColor(color1, color2, factor) {
        if (factor > 1) factor = 1;
        if (factor < 0) factor = 0;
        
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    render(ctx, audioData, time, width, height) {
        // Handle no audio state
        if (!audioData || audioData.volume < 1) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, width, height);
            
            // Add "waiting for audio" text
            ctx.font = '32px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText('🎵 Waiting for Audio...', width/2, height/2);
            
            ctx.font = '16px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText('Background will flash with the beat when music is detected', width/2, height/2 + 40);
            
            return;
        }

        // Get audio data
        const volume = audioData.volume;
        const beatDetected = audioData.beatDetected || false;
        const currentTime = Date.now();

        // Update volume-based brightness (subtle ambient effect)
        const targetVolumeBrightness = Math.min(0.3, volume / 100 * 0.3);
        this.volumeBrightness = this.volumeBrightness * this.volumeSmoothing + 
                                targetVolumeBrightness * (1 - this.volumeSmoothing);

        // Handle beat detection
        if (beatDetected) {
            this.lastBeatTime = currentTime;
            
            if (this.dampening.enabled) {
                // Use dampening - set target intensity and let smoothing handle the rest
                this.targetFlashIntensity = this.dampening.maxIntensity;
                
                // Apply attack time for immediate response
                this.smoothedFlashIntensity = Math.min(
                    this.smoothedFlashIntensity + this.dampening.attackTime,
                    this.targetFlashIntensity
                );
            } else {
                // Original behavior without dampening
                this.beatFlashIntensity = 1.0;
                this.targetFlashIntensity = 1.0;
                this.smoothedFlashIntensity = 1.0;
            }
            
            // Add to beat history
            this.beatHistory.push(currentTime);
            if (this.beatHistory.length > this.beatHistoryLength) {
                this.beatHistory.shift();
            }
        }

        // Update flash intensity based on dampening settings
        if (this.dampening.enabled) {
            // Exponential decay for target intensity
            this.targetFlashIntensity *= this.dampening.decayRate;
            
            // Smooth interpolation towards target
            const difference = this.targetFlashIntensity - this.smoothedFlashIntensity;
            this.smoothedFlashIntensity += difference * this.dampening.smoothingFactor;
            
            // Stop flash when below minimum intensity
            if (this.smoothedFlashIntensity < this.dampening.minIntensity) {
                this.smoothedFlashIntensity = 0;
                this.targetFlashIntensity = 0;
            }
            
            // Use smoothed intensity for color calculation
            this.beatFlashIntensity = this.smoothedFlashIntensity;
        } else {
            // Original exponential decay without dampening
            this.beatFlashIntensity *= this.beatFlashDecay;
        }
        
        // Calculate time since last beat for additional effects
        const timeSinceLastBeat = currentTime - this.lastBeatTime;
        const beatFlashActive = timeSinceLastBeat < this.beatFlashDuration;

        // Calculate final background color
        let finalColor = this.backgroundColor;
        
        if (beatFlashActive && this.beatFlashIntensity > 0.01) {
            // Interpolate between background and beat color
            finalColor = this.interpolateColor(
                this.backgroundColor, 
                this.beatColor, 
                this.beatFlashIntensity
            );
        } else if (this.volumeBrightness > 0.01) {
            // Subtle brightness variation based on volume
            const rgb = this.hexToRgb(this.backgroundColor);
            if (rgb) {
                const brightnessBoost = Math.round(this.volumeBrightness * 255);
                finalColor = `rgb(${Math.min(255, rgb.r + brightnessBoost)}, ${Math.min(255, rgb.g + brightnessBoost)}, ${Math.min(255, rgb.b + brightnessBoost)})`;
            }
        }

        // Fill the entire canvas with the calculated color
        ctx.fillStyle = finalColor;
        ctx.fillRect(0, 0, width, height);

        // Add subtle audio information overlay
        this.renderAudioOverlay(ctx, audioData, width, height, timeSinceLastBeat);
    }

    renderAudioOverlay(ctx, audioData, width, height, timeSinceLastBeat) {
        // Show current audio info in subtle overlay
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'left';
        
        const volume = audioData.volume;
        const dominantFreq = audioData.dominantFrequency || 0;
        const dominantNote = audioData.dominantNote || 'Unknown';
        
        // Audio info in top-left corner
        ctx.fillText(`Volume: ${volume.toFixed(0)}%`, 20, 30);
        ctx.fillText(`Frequency: ${dominantFreq.toFixed(1)} Hz`, 20, 50);
        ctx.fillText(`Note: ${dominantNote}`, 20, 70);
        
        // Dampening info
        if (this.dampening.enabled) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`Dampening: ON (${(this.dampening.maxIntensity * 100).toFixed(0)}%)`, 20, 90);
            ctx.fillText(`Flash Intensity: ${(this.beatFlashIntensity * 100).toFixed(1)}%`, 20, 110);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`Dampening: OFF`, 20, 90);
        }
        
        // Beat indicator in top-right corner
        ctx.textAlign = 'right';
        if (timeSinceLastBeat < 500) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('♪ BEAT ♪', width - 20, 30);
        }
        
        // Beat frequency indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        const beatFrequency = this.calculateBeatFrequency();
        if (beatFrequency > 0) {
            ctx.fillText(`Beat: ${beatFrequency.toFixed(1)} BPM`, width - 20, 50);
        }
        
        // Color info in bottom-left corner
        ctx.textAlign = 'left';
        ctx.fillText(`Background: ${this.backgroundColor}`, 20, height - 40);
        ctx.fillText(`Beat Color: ${this.beatColor}`, 20, height - 20);
    }

    calculateBeatFrequency() {
        if (this.beatHistory.length < 2) return 0;
        
        // Calculate average time between beats
        const intervals = [];
        for (let i = 1; i < this.beatHistory.length; i++) {
            intervals.push(this.beatHistory[i] - this.beatHistory[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return avgInterval > 0 ? (60000 / avgInterval) : 0; // Convert to BPM
    }

    // Reset visualization state
    reset() {
        this.beatFlashIntensity = 0;
        this.smoothedFlashIntensity = 0;
        this.targetFlashIntensity = 0;
        this.volumeBrightness = 0;
        this.beatHistory = [];
        this.lastBeatTime = 0;
    }
}

// Export for use in main application
window.BeatBackgroundVisualization = BeatBackgroundVisualization; 