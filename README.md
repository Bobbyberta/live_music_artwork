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
- **Simple Pulse**: Elegant audio-reactive visualization with a central pulse that responds to volume, dynamic color changes based on frequency, bass-reactive outer rings, and particle effects triggered by treble

### 🌈 Visual Elements
- **Celtic-inspired design** with traditional color palettes
- **Particle systems** that respond to different frequency ranges
- **Frequency spectrum** displays with musical context
- **Waveform visualization** showing real-time audio
- **Beat effects** with flash animations and particle bursts
- **Dynamic color mapping** based on dominant frequencies

### 🎭 Color Schemes
- **Celtic Green & Gold**: Traditional Irish/Scottish colors
- **Fire & Amber**: Warm, energetic tones
- **Ocean Blues**: Cool, flowing palette
- **Sunset**: Pink and orange gradients

### 🎛️ Interactive Controls
- Sensitivity adjustment (1-10)
- Visualization mode switching
- Color scheme selection
- Real-time audio level monitoring
- **Fullscreen mode** for performances
- Keyboard shortcuts (Space to start/stop, Escape to stop, F11 for fullscreen)

## 🚀 Getting Started

### Prerequisites
- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Microphone access permissions
- Local web server (for HTTPS requirements)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/live_music_artwork.git
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

### Controls
- **Sensitivity Slider**: Adjust how responsive the visualizations are to audio (1 = less sensitive, 10 = very sensitive)
- **Visualization Mode**: Choose between Audio Test and Simple Pulse
- **Color Scheme**: Select the visual theme
- **Audio Level**: Monitor microphone input levels

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
├── app.js                  # Main application controller
├── audio.js                # Audio processing and analysis
├── visualizations.js       # Graphics rendering engine
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

## 🛠️ Customization

### Adding New Color Schemes
Edit the `colorSchemes` object in `visualizations.js`:

```javascript
yourScheme: {
    primary: ['#color1', '#color2', '#color3'],
    secondary: ['#color4', '#color5', '#color6'],
    accent: ['#color7', '#color8', '#color9']
}
```

### Adjusting Frequency Ranges
Modify the `frequencyRanges` in `audio.js` for different instruments:

```javascript
customInstrument: { min: 100, max: 1000 } // Hz
```

### Adding New Visualization Types
1. **Copy** `visualization-template.js` to understand the structure
2. **Add** your new mode to the `<select>` options in `index.html`
3. **Create** a new render method in the `VisualizationEngine` class
4. **Integrate** by adding a new case in the `animate()` method

See `visualization-template.js` for detailed examples and integration instructions.

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
Open developer console (F12) and try:
- `liveMusicArtwork.debugAudio()` - Show detailed audio information
- `liveMusicArtwork.testMicrophone()` - Test microphone access
- `liveMusicArtwork.setVisualizationMode('audiotest')` - Switch to debug mode

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🎵 About

Created for the Celtic music community to enhance live performances and practice sessions with beautiful, responsive visualizations. Perfect for ceilidh nights, sessions, and concerts.

**Sláinte!** 🍀 