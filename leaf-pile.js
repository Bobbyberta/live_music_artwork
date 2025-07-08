/**
 * LEAF PILE VISUALIZATION
 * 
 * Particles representing leaves on the ground in a pile.
 * Each leaf has mass and area properties, moved by music like wind.
 * Leaves stay contained within screen bounds and settle back to the ground.
 */

class LeafPileVisualization {
    constructor() {
        // Leaf particles
        this.leaves = [];
        this.maxLeaves = 200;
        
        // Physics settings
        this.physics = {
            gravity: 0.12,              // Downward force (reduced for more air time)
            airResistance: 0.95,        // Velocity dampening (reduced for more movement)
            groundFriction: 0.80,       // Friction when on ground (reduced)
            bounceRestitution: 0.4,     // Bounce factor when hitting walls (increased)
            settlingThreshold: 0.3,     // Velocity below which leaves "settle" (reduced)
            maxVelocity: 12.0           // Maximum velocity cap (increased)
        };
        
        // Wind (audio) settings
        this.wind = {
            strength: 1.0,              // Overall wind strength multiplier
            smoothing: 0.08,            // Audio smoothing (higher = smoother)
            gentleness: 0.6,            // How much to dampen chaotic audio
            directionVariance: 0.3,     // How much wind direction varies
            gustiness: 0.2,             // Random wind gusts
            baseDirection: 0,           // Base wind direction in radians
            frequencyInfluence: 0.4     // How much frequency affects direction
        };
        
        // Beat response settings
        this.beatResponse = {
            enabled: true,
            bounceForce: 8.0,           // How strong the beat bounce is
            radiusMultiplier: 1.5,      // How wide the beat effect spreads
            volumeThreshold: 15,        // Minimum volume for beat bounce
            lastBeatTime: 0,
            cooldownTime: 100           // Minimum time between beat responses (ms)
        };
        
        // Leaf properties ranges
        this.leafRanges = {
            mass: { min: 0.5, max: 2.5 },           // Mass affects how wind moves them
            area: { min: 3, max: 12 },              // Visual size and wind resistance
            density: { min: 0.8, max: 1.3 },       // Mass per unit area
            dragCoefficient: { min: 0.6, max: 1.2 } // Air resistance factor
        };
        
        // Colors for different leaf types
        this.leafColors = [
            '#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DEB887',  // Browns
            '#228B22', '#32CD32', '#9ACD32', '#6B8E23', '#808000',  // Greens
            '#FF6347', '#FF4500', '#FF8C00', '#FFA500', '#FFD700',  // Oranges/Reds
            '#B8860B', '#DAA520', '#F4A460', '#D2B48C', '#BC8F8F'   // Golds/Tans
        ];
        
        // Screen bounds (will be set when rendering starts)
        this.bounds = {
            width: 900,
            height: 600,
            margin: 20  // Keep leaves slightly inside edges
        };
        
        // Audio response
        this.smoothedAudio = {
            volume: 0,
            bass: 0,
            mid: 0,
            treble: 0,
            frequency: 440
        };
        
        // Pile settings
        this.pile = {
            centerX: 450,       // Will be updated to screen center
            centerY: 500,       // Near bottom of screen
            radius: 150,        // Spread of initial pile
            layers: 3           // Number of layers in pile
        };
        
        // Visual effects
        this.windIndicators = [];
        this.maxWindIndicators = 10;
        
        this.initializeLeaves();
    }

    initializeLeaves() {
        for (let i = 0; i < this.maxLeaves; i++) {
            this.leaves.push(this.createLeaf());
        }
    }

    createLeaf() {
        // Random properties within ranges
        const area = this.leafRanges.area.min + 
                    Math.random() * (this.leafRanges.area.max - this.leafRanges.area.min);
        const density = this.leafRanges.density.min + 
                       Math.random() * (this.leafRanges.density.max - this.leafRanges.density.min);
        const mass = area * density * 0.1; // Scale mass appropriately
        
        // Position in pile (layered)
        const layer = Math.floor(Math.random() * this.pile.layers);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.pile.radius * (1 - layer * 0.2);
        
        const x = this.pile.centerX + Math.cos(angle) * distance;
        const y = this.pile.centerY + Math.sin(angle) * distance * 0.3 - layer * 5;
        
        return {
            // Position and motion
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            
            // Physical properties
            mass: mass,
            area: area,
            size: Math.sqrt(area) * 0.8,  // Visual size based on area
            dragCoefficient: this.leafRanges.dragCoefficient.min + 
                            Math.random() * (this.leafRanges.dragCoefficient.max - this.leafRanges.dragCoefficient.min),
            
            // Visual properties
            color: this.leafColors[Math.floor(Math.random() * this.leafColors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            opacity: 0.7 + Math.random() * 0.3,
            
            // State
            isSettled: true,
            groundLevel: y,     // Remember where this leaf "belongs"
            windResponse: 0.5 + Math.random() * 0.5,  // Individual wind sensitivity
            
            // Shape variation
            shape: Math.random() < 0.7 ? 'oval' : 'pointed',  // Most leaves are oval
            aspectRatio: 0.6 + Math.random() * 0.4    // Width/height ratio
        };
    }

    updateBounds(width, height) {
        this.bounds.width = width;
        this.bounds.height = height;
        this.pile.centerX = width / 2;
        this.pile.centerY = height - 100; // Near bottom
        
        // Update ground levels for existing leaves
        this.leaves.forEach(leaf => {
            if (leaf.groundLevel > height - this.bounds.margin) {
                leaf.groundLevel = height - this.bounds.margin - Math.random() * 20;
            }
        });
    }

    updateAudioSmoothing(audioData) {
        if (!audioData) return;
        
        const smoothing = this.wind.smoothing;
        const gentleness = this.wind.gentleness;
        
        // Smooth and dampen audio values
        const targetVolume = Math.min(audioData.volume * gentleness, 100);
        const targetBass = Math.min((audioData.bassEnergy || 0) * gentleness, 100);
        const targetMid = Math.min((audioData.midEnergy || 0) * gentleness, 100);
        const targetTreble = Math.min((audioData.trebleEnergy || 0) * gentleness, 100);
        const targetFreq = audioData.dominantFrequency || 440;
        
        this.smoothedAudio.volume = this.smoothedAudio.volume * (1 - smoothing) + targetVolume * smoothing;
        this.smoothedAudio.bass = this.smoothedAudio.bass * (1 - smoothing) + targetBass * smoothing;
        this.smoothedAudio.mid = this.smoothedAudio.mid * (1 - smoothing) + targetMid * smoothing;
        this.smoothedAudio.treble = this.smoothedAudio.treble * (1 - smoothing) + targetTreble * smoothing;
        this.smoothedAudio.frequency = this.smoothedAudio.frequency * (1 - smoothing) + targetFreq * smoothing;
    }

    calculateWindForce(time) {
        // Base wind direction changes slowly
        this.wind.baseDirection = Math.sin(time * 0.02) * 0.5;
        
        // Frequency influences wind direction
        const freqInfluence = (this.smoothedAudio.frequency - 200) / 800; // Map to -1 to 1
        const windDirection = this.wind.baseDirection + freqInfluence * this.wind.frequencyInfluence;
        
        // Wind strength from combined audio
        const volumeForce = (this.smoothedAudio.volume / 100) * this.wind.strength;
        const bassForce = (this.smoothedAudio.bass / 100) * 0.4;
        const midForce = (this.smoothedAudio.mid / 100) * 0.3;
        const trebleForce = (this.smoothedAudio.treble / 100) * 0.2;
        
        const baseStrength = volumeForce + bassForce + midForce + trebleForce;
        
        // Add gustiness (random wind bursts)
        const gustiness = this.wind.gustiness * Math.random() * (this.smoothedAudio.volume / 100);
        const totalStrength = Math.min(baseStrength + gustiness, 3.0);
        
        return {
            strength: totalStrength,
            direction: windDirection,
            variance: this.wind.directionVariance
        };
    }

    handleBeatResponse(audioData) {
        if (!this.beatResponse.enabled || !audioData) return false;
        
        const currentTime = Date.now();
        const timeSinceLastBeat = currentTime - this.beatResponse.lastBeatTime;
        
        // Check for beat detection and cooldown
        if (audioData.beatDetected && 
            audioData.volume > this.beatResponse.volumeThreshold &&
            timeSinceLastBeat > this.beatResponse.cooldownTime) {
            
            this.beatResponse.lastBeatTime = currentTime;
            
            // Calculate beat center (pile center)
            const beatCenterX = this.pile.centerX;
            const beatCenterY = this.pile.centerY;
            const effectRadius = this.pile.radius * this.beatResponse.radiusMultiplier;
            
            // Apply bounce force to leaves within radius
            for (let leaf of this.leaves) {
                const dx = leaf.x - beatCenterX;
                const dy = leaf.y - beatCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < effectRadius) {
                    // Calculate bounce force based on distance and audio intensity
                    const normalizedDistance = distance / effectRadius;
                    const proximityFactor = 1 - normalizedDistance; // Closer = stronger effect
                    
                    // Combine bass energy and volume for bounce strength
                    const audioIntensity = (audioData.volume + (audioData.bassEnergy || 0)) / 200;
                    const bounceStrength = this.beatResponse.bounceForce * proximityFactor * audioIntensity;
                    
                    // Apply upward bounce with slight randomness
                    leaf.vy -= bounceStrength * (0.8 + Math.random() * 0.4);
                    
                    // Add slight horizontal spread
                    const spreadAngle = Math.atan2(dy, dx);
                    leaf.vx += Math.cos(spreadAngle) * bounceStrength * 0.3;
                    
                    // Add rotation from the bounce
                    leaf.rotationSpeed += (Math.random() - 0.5) * 0.2;
                    
                    // Mark as no longer settled
                    leaf.isSettled = false;
                }
            }
            
            return true; // Beat occurred
        }
        
        return false; // No beat
    }

    updateLeaves(windForce, deltaTime = 1) {
        const margin = this.bounds.margin;
        
        for (let leaf of this.leaves) {
            // Store previous position for collision detection
            const prevX = leaf.x;
            const prevY = leaf.y;
            
            // Apply wind force based on leaf properties
            if (windForce.strength > 0.1) {
                const windAngle = windForce.direction + (Math.random() - 0.5) * windForce.variance;
                const windStrength = windForce.strength * leaf.windResponse;
                
                // Wind force inversely proportional to mass, proportional to area
                // Stronger effect for airborne leaves
                const airborneMultiplier = leaf.y < this.bounds.height - 50 ? 2.0 : 1.0;
                const windEffect = (leaf.area / leaf.mass) * windStrength * 0.04 * airborneMultiplier;
                
                leaf.vx += Math.cos(windAngle) * windEffect;
                leaf.vy += Math.sin(windAngle) * windEffect * 0.5; // Reduced vertical but still present
                
                leaf.isSettled = false;
            }
            
            // Apply gravity
            leaf.vy += this.physics.gravity * (leaf.mass * 0.5);
            
            // Apply air resistance
            leaf.vx *= this.physics.airResistance;
            leaf.vy *= this.physics.airResistance;
            
            // Cap velocity
            const velocity = Math.sqrt(leaf.vx * leaf.vx + leaf.vy * leaf.vy);
            if (velocity > this.physics.maxVelocity) {
                const scale = this.physics.maxVelocity / velocity;
                leaf.vx *= scale;
                leaf.vy *= scale;
            }
            
            // Update position
            leaf.x += leaf.vx * deltaTime;
            leaf.y += leaf.vy * deltaTime;
            
            // Boundary collisions with bounce
            if (leaf.x < margin) {
                leaf.x = margin;
                leaf.vx = Math.abs(leaf.vx) * this.physics.bounceRestitution;
            }
            if (leaf.x > this.bounds.width - margin) {
                leaf.x = this.bounds.width - margin;
                leaf.vx = -Math.abs(leaf.vx) * this.physics.bounceRestitution;
            }
            
            // Ground collision
            if (leaf.y > this.bounds.height - margin) {
                leaf.y = this.bounds.height - margin;
                leaf.vy = -Math.abs(leaf.vy) * this.physics.bounceRestitution;
                
                // Apply ground friction
                leaf.vx *= this.physics.groundFriction;
                
                // Check if settled
                if (Math.abs(leaf.vx) < this.physics.settlingThreshold && 
                    Math.abs(leaf.vy) < this.physics.settlingThreshold) {
                    leaf.isSettled = true;
                    leaf.vx = 0;
                    leaf.vy = 0;
                }
            }
            
            // Top boundary (soft)
            if (leaf.y < margin) {
                leaf.y = margin;
                leaf.vy = Math.abs(leaf.vy) * 0.5;
            }
            
            // Update rotation
            leaf.rotation += leaf.rotationSpeed + Math.abs(leaf.vx) * 0.02;
        }
    }

    updateWindIndicators(windForce) {
        // Add wind indicator particles to show wind direction
        if (windForce.strength > 0.5 && Math.random() < 0.3) {
            this.windIndicators.push({
                x: Math.random() * this.bounds.width,
                y: Math.random() * this.bounds.height,
                vx: Math.cos(windForce.direction) * windForce.strength * 2,
                vy: Math.sin(windForce.direction) * windForce.strength * 2,
                life: 60,
                maxLife: 60,
                size: 1 + Math.random() * 2
            });
        }
        
        // Update existing indicators
        this.windIndicators = this.windIndicators.filter(indicator => {
            indicator.x += indicator.vx;
            indicator.y += indicator.vy;
            indicator.life--;
            indicator.vx *= 0.98;
            indicator.vy *= 0.98;
            
            return indicator.life > 0 && 
                   indicator.x > 0 && indicator.x < this.bounds.width &&
                   indicator.y > 0 && indicator.y < this.bounds.height;
        });
        
        // Limit indicator count
        if (this.windIndicators.length > this.maxWindIndicators) {
            this.windIndicators = this.windIndicators.slice(-this.maxWindIndicators);
        }
    }

    render(ctx, audioData, time, width, height) {
        // Update bounds
        this.updateBounds(width, height);
        
        // Clear canvas with ground-like gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(87, 102, 116, 1)');      // Sky blue-gray
        gradient.addColorStop(0.7, 'rgba(101, 118, 96, 1)');    // Earth green-gray
        gradient.addColorStop(1, 'rgba(76, 63, 47, 1)');        // Dark earth
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Handle no audio state
        if (!audioData || audioData.volume < 1) {
            this.renderIdleState(ctx, width, height);
            return;
        }
        
        // Update audio smoothing
        this.updateAudioSmoothing(audioData);
        
        // Handle beat response first (this affects leaf movement)
        const beatOccurred = this.handleBeatResponse(audioData);
        
        // Calculate wind force
        const windForce = this.calculateWindForce(time);
        
        // Update physics
        this.updateLeaves(windForce);
        this.updateWindIndicators(windForce);
        
        // Render everything
        this.renderWindIndicators(ctx);
        this.renderLeaves(ctx);
        this.renderAudioInfo(ctx, audioData, windForce, width, height, beatOccurred);
    }

    renderIdleState(ctx, width, height) {
        // Render leaves in settled state
        this.renderLeaves(ctx);
        
        // Add "waiting for audio" text
        ctx.font = '32px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('🍂 Waiting for Audio...', width/2, height/2 - 100);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('Music will stir the leaves like wind', width/2, height/2 - 60);
        
        // Show leaf count
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(`${this.leaves.length} leaves in the pile`, width/2, height/2 - 30);
    }

    renderLeaves(ctx) {
        // Sort leaves by y position for proper layering
        const sortedLeaves = [...this.leaves].sort((a, b) => a.y - b.y);
        
        for (const leaf of sortedLeaves) {
            ctx.save();
            
            // Set opacity
            ctx.globalAlpha = leaf.opacity;
            
            // Move to leaf position and rotate
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rotation);
            
            // Set color
            ctx.fillStyle = leaf.color;
            
            // Draw leaf shape
            if (leaf.shape === 'pointed') {
                this.drawPointedLeaf(ctx, leaf.size, leaf.aspectRatio);
            } else {
                this.drawOvalLeaf(ctx, leaf.size, leaf.aspectRatio);
            }
            
            ctx.restore();
        }
    }

    drawOvalLeaf(ctx, size, aspectRatio) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * aspectRatio, size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add simple stem
        ctx.strokeStyle = 'rgba(101, 67, 33, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.8);
        ctx.lineTo(0, size * 1.2);
        ctx.stroke();
    }

    drawPointedLeaf(ctx, size, aspectRatio) {
        const width = size * aspectRatio;
        const height = size;
        
        ctx.beginPath();
        ctx.moveTo(0, -height);           // Top point
        ctx.bezierCurveTo(width * 0.6, -height * 0.3, width * 0.6, height * 0.3, 0, height * 0.8);  // Right curve
        ctx.bezierCurveTo(-width * 0.6, height * 0.3, -width * 0.6, -height * 0.3, 0, -height); // Left curve
        ctx.fill();
        
        // Add simple stem
        ctx.strokeStyle = 'rgba(101, 67, 33, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.8);
        ctx.lineTo(0, height * 1.1);
        ctx.stroke();
    }

    renderWindIndicators(ctx) {
        for (const indicator of this.windIndicators) {
            ctx.save();
            ctx.globalAlpha = indicator.life / indicator.maxLife * 0.3;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(indicator.x, indicator.y, indicator.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    renderAudioInfo(ctx, audioData, windForce, width, height, beatOccurred = false) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'left';
        
        // Audio info
        ctx.fillText(`Volume: ${audioData.volume.toFixed(0)}%`, 20, 30);
        ctx.fillText(`Frequency: ${audioData.dominantFrequency.toFixed(1)} Hz`, 20, 50);
        ctx.fillText(`Note: ${audioData.dominantNote || 'Unknown'}`, 20, 70);
        
        // Wind info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Wind Strength: ${(windForce.strength * 33).toFixed(1)}%`, 20, 100);
        ctx.fillText(`Wind Direction: ${(windForce.direction * 57.3).toFixed(0)}°`, 20, 120);
        
        // Beat detection info
        ctx.fillStyle = beatOccurred ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Beat Detection: ${audioData.beatDetected ? 'YES' : 'NO'}`, 20, 140);
        ctx.fillText(`Beat Response: ${this.beatResponse.enabled ? 'ON' : 'OFF'}`, 20, 160);
        
        // Leaf info
        const settledCount = this.leaves.filter(leaf => leaf.isSettled).length;
        const movingCount = this.leaves.length - settledCount;
        const airborneCount = this.leaves.filter(leaf => leaf.y < this.bounds.height - 50).length;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Leaves: ${settledCount} settled, ${airborneCount} airborne`, 20, 180);
        
        // Beat indicator in top-right
        if (beatOccurred) {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255, 100, 100, 1.0)';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('🥁 BEAT!', width - 20, 30);
        }
        
        // Wind flowing indicator
        if (windForce.strength > 0.3) {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('🍃 WIND STIRRING', width - 20, 60);
        }
    }

    // Control methods
    setLeafCount(count) {
        count = Math.max(10, Math.min(500, count)); // Reasonable limits
        
        if (count > this.leaves.length) {
            // Add more leaves
            while (this.leaves.length < count) {
                this.leaves.push(this.createLeaf());
            }
        } else if (count < this.leaves.length) {
            // Remove leaves
            this.leaves = this.leaves.slice(0, count);
        }
        
        this.maxLeaves = count;
        console.log(`🍂 Leaf count set to: ${count}`);
    }

    setPhysicsSettings(settings) {
        this.physics = { ...this.physics, ...settings };
        console.log('🍂 Physics settings updated:', settings);
    }

    setWindSettings(settings) {
        this.wind = { ...this.wind, ...settings };
        console.log('🍂 Wind settings updated:', settings);
    }

    setBeatResponse(settings) {
        this.beatResponse = { ...this.beatResponse, ...settings };
        console.log('🍂 Beat response settings updated:', settings);
    }

    toggleBeatResponse(enabled) {
        this.beatResponse.enabled = enabled;
        console.log(`🍂 Beat response ${enabled ? 'enabled' : 'disabled'}`);
    }

    resetLeaves() {
        this.leaves = [];
        this.initializeLeaves();
        console.log('🍂 Leaves reset to initial pile');
    }

    gatherLeaves() {
        // Move all leaves back to pile center
        this.leaves.forEach(leaf => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.pile.radius;
            leaf.x = this.pile.centerX + Math.cos(angle) * distance;
            leaf.y = this.pile.centerY + Math.sin(angle) * distance * 0.3;
            leaf.vx = 0;
            leaf.vy = 0;
            leaf.isSettled = true;
        });
        console.log('🍂 Gathered all leaves back to pile');
    }
}

// Export for use in main application
window.LeafPileVisualization = LeafPileVisualization; 