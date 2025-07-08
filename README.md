# Live Music Artwork 🎵✨

A real-time browser-based music visualization experience designed for ceilidh music and live performances. Creates beautiful, synchronized graphics on dual displays that react to microphone input and complement each other.

![Celtic-inspired visualization](https://img.shields.io/badge/Celtic-Inspired-green?style=for-the-badge)
![Real-time Audio](https://img.shields.io/badge/Real--time-Audio-blue?style=for-the-badge)
![Dual Display](https://img.shields.io/badge/Dual-Display-gold?style=for-the-badge)

## ✨ Features

### 🎼 Audio Processing
- **Real-time microphone input** using Web Audio API
- **Frequency analysis** optimized for traditional ceilidh instruments
- **Beat detection** for rhythm-responsive graphics
- **Musical note recognition** with instrument-specific frequency ranges
- **Adaptive sensitivity** for different environments

### 🎨 Dual Display Visualizations
- **Complementary Mode**: Each display shows different but harmonizing graphics with particles that travel between screens
- **Mirror Mode**: Synchronized identical visualizations
- **Reactive Mode**: Displays respond to different frequency ranges

### 🌈 Visual Elements
- **Celtic-inspired patterns** with traditional knot designs
- **Cross-screen particle travel** - particles flow between displays with glowing trails and bridge effects
- **Particle systems** that respond to ambient sounds
- **Frequency spectrum** displays with musical context
- **Waveform visualization** showing real-time audio
- **Beat effects** with flash animations and particle bursts

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
- Keyboard shortcuts (Space to start/stop, Escape to stop)

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
3. Play music or speak near the microphone
4. Watch as the visualizations respond to audio input

### Controls
- **Sensitivity Slider**: Adjust how responsive the visualizations are to audio (1 = less sensitive, 10 = very sensitive)
- **Visualization Mode**: Choose how the two displays interact
- **Color Scheme**: Select the visual theme
- **Audio Level**: Monitor microphone input levels

### Keyboard Shortcuts
- `Space`: Toggle start/stop
- `Escape`: Stop visualization

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
├── index.html          # Main application page
├── style.css           # Celtic-inspired styling
├── app.js              # Main application controller
├── audio.js            # Audio processing and analysis
├── visualizations.js   # Graphics rendering engine
└── README.md           # This documentation
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
- Optimized for dual 800x600 canvas rendering
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

### Adding Visualization Modes
Extend the `VisualizationEngine` class with new rendering methods.

## 🔍 Troubleshooting

### Common Issues

**No microphone access**
- Ensure HTTPS connection (required for microphone API)
- Check browser permissions
- Try refreshing the page

**Poor visualization response**
- Increase sensitivity setting
- Check microphone input levels
- Ensure audio is actually reaching the microphone

**Performance issues**
- Close other browser tabs
- Reduce particle count in code
- Use smaller canvas sizes

**No audio detected**
- Check system microphone settings
- Ensure microphone isn't muted
- Try speaking directly into microphone

## 📱 Mobile Support

While optimized for desktop displays, the application works on mobile devices:
- Touch controls for all interface elements
- Responsive design adapts to smaller screens
- Single display mode on narrow screens

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Ensure HTTPS is enabled for microphone access

### Custom Hosting
- Requires HTTPS for microphone API
- Serve static files from any web server
- No backend requirements

## 🤝 Contributing

Contributions welcome! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 🎵 Acknowledgments

- Inspired by traditional Celtic music and culture
- Built with modern Web Audio API technology
- Designed for the ceilidh community

---

**Enjoy creating beautiful music visualizations! 🎶✨**

*Perfect for bringing traditional music into the digital age while honoring its cultural roots.* 