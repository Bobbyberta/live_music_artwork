class BalloonFloatVisualization {
    constructor() {
        this.balloons = [];
        this.maxBalloons = 25;
        this.poppedBalloons = [];
        
        // Balloon settings
        this.balloonSettings = {
            baseSpeed: 1.5,          // Base upward speed
            speedVariance: 0.8,      // Random speed tolerance
            baseSize: 50,            // Base balloon size
            sizeVariance: 35,        // Size randomness
            spawnRate: 0.4,          // How often new balloons spawn
            horizontalDrift: 0.2     // Slight horizontal movement
        };
        
        // Beat response settings
        this.beatResponse = {
            enabled: true,
            volumeThreshold: 12,     // Minimum volume for pop
            lastBeatTime: 0,
            cooldownTime: 10         // Minimum time between pops
        };
        
        // Color settings based on music
        this.colorSettings = {
            hueShift: 0,            // Base hue that shifts with frequency
            saturation: 0.8,        // Color saturation
            lightness: 0.6,         // Color lightness
            volumeInfluence: 0.4,   // How much volume affects brightness
            bassInfluence: 0.3      // How much bass affects color warmth
        };
        
        // Screen bounds
        this.bounds = {
            width: 900,
            height: 600,
            spawnMargin: 50
        };
        
        // Audio data smoothing
        this.smoothedAudio = {
            volume: 0,
            bass: 0,
            mid: 0,
            treble: 0,
            frequency: 440
        };
        
        // Pop effects
        this.popEffects = [];
        
        // Current music speed for display
        this.currentMusicSpeed = 1.0;
        
        // Beat pop tracking
        this.beatPopOccurred = false;
        this.lastBeatDetected = false;
        this.lastPopInfo = null;
        
        // Debug info toggle
        this.showDebugInfo = true;
        
        this.initializeBalloons();
    }
    
    initializeBalloons() {
        // Create initial balloons spread throughout the screen
        for (let i = 0; i < this.maxBalloons; i++) {
            this.balloons.push(this.createBalloon(Math.random() * this.bounds.height));
        }
    }
    
    createBalloon(startY = null) {
        const size = this.balloonSettings.baseSize + 
                    (Math.random() - 0.5) * this.balloonSettings.sizeVariance;
        
        // Speed determined by music tempo/energy
        const musicSpeed = this.calculateMusicSpeed();
        const speed = musicSpeed + (Math.random() - 0.5) * this.balloonSettings.speedVariance;
        
        const x = this.bounds.spawnMargin + 
                 Math.random() * (this.bounds.width - this.bounds.spawnMargin * 2);
        const y = startY !== null ? startY : 
                 this.bounds.height + size + Math.random() * 100;
        
        // Set color based on current music state (fixed for balloon lifetime)
        const musicColor = this.calculateMusicColor();
        
        return {
            x: x,
            y: y,
            size: size,
            speed: speed,
            horizontalSpeed: (Math.random() - 0.5) * this.balloonSettings.horizontalDrift,
            
            // Fixed color properties based on music at creation time
            hue: musicColor.hue,
            saturation: musicColor.saturation,
            lightness: musicColor.lightness,
            opacity: 0.8 + Math.random() * 0.2,
            
            // Animation properties
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            
            // Physics
            age: 0,
            bobAmount: 5 + Math.random() * 10,
            
            // String properties
            stringLength: 20 + Math.random() * 15,
            stringOpacity: 0.6 + Math.random() * 0.3
        };
    }
    
    calculateMusicSpeed() {
        // Base speed affected by volume and beat energy
        const volumeEffect = (this.smoothedAudio.volume / 100) * 2.0;
        const bassEffect = (this.smoothedAudio.bass / 100) * 1.5;
        const midEffect = (this.smoothedAudio.mid / 100) * 1.0;
        
        // Combine effects for music-responsive speed
        const musicSpeedMultiplier = Math.max(0.3, volumeEffect + bassEffect + midEffect);
        
        return this.balloonSettings.baseSpeed * musicSpeedMultiplier;
    }
    
    calculateMusicColor() {
        // Color based on current music state
        const baseHue = (this.smoothedAudio.frequency - 100) / 400 * 360;
        const hue = (baseHue + Math.random() * 60 - 30) % 360; // Add some variation
        
        // Saturation based on volume
        const saturation = Math.min(1, 0.6 + (this.smoothedAudio.volume / 100) * 0.4);
        
        // Lightness based on bass energy
        const lightness = Math.min(0.8, 0.4 + (this.smoothedAudio.bass / 100) * 0.4);
        
        return {
            hue: hue,
            saturation: saturation,
            lightness: lightness
        };
    }
    
    updateBounds(width, height) {
        this.bounds.width = width;
        this.bounds.height = height;
    }
    
    updateAudioSmoothing(audioData) {
        if (!audioData) return;
        
        const smoothing = 0.1;
        
        this.smoothedAudio.volume = this.smoothedAudio.volume * (1 - smoothing) + 
                                   audioData.volume * smoothing;
        this.smoothedAudio.bass = this.smoothedAudio.bass * (1 - smoothing) + 
                                 (audioData.bassEnergy || 0) * smoothing;
        this.smoothedAudio.mid = this.smoothedAudio.mid * (1 - smoothing) + 
                                (audioData.midEnergy || 0) * smoothing;
        this.smoothedAudio.treble = this.smoothedAudio.treble * (1 - smoothing) + 
                                   (audioData.trebleEnergy || 0) * smoothing;
        this.smoothedAudio.frequency = this.smoothedAudio.frequency * (1 - smoothing) + 
                                      (audioData.dominantFrequency || 440) * smoothing;
    }
    
    handleBeatResponse(audioData) {
        if (!this.beatResponse.enabled || !audioData || this.balloons.length === 0) return false;
        
        const currentTime = Date.now();
        const timeSinceLastBeat = currentTime - this.beatResponse.lastBeatTime;
        
        // Store previous beat state to detect beat edges (transition from false to true)
        const previousBeatState = this.lastBeatDetected || false;
        const currentBeatState = audioData.beatDetected || false;
        this.lastBeatDetected = currentBeatState;
        
        // Only trigger on beat edge (false -> true transition) to prevent multiple pops per beat
        const beatEdgeDetected = !previousBeatState && currentBeatState;
        
        if (beatEdgeDetected && 
            audioData.volume > this.beatResponse.volumeThreshold &&
            timeSinceLastBeat > this.beatResponse.cooldownTime) {
            
            this.beatResponse.lastBeatTime = currentTime;
            
            // Filter for only visible balloons
            const visibleBalloons = this.balloons.filter(balloon => this.isBalloonVisible(balloon));
            
            // Debug info
            this.lastPopInfo = {
                totalBalloons: this.balloons.length,
                visibleBalloons: visibleBalloons.length,
                volume: audioData.volume.toFixed(1),
                timeSinceLastPop: timeSinceLastBeat
            };
            
            // Pop a balloon on every beat (if visible balloons exist)
            if (visibleBalloons.length > 0) {
                // Select a random visible balloon
                const randomVisibleBalloon = visibleBalloons[Math.floor(Math.random() * visibleBalloons.length)];
                const balloonIndex = this.balloons.indexOf(randomVisibleBalloon);
                
                // Create pop effect
                this.popEffects.push({
                    x: randomVisibleBalloon.x,
                    y: randomVisibleBalloon.y,
                    size: randomVisibleBalloon.size,
                    particles: [],
                    life: 30,
                    maxLife: 30,
                    color: `hsl(${randomVisibleBalloon.hue}, ${randomVisibleBalloon.saturation * 100}%, ${randomVisibleBalloon.lightness * 100}%)`
                });
                
                // Create pop particles
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const speed = 2 + Math.random() * 4;
                    this.popEffects[this.popEffects.length - 1].particles.push({
                        x: randomVisibleBalloon.x,
                        y: randomVisibleBalloon.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 3 + Math.random() * 5,
                        life: 20 + Math.random() * 10
                    });
                }
                
                // Remove the balloon
                this.balloons.splice(balloonIndex, 1);
                
                return true; // Beat pop occurred
            }
        }
        
        return false; // No pop occurred
    }
    
    isBalloonVisible(balloon) {
        // Much more restrictive visibility check - balloons must be clearly on screen
        // and not in the top third of the screen
        const topThirdY = this.bounds.height / 3;
        const margin = 20; // Smaller margin - balloons must be clearly visible
        
        return balloon.x > margin && 
               balloon.x < this.bounds.width - margin &&
               balloon.y > topThirdY && // Not in top third
               balloon.y < this.bounds.height - margin; // Not at bottom edge
    }
    
    updateBalloons() {
        // Update existing balloons
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            
            // Move balloon upward
            balloon.y -= balloon.speed;
            
            // Horizontal drift
            balloon.x += balloon.horizontalSpeed;
            
            // Wobble effect
            balloon.wobble += balloon.wobbleSpeed;
            balloon.age++;
            
            // Keep balloons within horizontal bounds
            if (balloon.x < -balloon.size) {
                balloon.x = this.bounds.width + balloon.size;
            } else if (balloon.x > this.bounds.width + balloon.size) {
                balloon.x = -balloon.size;
            }
            
            // Remove balloons that float off screen
            if (balloon.y < -balloon.size - 50) {
                this.balloons.splice(i, 1);
            }
        }
        
        // Check for overlapping balloons and pop one if 3+ overlap
        this.checkBalloonOverlap();
        
        // Spawn new balloons at bottom
        if (Math.random() < this.balloonSettings.spawnRate && 
            this.balloons.length < this.maxBalloons) {
            this.balloons.push(this.createBalloon());
        }
        
        // Update pop effects
        this.popEffects = this.popEffects.filter(effect => {
            effect.life--;
            effect.particles = effect.particles.filter(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity
                particle.vx *= 0.98; // Air resistance
                particle.vy *= 0.98;
                particle.life--;
                return particle.life > 0;
            });
            return effect.life > 0;
        });
    }
    
    checkBalloonOverlap() {
        // Find groups of overlapping balloons
        const overlappingGroups = [];
        const processed = new Set();
        
        for (let i = 0; i < this.balloons.length; i++) {
            if (processed.has(i)) continue;
            
            const balloon1 = this.balloons[i];
            const group = [i];
            
            // Find all balloons that overlap with this one
            for (let j = i + 1; j < this.balloons.length; j++) {
                if (processed.has(j)) continue;
                
                const balloon2 = this.balloons[j];
                if (this.balloonsOverlap(balloon1, balloon2)) {
                    group.push(j);
                }
            }
            
            // If we found a group of 3+ overlapping balloons
            if (group.length >= 3) {
                overlappingGroups.push(group);
                group.forEach(index => processed.add(index));
            }
        }
        
        // Pop one balloon from each group of 3+ overlapping balloons
        overlappingGroups.forEach(group => {
            // Select a random balloon from the group to pop
            const randomIndex = Math.floor(Math.random() * group.length);
            const balloonIndex = group[randomIndex];
            const balloon = this.balloons[balloonIndex];
            
            // Create pop effect (same as beat response)
            this.createPopEffect(balloon);
            
            // Remove the balloon
            this.balloons.splice(balloonIndex, 1);
            
            // Adjust remaining indices in the group since we removed one
            for (let i = 0; i < overlappingGroups.length; i++) {
                for (let j = 0; j < overlappingGroups[i].length; j++) {
                    if (overlappingGroups[i][j] > balloonIndex) {
                        overlappingGroups[i][j]--;
                    }
                }
            }
        });
    }
    
    balloonsOverlap(balloon1, balloon2) {
        // Calculate distance between balloon centers
        const dx = balloon1.x - balloon2.x;
        const dy = balloon1.y - balloon2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if balloons overlap (distance less than sum of their radii)
        const minDistance = balloon1.size + balloon2.size;
        return distance < minDistance * 0.8; // 80% overlap threshold for more realistic collision
    }
    
    createPopEffect(balloon) {
        // Create pop effect (same as beat response)
        this.popEffects.push({
            x: balloon.x,
            y: balloon.y,
            size: balloon.size,
            particles: [],
            life: 30,
            maxLife: 30,
            color: `hsl(${balloon.hue}, ${balloon.saturation * 100}%, ${balloon.lightness * 100}%)`
        });
        
        // Create pop particles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.popEffects[this.popEffects.length - 1].particles.push({
                x: balloon.x,
                y: balloon.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                life: 20 + Math.random() * 10
            });
        }
    }
    
    render(ctx, audioData, time, width, height) {
        // Update bounds
        this.updateBounds(width, height);
        
        // Create sky gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB');  // Sky blue
        gradient.addColorStop(0.7, '#98D8E8'); // Lighter blue
        gradient.addColorStop(1, '#F0F8FF');   // Alice blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Handle no audio state
        if (!audioData || audioData.volume < 1) {
            this.renderIdleState(ctx, width, height);
            return;
        }
        
        // Update audio smoothing
        this.updateAudioSmoothing(audioData);
        
        // Calculate music speed once per frame
        this.currentMusicSpeed = this.calculateMusicSpeed();
        
        // Handle beat response
        this.beatPopOccurred = this.handleBeatResponse(audioData);
        
        // Update balloon positions
        this.updateBalloons();
        
        // Render everything
        this.renderBalloons(ctx);
        this.renderPopEffects(ctx);
        this.renderAudioInfo(ctx, audioData, width, height);
    }
    
    renderIdleState(ctx, width, height) {
        // Update existing balloons (don't remove visible ones)
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            
            // Slow movement in idle state
            balloon.y -= 0.3;
            balloon.wobble += 0.01;
            
            // Only remove balloons that are completely off screen
            if (balloon.y < -balloon.size - 50) {
                this.balloons.splice(i, 1);
            }
        }
        
        // Limit spawning new balloons in idle state (but don't remove visible ones)
        // Only spawn if we have very few balloons
        if (Math.random() < 0.01 && this.balloons.length < 5) {
            this.balloons.push(this.createBalloon());
        }
        
        // Render idle balloons
        this.renderBalloons(ctx);
        
        // Show idle message only when debug is enabled
        if (this.showDebugInfo) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎈 Waiting for music...', width / 2, height / 2);
        }
    }
    
    renderBalloons(ctx) {
        this.balloons.forEach(balloon => {
            ctx.save();
            
            // Calculate wobble position
            const wobbleX = balloon.x + Math.sin(balloon.wobble) * balloon.bobAmount;
            const wobbleY = balloon.y + Math.cos(balloon.wobble * 0.7) * (balloon.bobAmount * 0.5);
            
            // Draw balloon string first (behind balloon)
            ctx.strokeStyle = `rgba(139, 69, 19, ${balloon.stringOpacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(wobbleX, wobbleY + balloon.size * 0.8);
            ctx.lineTo(wobbleX, wobbleY + balloon.size * 0.8 + balloon.stringLength);
            ctx.stroke();
            
            // Draw balloon shadow
            ctx.save();
            ctx.translate(wobbleX + 3, wobbleY + 3);
            ctx.scale(0.8, 1);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, balloon.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Draw balloon
            ctx.translate(wobbleX, wobbleY);
            ctx.scale(0.8, 1); // Horizontally flattened (more natural balloon shape)
            
            // Balloon color based on music
            const hue = balloon.hue;
            const saturation = balloon.saturation * 100;
            const lightness = balloon.lightness * 100;
            
            // Main balloon body
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.beginPath();
            ctx.arc(0, 0, balloon.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Balloon highlight
            ctx.fillStyle = `hsl(${hue}, ${saturation * 0.5}%, ${Math.min(95, lightness + 20)}%)`;
            ctx.beginPath();
            ctx.arc(-balloon.size * 0.3, -balloon.size * 0.4, balloon.size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Balloon tie (small triangle at bottom edge)
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness * 0.7}%)`;
            ctx.beginPath();
            ctx.moveTo(0, balloon.size * 1.0);
            ctx.lineTo(-3, balloon.size * 1.1);
            ctx.lineTo(3, balloon.size * 1.1);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    renderPopEffects(ctx) {
        this.popEffects.forEach(effect => {
            const alpha = effect.life / effect.maxLife;
            
            // Draw explosion particles only (no text)
            effect.particles.forEach(particle => {
                const particleAlpha = (particle.life / 30) * alpha;
                ctx.fillStyle = `rgba(255, 255, 0, ${particleAlpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }
    
    renderAudioInfo(ctx, audioData, width, height) {
        if (!this.showDebugInfo) {
            // Show nothing when debug is hidden - completely clean visual
            return;
        }
        
        // Full debug info when enabled
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        
        // Basic audio info
        ctx.fillText(`Volume: ${audioData.volume.toFixed(0)}%`, 20, 30);
        ctx.fillText(`Frequency: ${audioData.dominantFrequency.toFixed(1)} Hz`, 20, 50);
        ctx.fillText(`Note: ${audioData.dominantNote || 'Unknown'}`, 20, 70);
        
        // Music-responsive speed info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`Music Speed: ${this.currentMusicSpeed.toFixed(1)}x`, 20, 100);
        ctx.fillText(`Balloons: ${this.balloons.length}`, 20, 120);
        ctx.fillText(`Beat Response: ${this.beatResponse.enabled ? 'ON' : 'OFF'}`, 20, 140);
        
        // Beat detection and pop info
        const beatDetected = audioData.beatDetected || false;
        const beatEdgeDetected = !this.lastBeatDetected && beatDetected;
        
        ctx.fillStyle = beatDetected ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Beat Detection: ${beatDetected ? 'YES' : 'NO'}`, 20, 160);
        
        ctx.fillStyle = beatEdgeDetected ? 'rgba(255, 50, 50, 1.0)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Beat Edge: ${beatEdgeDetected ? 'YES' : 'NO'}`, 20, 180);
        
        // Show beat pop status
        if (this.beatPopOccurred) {
            ctx.fillStyle = 'rgba(255, 50, 50, 1.0)';
            ctx.fillText(`Beat Pop: YES`, 20, 200);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(`Beat Pop: NO`, 20, 200);
        }
        
        // Show visible balloon count
        const visibleBalloons = this.balloons.filter(balloon => this.isBalloonVisible(balloon));
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(`Visible Balloons: ${visibleBalloons.length}`, 20, 220);
        
        // Show debug info from last pop
        if (this.lastPopInfo) {
            ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
            ctx.fillText(`Last Pop: Vol=${this.lastPopInfo.volume}% Time=${this.lastPopInfo.timeSinceLastPop}ms`, 20, 240);
            ctx.fillText(`Balloons: ${this.lastPopInfo.totalBalloons} total, ${this.lastPopInfo.visibleBalloons} visible`, 20, 260);
        }
        
        // Show cooldown time warning if very low
        if (this.beatResponse.cooldownTime < 50) {
            ctx.fillStyle = 'rgba(255, 200, 0, 1.0)';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`⚠️ Very short cooldown: ${this.beatResponse.cooldownTime}ms`, 20, 280);
        }
        
        // Show speed indicators
        ctx.font = '14px Arial';
        if (this.currentMusicSpeed > 2.0) {
            ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('⚡ FAST MUSIC!', width - 20, 30);
        } else if (this.currentMusicSpeed > 1.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🎵 MODERATE TEMPO', width - 20, 30);
        }
        
        // Show beat pop indicator in top-right
        if (this.beatPopOccurred) {
            ctx.fillStyle = 'rgba(255, 100, 100, 1.0)';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🎈💥 BALLOON POP!', width - 20, 60);
        }
    }
    
    // Control methods
    setBalloonSettings(settings) {
        this.balloonSettings = { ...this.balloonSettings, ...settings };
    }
    
    setBeatResponse(settings) {
        // Note: popChance is no longer used - balloons pop on every detected beat
        this.beatResponse = { ...this.beatResponse, ...settings };
    }
    
    // Note: Balloons now get fixed colors at creation time based on music
    // This method can adjust the base color calculation parameters
    setColorInfluence(settings) {
        // You can adjust how music affects balloon colors at creation time
        if (settings.volumeInfluence !== undefined) {
            this.colorSettings.volumeInfluence = settings.volumeInfluence;
        }
        if (settings.bassInfluence !== undefined) {
            this.colorSettings.bassInfluence = settings.bassInfluence;
        }
    }
    
    toggleBeatResponse(enabled) {
        this.beatResponse.enabled = enabled;
    }
    
    resetBalloons() {
        this.balloons = [];
        this.popEffects = [];
        this.initializeBalloons();
    }
    
    // Helper method to get current music speed for external access
    getCurrentMusicSpeed() {
        return this.currentMusicSpeed || this.calculateMusicSpeed();
    }
    
    // Method to toggle debug information display
    toggleDebugInfo(show) {
        this.showDebugInfo = show;
    }
    
    // Method to get current debug info state
    getDebugInfoState() {
        return this.showDebugInfo;
    }
} 