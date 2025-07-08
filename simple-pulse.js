class SimplePulseVisualization {
    constructor() {
        this.pulseSize = 0;
        this.targetPulseSize = 0;
        this.maxPulseSize = 150;
        this.minPulseSize = 50;
        this.smoothing = 0.1;
        
        // Visual settings
        this.baseColor = { r: 100, g: 150, b: 255 };
        this.pulseColor = { r: 255, g: 100, b: 150 };
        this.opacity = 0.8;
        
        // Audio smoothing
        this.smoothedVolume = 0;
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.smoothedTreble = 0;
        
        // Animation properties
        this.rotation = 0;
        this.particles = [];
        this.maxParticles = 20;
    }
    
    updateAudioSmoothing(audioData) {
        if (!audioData) return;
        
        const smoothing = this.smoothing;
        
        this.smoothedVolume = this.smoothedVolume * (1 - smoothing) + audioData.volume * smoothing;
        this.smoothedBass = this.smoothedBass * (1 - smoothing) + (audioData.bassEnergy || 0) * smoothing;
        this.smoothedMid = this.smoothedMid * (1 - smoothing) + (audioData.midEnergy || 0) * smoothing;
        this.smoothedTreble = this.smoothedTreble * (1 - smoothing) + (audioData.trebleEnergy || 0) * smoothing;
    }
    
    updatePulse() {
        // Calculate target pulse size based on volume
        const volumeNormalized = this.smoothedVolume / 100;
        this.targetPulseSize = this.minPulseSize + (volumeNormalized * (this.maxPulseSize - this.minPulseSize));
        
        // Smooth the pulse size
        this.pulseSize = this.pulseSize * 0.9 + this.targetPulseSize * 0.1;
        
        // Update rotation
        this.rotation += 0.02;
    }
    
    updateParticles(audioData) {
        // Add particles based on treble energy
        if (this.smoothedTreble > 30 && Math.random() < 0.3) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                size: 2 + Math.random() * 4,
                opacity: 0.8
            });
        }
        
        // Update existing particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.size *= 0.99;
            particle.opacity = particle.life;
            return particle.life > 0;
        });
        
        // Limit particle count
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
    }
    
    render(ctx, audioData, time, width, height) {
        // Clear canvas with dark background
        ctx.fillStyle = 'rgba(10, 10, 20, 1)';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Handle no audio state
        if (!audioData || audioData.volume < 1) {
            this.renderIdleState(ctx, centerX, centerY, width, height);
            return;
        }
        
        // Update audio smoothing
        this.updateAudioSmoothing(audioData);
        
        // Update pulse and particles
        this.updatePulse();
        this.updateParticles(audioData);
        
        // Render main pulse circle
        this.renderPulseCircle(ctx, centerX, centerY);
        
        // Render particles
        this.renderParticles(ctx, centerX, centerY);
        
        // Render frequency bars
        this.renderFrequencyBars(ctx, centerX, centerY);
        
        // Render audio info
        this.renderAudioInfo(ctx, audioData, width, height);
    }
    
    renderIdleState(ctx, centerX, centerY, width, height) {
        // Show static pulse
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}, 0.3)`;
        ctx.fill();
        
        // Show idle message
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎵 Waiting for music...', centerX, centerY + 120);
    }
    
    renderPulseCircle(ctx, centerX, centerY) {
        // Calculate colors based on audio
        const volumeIntensity = this.smoothedVolume / 100;
        const bassIntensity = this.smoothedBass / 100;
        
        // Mix colors based on audio
        const r = Math.floor(this.baseColor.r + (this.pulseColor.r - this.baseColor.r) * volumeIntensity);
        const g = Math.floor(this.baseColor.g + (this.pulseColor.g - this.baseColor.g) * bassIntensity);
        const b = Math.floor(this.baseColor.b + (this.pulseColor.b - this.baseColor.b) * volumeIntensity);
        
        // Outer glow
        const glowSize = this.pulseSize * 1.5;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
        glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Main pulse circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
        ctx.fill();
        
        // Inner highlight
        const highlightSize = this.pulseSize * 0.6;
        const highlightGradient = ctx.createRadialGradient(
            centerX - highlightSize * 0.3, centerY - highlightSize * 0.3, 0,
            centerX, centerY, highlightSize
        );
        highlightGradient.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
        highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, highlightSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderParticles(ctx, centerX, centerY) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = `rgba(${this.pulseColor.r}, ${this.pulseColor.g}, ${this.pulseColor.b}, 1)`;
            ctx.beginPath();
            ctx.arc(centerX + particle.x, centerY + particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
    
    renderFrequencyBars(ctx, centerX, centerY) {
        const barCount = 8;
        const barWidth = 4;
        const barMaxHeight = 40;
        const radius = this.pulseSize + 30;
        
        // Draw frequency bars around the pulse
        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2 + this.rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Get frequency value (simplified)
            let barHeight = 0;
            if (i < 2) barHeight = this.smoothedBass / 100 * barMaxHeight;
            else if (i < 5) barHeight = this.smoothedMid / 100 * barMaxHeight;
            else barHeight = this.smoothedTreble / 100 * barMaxHeight;
            
            // Draw bar
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillStyle = `rgba(${this.baseColor.r}, ${this.baseColor.g}, ${this.baseColor.b}, 0.8)`;
            ctx.fillRect(-barWidth / 2, 0, barWidth, barHeight);
            ctx.restore();
        }
    }
    
    renderAudioInfo(ctx, audioData, width, height) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'left';
        
        // Basic audio info
        ctx.fillText(`Volume: ${audioData.volume.toFixed(0)}%`, 20, 30);
        ctx.fillText(`Frequency: ${audioData.dominantFrequency.toFixed(1)} Hz`, 20, 50);
        ctx.fillText(`Note: ${audioData.dominantNote || 'Unknown'}`, 20, 70);
        
        // Energy levels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Bass: ${this.smoothedBass.toFixed(0)}%`, 20, 100);
        ctx.fillText(`Mid: ${this.smoothedMid.toFixed(0)}%`, 20, 120);
        ctx.fillText(`Treble: ${this.smoothedTreble.toFixed(0)}%`, 20, 140);
        
        // Beat detection
        const beatDetected = audioData.beatDetected || false;
        ctx.fillStyle = beatDetected ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Beat: ${beatDetected ? 'YES' : 'NO'}`, 20, 160);
    }
    
    // Control methods
    setPulseSettings(settings) {
        if (settings.maxSize) this.maxPulseSize = settings.maxSize;
        if (settings.minSize) this.minPulseSize = settings.minSize;
        if (settings.smoothing) this.smoothing = settings.smoothing;
    }
    
    setColors(baseColor, pulseColor) {
        if (baseColor) this.baseColor = baseColor;
        if (pulseColor) this.pulseColor = pulseColor;
    }
    
    reset() {
        this.pulseSize = this.minPulseSize;
        this.targetPulseSize = this.minPulseSize;
        this.particles = [];
        this.rotation = 0;
    }
} 