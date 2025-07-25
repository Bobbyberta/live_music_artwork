# 🎵 Live Music Artwork - Ceilidh Visualizations

Real-time audio visualization specifically designed for Celtic music performances. Transform your microphone input into beautiful, responsive graphics that dance with the rhythm of fiddles, flutes, and bodhrán.

## ✨ Features

### 🎧 Advanced Audio Processing
- **Real-time microphone capture** using Web Audio API
- **Optimized for ceilidh instruments** (fiddle, accordion, flute, bodhrán, pipes)
- **Frequency analysis** with 1024-point FFT for detailed sound breakdown
- **Beat detection** specifically tuned for traditional Celtic rhythms
- **Musical note recognition** with instrument-specific frequency ranges
- **Adaptive sensitivity** for different environments

### 🎨 Visualization Modes
- **Audio Test Mode**: Comprehensive debugging interface showing volume meters, frequency range bars, beat detection, dominant frequency analysis, and system status - perfect for setup and troubleshooting
- **Balloon Float**: Beautiful balloon visualization with realistic physics, music-responsive movement, intelligent volume spike detection, and Celtic-inspired colors that react to musical frequencies

### 🌈 Visual Elements

#### Balloon Float Visualization
- **Realistic balloon physics** with natural movement, wobble effects, and string attachments
- **Music-responsive colors** - balloon hues shift based on dominant frequency, saturation responds to volume, and lightness reacts to bass energy
- **Intelligent volume spike detection** - balloons pop proportionally to sudden volume increases (1.5x average = 1 balloon, 3x+ = up to 8 balloons)
- **Beat detection popping** - balloons pop on musical beats as backup to spike detection
- **Overlap collision system** - when 3+ balloons touch, one automatically pops
- **Dynamic movement speed** - balloon rising speed adapts to music tempo and energy
- **Sky gradient background** with realistic balloon shadows and highlights
- **Pop effects** with explosion particles and visual feedback
- **Debug mode toggle** - comprehensive real-time information overlay (can be hidden for clean visuals)

#### Audio Test Mode
- **Frequency spectrum** displays with musical context  
- **Waveform visualization** showing real-time audio
- **Beat detection indicators** with visual feedback
- **Musical note recognition** with frequency analysis

### 🎛️ Interactive Controls
- **Sensitivity adjustment** (1-10) - controls volume amplification and balloon responsiveness
- **Visualization mode switching** - toggle between Audio Test and Balloon Float
- **Debug info toggle** - show/hide detailed information overlay in Balloon Float mode
- **Real-time audio level monitoring** with visual feedback
- **Fullscreen mode** for live performances and events
- **Keyboard shortcuts** (Space to start/stop, Escape to stop, F11 for fullscreen)
- **Audio troubleshooting guide** - built-in help for common setup issues

## 🚀 Getting Started

### Prerequisites
- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Microphone access permissions
- HTTPS connection (provided by GitHub Pages or local server)

### 🌐 Live Demo (GitHub Pages)

**Try it instantly without any setup!** This application works perfectly on GitHub Pages:

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: main, Folder: / (root)
3. **Access your live demo** at:
   ```
   https://bobbyberta.github.io/live_music_artwork/
   ```
4. **Grant microphone permissions** when prompted
5. **Start creating music visualizations!**

**Perfect for sharing with musicians, events, and live performances!**

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bobbyberta/live_music_artwork.git
   cd live_music_artwork
   ```

2. **Serve the files locally** (required for microphone access)
   ```bash
   # Option 1: Python 3
   python3 -m http.server 8080
   
   # Option 2: Python 2
   python -m SimpleHTTPServer 8080
   
   # Option 3: Node.js
   npx http-server
   
   # Option 4: Live Server (VS Code extension)
   # Right-click index.html and select "Open with Live Server"
   ```

3. **Open in browser**
   Navigate to `http://localhost:8080` (or your chosen port)

4. **Grant microphone permissions**
   Click "Start Visualization" and allow microphone access when prompted

## 🎮 Usage

### Basic Operation
1. Click **"Start Visualization"** to begin
2. Allow microphone access when prompted
3. **Use "Audio Test" mode first** to verify sound is being detected correctly
4. Play music or speak near the microphone
5. Watch as the visualizations respond to audio input

### 🔧 Audio Test Mode
Perfect for setup and troubleshooting:
- **Large volume meter** shows overall audio levels
- **Frequency range bars** for bass, mid, and high frequencies  
- **Dominant frequency display** with musical note detection
- **Beat detection indicator** flashes when rhythm is detected
- **Audio history graph** shows recent volume levels
- **Mini frequency spectrum** for detailed analysis
- **Status indicators** show sensitivity, sample rate, and detection status
- **Debug panel** displays technical information and system status

**Use this mode to ensure your microphone is working before switching to artistic visualizations!**

### 🎈 Balloon Float Mode
A beautiful and sophisticated visualization perfect for live performances:

#### Core Features
- **25 floating balloons** with realistic physics and natural movement
- **Music-responsive colors** - each balloon's hue, saturation, and lightness respond to frequency, volume, and bass energy
- **Dynamic movement speed** - balloons rise faster during energetic music passages
- **Realistic details** - balloon shadows, highlights, strings, and natural wobble effects

#### Intelligent Popping System
The visualization features a sophisticated balloon popping system with multiple triggers:

1. **Volume Spike Detection** (Primary)
   - Continuously tracks volume history (2-second rolling average)
   - Detects sudden volume spikes relative to recent average
   - Small spikes (1.5x average) pop 1 balloon
   - Large spikes (3.0x+ average) pop up to 8 balloons
   - Perfect for capturing musical accents, drum hits, and dynamic changes

2. **Beat Detection** (Secondary)
   - Pops balloons on detected musical beats
   - Acts as backup when spike detection doesn't trigger
   - Tuned for Celtic rhythms (jigs, reels, hornpipes)

3. **Collision Detection**
   - When 3+ balloons overlap, one automatically pops
   - Prevents overcrowding and maintains visual balance

#### Debug Information
Toggle detailed real-time information including:
- Current volume vs rolling average with spike ratios
- Balloon count (total and visible)
- Music speed multiplier and beat detection status
- Pop event details with cause (spike/beat/collision)
- Volume history and detection thresholds
- Performance metrics and system status

**Perfect for live Celtic music, ambient performances, and interactive events!**

### Controls
- **Sensitivity Slider**: Adjust how responsive the visualizations are to audio (1 = less sensitive, 10 = very sensitive)
- **Visualization Mode**: Choose between Audio Test and Balloon Float
- **Debug Toggle**: Show/hide detailed information overlay (Balloon Float mode only)
- **Audio Level**: Monitor microphone input levels in real-time
- **Fullscreen Button**: Enter fullscreen mode for performances
- **Troubleshooting Guide**: Access help for common audio setup issues

### Keyboard Shortcuts
- `Space`: Toggle start/stop
- `Escape`: Stop visualization
- `F11`: Toggle fullscreen

### Optimization for Ceilidh Music

The application is specifically tuned for traditional Celtic music:

- **Fiddle range** (196-2093 Hz): Creates flowing, melodic patterns
- **Accordion/Concertina** (65-2093 Hz): Responds to harmonic content
- **Irish Flute/Whistle** (262-2093 Hz): Emphasizes higher frequency details
- **Bodhrán** (60-200 Hz): Triggers beat effects and bass visualizations
- **Uilleann Pipes** (466-932 Hz): Special recognition for chanter range

## 🏗️ Project Structure

```
live_music_artwork/
├── index.html              # Main application page
├── style.css               # Celtic-inspired styling
├── app.js                  # Main application controller and UI management
├── audio.js                # Web Audio API processing and frequency analysis
├── visualizations.js       # Graphics rendering engine with Audio Test mode
├── balloon-float.js        # Balloon Float visualization with spike detection
├── visualization-template.js # Template for creating new visualization types
└── README.md               # This documentation
```

## 🔧 Technical Details

### Audio Processing
- **Sample Rate**: 44.1 kHz
- **FFT Size**: 1024 bins
- **Frequency Range**: 20 Hz - 8 kHz (optimized for musical content)
- **Update Rate**: ~60 FPS for smooth graphics

### Browser Compatibility
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 14+
- ✅ Edge 79+

### Performance
- Optimized for 900x600 canvas rendering
- Adaptive particle count based on performance
- Automatic pause when browser tab is hidden

## 🎯 Use Cases

### Live Performances
- **Ceilidh nights**: Perfect background for traditional music sessions
- **Concerts**: Enhance live performances with synchronized visuals
- **Sessions**: Add visual interest to informal music gatherings

### Events
- **Weddings**: Celtic-themed visual entertainment
- **Festivals**: Cultural event enhancement
- **Parties**: Interactive audio-visual experience

### Practice & Education
- **Music practice**: Visual feedback for musicians
- **Teaching**: Help visualize musical concepts
- **Sound exploration**: Educational tool for understanding frequency

## 🛠️ Customization & Advanced Features

### Balloon Float Console Commands
Open browser console (F12) to access advanced balloon settings:

```javascript
// Adjust spike detection sensitivity
liveMusicArtwork.visualizationEngine.setSpikeSettings({
    minSpikeThreshold: 2.0,    // Require 2x volume spike
    maxBalloonsPerSpike: 5     // Pop max 5 balloons
});

// Modify balloon behavior
liveMusicArtwork.visualizationEngine.setBalloonSettings({
    baseSpeed: 2.0,            // Faster balloon movement
    maxBalloons: 30            // More balloons on screen
});

// Toggle spike detection
liveMusicArtwork.visualizationEngine.toggleSpikeDetection(false);
```

### Adjusting Frequency Ranges
Modify the `frequencyRanges` in `audio.js` for different instruments:

```javascript
customInstrument: { min: 100, max: 1000 } // Hz
```

### Adding New Visualization Types
1. **Study** `balloon-float.js` to understand the current architecture
2. **Copy** `visualization-template.js` for structure guidance
3. **Add** your new mode to the `<select>` options in `index.html`
4. **Create** a new visualization file (e.g., `your-viz.js`)
5. **Include** the script in `index.html`
6. **Integrate** in `visualizations.js` constructor and animate method

### Balloon Float Color Customization
Balloon colors are automatically generated based on music, but you can adjust the color calculation:

```javascript
// Adjust how music affects balloon colors
liveMusicArtwork.visualizationEngine.balloonFloatViz.setColorInfluence({
    volumeInfluence: 0.6,      // More volume effect on brightness
    bassInfluence: 0.5         // More bass effect on warmth
});
```

## 🔍 Troubleshooting

### Common Issues

**No microphone access**
- Ensure HTTPS connection (required for microphone API)
- Check browser permissions
- Try refreshing the page

**No audio detected**
- Use "Audio Test" mode to verify microphone is working
- Check system microphone settings
- Ensure microphone is not muted
- Try increasing sensitivity slider

**Poor performance**
- Close other browser tabs
- Update your browser
- Check if hardware acceleration is enabled

**Connection issues**
- Ensure you're running from a web server (not file://)
- Check if localhost or HTTPS is being used
- Try a different browser

### Debug Features
- **Browser console** (F12) shows detailed logging
- **Audio Test mode** provides comprehensive system status
- **Debug panel** shows technical information
- **Troubleshooting guide** button provides step-by-step help

### Browser Console Commands
Open developer console (F12) for advanced control and debugging:

**Basic Commands:**
- `liveMusicArtwork.debugAudio()` - Show detailed audio information
- `liveMusicArtwork.testMicrophone()` - Test microphone access
- `liveMusicArtwork.setVisualizationMode('balloon-float')` - Switch modes
- `liveMusicArtwork.setSensitivity(8)` - Set sensitivity level

**Balloon Float Commands:**
- `liveMusicArtwork.toggleDebugInfo(false)` - Hide debug overlay
- `liveMusicArtwork.resetBalloons()` - Reset all balloons
- `liveMusicArtwork.getBalloonMusicSpeed()` - Check music speed multiplier
- `liveMusicArtwork.getSpikeSettings()` - View current spike settings

**Advanced Balloon Customization:**
```javascript
// Make balloons more sensitive to spikes
liveMusicArtwork.setSpikeSettings({minSpikeThreshold: 1.3, maxBalloonsPerSpike: 10})

// Bigger, faster balloons
liveMusicArtwork.setBalloonSettings({baseSize: 80, baseSpeed: 2.5})

// Disable spike detection (use beat detection only)
liveMusicArtwork.toggleSpikeDetection(false)
```

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🎵 About

Created for the Celtic music community to enhance live performances and practice sessions with beautiful, responsive visualizations. Perfect for ceilidh nights, sessions, and concerts.

**Sláinte!** 🍀 
