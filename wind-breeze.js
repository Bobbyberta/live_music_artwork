/**
 * WIND BREEZE VISUALIZATION
 * 
 * A delicate, flowing wind effect that moves across the screen in sync with music.
 * Maintains smooth, playful motion even when audio is chaotic.
 */

class WindBreezeVisualization {
    constructor() {
        // Wind particles
        this.windParticles = [];
        this.maxParticles = 150;
        
        // Wind flow settings
        this.wind = {
            baseDirection: 0,           // Base wind direction in radians
            strength: 0.5,              // Wind strength multiplier
            turbulence: 0.1,            // Amount of chaotic movement
            flowSpeed: 0.02,            // How fast wind patterns change
            smoothing: 0.05,            // Audio smoothing factor (higher = smoother)
            maxStrength: 2.0,           // Maximum wind strength
            gentleness: 0.7             // How much to dampen chaotic audio (0-1)
        };
        
        // Audio response
        this.smoothedVolume = 0;
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.smoothedTreble = 0;
        this.smoothedFrequency = 440;
        
        // Visual elements
        this.windStreaks = [];
        this.maxStreaks = 8;
        this.leafParticles = [];
        this.maxLeaves = 20;
        
        // Colors
        this.colors = {
            particles: ['rgba(255, 255, 255, 0.3)', 'rgba(200, 230, 255, 0.4)', 'rgba(180, 255, 220, 0.3)'],
            streaks: ['rgba(255, 255, 255, 0.1)', 'rgba(200, 230, 255, 0.2)', 'rgba(180, 255, 220, 0.15)'],
            leaves: ['rgba(100, 200, 100, 0.6)', 'rgba(150, 180, 100, 0.5)', 'rgba(200, 150, 100, 0.4)']
        };
        
        // Time and animation
        this.time = 0;
        this.windPhase = 0;
        
        this.initializeParticles();
        this.initializeStreaks();
        this.initializeLeaves();
    }

    initializeParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.windParticles.push(this.createWindParticle());
        }
    }

    createWindParticle() {
        return {
            x: Math.random() * 1200, // Start off-screen
            y: Math.random() * 800,
            vx: 0,
            vy: 0,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            life: Math.random() * 100 + 50,
            maxLife: 150,
            color: this.colors.particles[Math.floor(Math.random() * this.colors.particles.length)],
            windResponse: Math.random() * 0.5 + 0.5, // How much this particle responds to wind
            turbulence: Math.random() * 0.3 + 0.1
        };
    }

    initializeStreaks() {
        for (let i = 0; i < this.maxStreaks; i++) {
            this.windStreaks.push(this.createWindStreak());
        }
    }

    createWindStreak() {
        return {
            x: Math.random() * 1200,
            y: Math.random() * 800,
            length: Math.random() * 100 + 50,
            angle: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.3 + 0.1,
            speed: Math.random() * 0.5 + 0.2,
            life: Math.random() * 200 + 100,
            maxLife: 300,
            color: this.colors.streaks[Math.floor(Math.random() * this.colors.streaks.length)],
            curve: Math.random() * 0.02 + 0.01
        };
    }

    initializeLeaves() {
        for (let i = 0; i < this.maxLeaves; i++) {
            this.leafParticles.push(this.createLeaf());
        }
    }

    createLeaf() {
        return {
            x: Math.random() * 1200,
            y: Math.random() * 800,
            vx: 0,
            vy: 0,
            size: Math.random() * 4 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.7 + 0.3,
            life: Math.random() * 300 + 200,
            maxLife: 500,
            color: this.colors.leaves[Math.floor(Math.random() * this.colors.leaves.length)],
            flutter: Math.random() * 0.1 + 0.05,
            windResponse: Math.random() * 0.8 + 0.2
        };
    }

    updateAudioSmoothing(audioData) {
        if (!audioData) return;
        
        const smoothing = this.wind.smoothing;
        const gentleness = this.wind.gentleness;
        
        // Smooth audio values to prevent chaotic movement
        const targetVolume = Math.min(audioData.volume * gentleness, 100);
        const targetBass = Math.min((audioData.bassEnergy || 0) * gentleness, 100);
        const targetMid = Math.min((audioData.midEnergy || 0) * gentleness, 100);
        const targetTreble = Math.min((audioData.trebleEnergy || 0) * gentleness, 100);
        const targetFreq = audioData.dominantFrequency || 440;
        
        this.smoothedVolume = this.smoothedVolume * (1 - smoothing) + targetVolume * smoothing;
        this.smoothedBass = this.smoothedBass * (1 - smoothing) + targetBass * smoothing;
        this.smoothedMid = this.smoothedMid * (1 - smoothing) + targetMid * smoothing;
        this.smoothedTreble = this.smoothedTreble * (1 - smoothing) + targetTreble * smoothing;
        this.smoothedFrequency = this.smoothedFrequency * (1 - smoothing) + targetFreq * smoothing;
    }

    calculateWindForce(audioData) {
        // Base wind direction changes slowly
        this.windPhase += this.wind.flowSpeed;
        this.wind.baseDirection = Math.sin(this.windPhase) * 0.5;
        
        // Wind strength based on smoothed audio
        const volumeForce = (this.smoothedVolume / 100) * this.wind.strength;
        const bassForce = (this.smoothedBass / 100) * 0.3;
        const midForce = (this.smoothedMid / 100) * 0.4;
        const trebleForce = (this.smoothedTreble / 100) * 0.2;
        
        const totalForce = Math.min(volumeForce + bassForce + midForce + trebleForce, this.wind.maxStrength);
        
        // Wind direction influenced by frequency
        const freqInfluence = (this.smoothedFrequency - 200) / 1000; // Map frequency to direction
        const windDirection = this.wind.baseDirection + (freqInfluence * 0.3);
        
        return {
            strength: totalForce,
            direction: windDirection,
            turbulence: this.wind.turbulence * (this.smoothedVolume / 100)
        };
    }

    updateWindParticles(windForce, width, height) {
        for (let i = 0; i < this.windParticles.length; i++) {
            const particle = this.windParticles[i];
            
            // Apply wind force
            const windStrength = windForce.strength * particle.windResponse;
            particle.vx += Math.cos(windForce.direction) * windStrength * 0.02;
            particle.vy += Math.sin(windForce.direction) * windStrength * 0.02;
            
            // Add turbulence for natural movement
            particle.vx += (Math.random() - 0.5) * windForce.turbulence * particle.turbulence;
            particle.vy += (Math.random() - 0.5) * windForce.turbulence * particle.turbulence;
            
            // Apply gentle gravity and air resistance
            particle.vy += 0.001; // Very subtle gravity
            particle.vx *= 0.98; // Air resistance
            particle.vy *= 0.98;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update life
            particle.life--;
            particle.opacity = (particle.life / particle.maxLife) * 0.5;
            
            // Reset particle if it goes off screen or dies
            if (particle.x > width + 100 || particle.x < -100 || 
                particle.y > height + 100 || particle.y < -100 || 
                particle.life <= 0) {
                this.windParticles[i] = this.createWindParticle();
                this.windParticles[i].x = -50; // Start from left
                this.windParticles[i].y = Math.random() * height;
            }
        }
    }

    updateWindStreaks(windForce, width, height) {
        for (let i = 0; i < this.windStreaks.length; i++) {
            const streak = this.windStreaks[i];
            
            // Move streak with wind
            streak.x += Math.cos(streak.angle) * streak.speed + Math.cos(windForce.direction) * windForce.strength * 0.5;
            streak.y += Math.sin(streak.angle) * streak.speed + Math.sin(windForce.direction) * windForce.strength * 0.5;
            
            // Curve the streak slightly
            streak.angle += streak.curve * (Math.random() - 0.5);
            
            // Update life
            streak.life--;
            streak.opacity = (streak.life / streak.maxLife) * 0.3;
            
            // Reset streak if it goes off screen or dies
            if (streak.x > width + 100 || streak.x < -100 || 
                streak.y > height + 100 || streak.y < -100 || 
                streak.life <= 0) {
                this.windStreaks[i] = this.createWindStreak();
                this.windStreaks[i].x = -50;
                this.windStreaks[i].y = Math.random() * height;
            }
        }
    }

    updateLeaves(windForce, width, height) {
        for (let i = 0; i < this.leafParticles.length; i++) {
            const leaf = this.leafParticles[i];
            
            // Apply wind force
            const windStrength = windForce.strength * leaf.windResponse;
            leaf.vx += Math.cos(windForce.direction) * windStrength * 0.01;
            leaf.vy += Math.sin(windForce.direction) * windStrength * 0.01;
            
            // Add flutter effect
            leaf.vx += Math.sin(this.time * 0.1) * leaf.flutter;
            leaf.vy += Math.cos(this.time * 0.1) * leaf.flutter;
            
            // Gravity and air resistance
            leaf.vy += 0.002;
            leaf.vx *= 0.95;
            leaf.vy *= 0.95;
            
            // Update position and rotation
            leaf.x += leaf.vx;
            leaf.y += leaf.vy;
            leaf.rotation += leaf.rotationSpeed;
            
            // Update life
            leaf.life--;
            leaf.opacity = (leaf.life / leaf.maxLife) * 0.7;
            
            // Reset leaf if it goes off screen or dies
            if (leaf.x > width + 100 || leaf.x < -100 || 
                leaf.y > height + 100 || leaf.y < -100 || 
                leaf.life <= 0) {
                this.leafParticles[i] = this.createLeaf();
                this.leafParticles[i].x = -50;
                this.leafParticles[i].y = Math.random() * height;
            }
        }
    }

    render(ctx, audioData, time, width, height) {
        this.time = time;
        
        // Clear canvas with subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(20, 25, 40, 1)');
        gradient.addColorStop(0.5, 'rgba(25, 30, 50, 1)');
        gradient.addColorStop(1, 'rgba(15, 20, 35, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Handle no audio state
        if (!audioData || audioData.volume < 1) {
            this.renderIdleWind(ctx, width, height);
            return;
        }
        
        // Update audio smoothing
        this.updateAudioSmoothing(audioData);
        
        // Calculate wind force
        const windForce = this.calculateWindForce(audioData);
        
        // Update all particle systems
        this.updateWindParticles(windForce, width, height);
        this.updateWindStreaks(windForce, width, height);
        this.updateLeaves(windForce, width, height);
        
        // Render all elements
        this.renderWindStreaks(ctx);
        this.renderWindParticles(ctx);
        this.renderLeaves(ctx);
        this.renderAudioInfo(ctx, audioData, windForce, width, height);
    }

    renderIdleWind(ctx, width, height) {
        // Gentle idle wind animation
        for (let i = 0; i < 30; i++) {
            const x = (this.time * 20 + i * 40) % (width + 100);
            const y = height/2 + Math.sin(this.time * 0.5 + i * 0.5) * 100;
            
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Waiting text
        ctx.font = '32px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('🌬️ Waiting for Audio...', width/2, height/2);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('A gentle breeze will flow with your music', width/2, height/2 + 40);
    }

    renderWindParticles(ctx) {
        for (const particle of this.windParticles) {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    renderWindStreaks(ctx) {
        for (const streak of this.windStreaks) {
            ctx.save();
            ctx.globalAlpha = streak.opacity;
            ctx.strokeStyle = streak.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(streak.x, streak.y);
            ctx.lineTo(
                streak.x + Math.cos(streak.angle) * streak.length,
                streak.y + Math.sin(streak.angle) * streak.length
            );
            ctx.stroke();
            ctx.restore();
        }
    }

    renderLeaves(ctx) {
        for (const leaf of this.leafParticles) {
            ctx.save();
            ctx.globalAlpha = leaf.opacity;
            ctx.fillStyle = leaf.color;
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    renderAudioInfo(ctx, audioData, windForce, width, height) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'left';
        
        // Audio info
        ctx.fillText(`Volume: ${audioData.volume.toFixed(0)}%`, 20, 30);
        ctx.fillText(`Frequency: ${audioData.dominantFrequency.toFixed(1)} Hz`, 20, 50);
        ctx.fillText(`Note: ${audioData.dominantNote || 'Unknown'}`, 20, 70);
        
        // Wind info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(`Wind Strength: ${(windForce.strength * 50).toFixed(1)}%`, 20, 100);
        ctx.fillText(`Wind Direction: ${(windForce.direction * 57.3).toFixed(0)}°`, 20, 120);
        ctx.fillText(`Particles: ${this.windParticles.length}`, 20, 140);
        
        // Wind indicator in top-right
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('🌬️ WIND FLOWING', width - 20, 30);
    }

    // Control methods
    setWindSettings(settings) {
        this.wind = { ...this.wind, ...settings };
        console.log('🌬️ Wind settings updated:', settings);
    }

    reset() {
        this.windParticles = [];
        this.windStreaks = [];
        this.leafParticles = [];
        this.initializeParticles();
        this.initializeStreaks();
        this.initializeLeaves();
        this.smoothedVolume = 0;
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.smoothedTreble = 0;
        this.time = 0;
        this.windPhase = 0;
    }
}

// Export for use in main application
window.WindBreezeVisualization = WindBreezeVisualization; 