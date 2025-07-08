/**
 * VISUALIZATION TEMPLATE
 * 
 * Use this template to create new visualization types.
 * Copy this file and modify the renderNewVisualization function.
 * 
 * To integrate a new visualization:
 * 1. Add your visualization mode to index.html <select> options
 * 2. Add a new case in visualizations.js animate() method
 * 3. Copy your render function into the VisualizationEngine class
 */

// Example: New visualization that shows floating musical notes
function renderMusicalNotes(ctx, audioData, time, width, height, colors) {
    // Clear canvas with your preferred background
    ctx.fillStyle = 'rgba(26, 26, 46, 1)';
    ctx.fillRect(0, 0, width, height);
    
    // Handle no audio state
    if (!audioData || audioData.volume < 1) {
        ctx.font = '24px Arial';
        ctx.fillStyle = colors.accent[0];
        ctx.textAlign = 'center';
        ctx.fillText('🎵 Waiting for Audio...', width/2, height/2);
        return;
    }
    
    // Get audio data values
    const volume = audioData.volume;
    const bassEnergy = audioData.bassEnergy || 0;
    const midEnergy = audioData.midEnergy || 0;
    const trebleEnergy = audioData.trebleEnergy || 0;
    const dominantFreq = audioData.dominantFrequency || 440;
    const dominantNote = audioData.dominantNote || 'C';
    const beatDetected = audioData.beatDetected || false;
    
    // YOUR VISUALIZATION CODE HERE
    // Example: Floating musical notes
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Note symbols based on frequency ranges
    const noteSymbols = ['♪', '♫', '♬', '♩', '♯', '♭'];
    
    // Create notes based on different frequency energies
    const notes = [
        { symbol: '♪', x: centerX - 100, y: centerY + Math.sin(time + 0) * 50, energy: bassEnergy, color: colors.primary[0] },
        { symbol: '♫', x: centerX, y: centerY + Math.sin(time + 1) * 50, energy: midEnergy, color: colors.primary[1] },
        { symbol: '♬', x: centerX + 100, y: centerY + Math.sin(time + 2) * 50, energy: trebleEnergy, color: colors.primary[2] },
    ];
    
    // Draw floating notes
    notes.forEach(note => {
        const size = 20 + (note.energy / 100) * 30; // Size based on energy
        const alpha = Math.max(0.3, note.energy / 100); // Transparency based on energy
        
        ctx.font = `${size}px Arial`;
        ctx.fillStyle = note.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.textAlign = 'center';
        ctx.fillText(note.symbol, note.x, note.y);
    });
    
    // Main frequency display
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = colors.secondary[0];
    ctx.textAlign = 'center';
    ctx.fillText(dominantNote, centerX, centerY - 80);
    
    // Beat pulse effect
    if (beatDetected) {
        const pulseSize = 100 + Math.sin(time * 10) * 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = colors.accent[0] + '80';
        ctx.lineWidth = 4;
        ctx.stroke();
    }
    
    // Volume bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = centerX - barWidth/2;
    const barY = height - 100;
    
    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Fill
    const fillWidth = (volume / 100) * barWidth;
    ctx.fillStyle = colors.primary[0];
    ctx.fillRect(barX, barY, fillWidth, barHeight);
    
    // Info text
    ctx.font = '16px Arial';
    ctx.fillStyle = colors.accent[0];
    ctx.textAlign = 'center';
    ctx.fillText(`${dominantFreq.toFixed(0)}Hz - Volume: ${volume.toFixed(1)}%`, centerX, height - 50);
}

// Another example: Simple geometric patterns
function renderGeometricPatterns(ctx, audioData, time, width, height, colors) {
    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(26, 26, 46, 1)');
    gradient.addColorStop(1, 'rgba(22, 33, 62, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    if (!audioData || audioData.volume < 1) {
        ctx.font = '24px Arial';
        ctx.fillStyle = colors.accent[0];
        ctx.textAlign = 'center';
        ctx.fillText('🔷 Waiting for Audio...', width/2, height/2);
        return;
    }
    
    const centerX = width / 2;
    const centerY = height / 2;
    const volume = audioData.volume;
    const bassEnergy = audioData.bassEnergy || 0;
    const midEnergy = audioData.midEnergy || 0;
    const trebleEnergy = audioData.trebleEnergy || 0;
    
    // Rotating triangles based on different frequencies
    const triangleCount = 6;
    for (let i = 0; i < triangleCount; i++) {
        const angle = (time + i * Math.PI / 3) * 0.5;
        const radius = 50 + (bassEnergy * 2);
        const size = 20 + (midEnergy / 100) * 30;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + time);
        
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.866, size * 0.5);
        ctx.lineTo(size * 0.866, size * 0.5);
        ctx.closePath();
        
        const alpha = Math.max(0.4, trebleEnergy / 100);
        ctx.fillStyle = colors.primary[i % colors.primary.length] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        ctx.restore();
    }
    
    // Central circle that pulses with volume
    const pulseRadius = 30 + (volume * 1.5);
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.secondary[0] + '80';
    ctx.fill();
    
    // Info
    ctx.font = '16px Arial';
    ctx.fillStyle = colors.accent[0];
    ctx.textAlign = 'center';
    ctx.fillText(`Volume: ${volume.toFixed(1)}%`, centerX, height - 40);
}

/**
 * HOW TO INTEGRATE A NEW VISUALIZATION:
 * 
 * 1. In index.html, add your option to the select:
 *    <option value="mynewvis">My New Visualization</option>
 * 
 * 2. In visualizations.js, modify the animate() method:
 *    else if (this.currentMode === 'mynewvis') {
 *        this.renderMyNewVisualization();
 *    }
 * 
 * 3. Add your render method to the VisualizationEngine class:
 *    renderMyNewVisualization() {
 *        const colors = this.colorSchemes[this.currentColorScheme];
 *        const centerX = this.width / 2;
 *        const centerY = this.height / 2;
 *        
 *        // Call your template function or write inline
 *        renderMusicalNotes(this.ctx, this.audioData, this.time, this.width, this.height, colors);
 *    }
 * 
 * 4. Update app.js console help text to include your new mode
 * 
 * AVAILABLE AUDIO DATA:
 * - audioData.volume (0-100): Overall volume level
 * - audioData.bassEnergy (0-100): Low frequency energy (20-200 Hz)
 * - audioData.midEnergy (0-100): Mid frequency energy (200-2000 Hz)  
 * - audioData.trebleEnergy (0-100): High frequency energy (2000-8000 Hz)
 * - audioData.highEnergy (0-100): Very high frequency energy (8000+ Hz)
 * - audioData.dominantFrequency: The strongest frequency in Hz
 * - audioData.dominantNote: Musical note (e.g., "C", "F#", "Bb")
 * - audioData.beatDetected: Boolean - true when beat is detected
 * - audioData.rawFrequencyData: Uint8Array of FFT data (1024 samples)
 * - audioData.sensitivity: Current sensitivity setting (1-10)
 * 
 * AVAILABLE COLORS (this.colorSchemes[this.currentColorScheme]):
 * - colors.primary[]: Main colors (usually 3 values)
 * - colors.secondary[]: Secondary colors (usually 3 values)
 * - colors.accent[]: Accent colors (usually 3 values)
 * 
 * ANIMATION VARIABLES:
 * - this.time: Continuously incrementing time value for smooth animations
 * - this.width/this.height: Canvas dimensions
 * 
 * EXAMPLE INTEGRATION:
 * 
 * // In visualizations.js, add to animate() method:
 * else if (this.currentMode === 'musicalnotes') {
 *     this.renderMusicalNotes();
 * }
 * 
 * // Then add the method to VisualizationEngine class:
 * renderMusicalNotes() {
 *     const colors = this.colorSchemes[this.currentColorScheme];
 *     renderMusicalNotes(this.ctx, this.audioData, this.time, this.width, this.height, colors);
 * }
 * 
 * // In index.html, add to the select:
 * <option value="musicalnotes">Musical Notes</option>
 */ 