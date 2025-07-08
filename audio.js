// Audio processing module for live music visualization
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.isActive = false;
        this.sensitivity = 5;
        
        // Audio analysis data
        this.frequencyData = new Float32Array(512);
        this.timeDomainData = new Float32Array(512);
        this.currentVolume = 0;
        this.dominantFrequency = 0;
        this.frequencyBins = [];
        this.beatDetected = false;
        this.lastBeatTime = 0;
        
        // Ceilidh music frequency ranges (Hz)
        this.frequencyRanges = {
            bass: { min: 20, max: 250 },      // Bodhran, low instruments
            midlow: { min: 250, max: 500 },   // Mid-range instruments
            mid: { min: 500, max: 2000 },     // Fiddle, pipes, vocals
            midhigh: { min: 2000, max: 4000 }, // Flute, whistle harmonics
            high: { min: 4000, max: 8000 }    // Harmonics, ambient sounds
        };
        
        this.callbacks = [];
    }

    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            });

            // Create audio nodes
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            // Configure analyser
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            // Connect audio nodes
            this.microphone.connect(this.analyser);
            
            this.isActive = true;
            this.startAnalysis();
            
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            throw new Error('Could not access microphone. Please allow microphone access and try again.');
        }
    }

    startAnalysis() {
        if (!this.isActive) return;
        
        this.analyzeAudio();
        requestAnimationFrame(() => this.startAnalysis());
    }

    analyzeAudio() {
        if (!this.analyser) return;

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getFloatFrequencyData(this.frequencyData);
        this.analyser.getFloatTimeDomainData(this.timeDomainData);

        // Calculate overall volume
        this.currentVolume = this.calculateVolume();
        
        // Find dominant frequency
        this.dominantFrequency = this.findDominantFrequency();
        
        // Analyze frequency bins for different instrument ranges
        this.analyzeFrequencyBins();
        
        // Detect beats/rhythm
        this.detectBeat();
        
        // Notify callbacks with processed data
        this.notifyCallbacks({
            volume: this.currentVolume,
            dominantFrequency: this.dominantFrequency,
            frequencyBins: this.frequencyBins,
            rawFrequencyData: this.dataArray,
            rawTimeDomainData: this.timeDomainData,
            beatDetected: this.beatDetected,
            sensitivity: this.sensitivity
        });
    }

    calculateVolume() {
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;
        return Math.min(100, (average / 255) * 100 * (this.sensitivity / 5));
    }

    findDominantFrequency() {
        let maxIndex = 0;
        let maxValue = 0;
        
        // Focus on musically relevant frequencies (80Hz - 4000Hz)
        const startBin = Math.floor(80 * this.bufferLength / (this.audioContext.sampleRate / 2));
        const endBin = Math.floor(4000 * this.bufferLength / (this.audioContext.sampleRate / 2));
        
        for (let i = startBin; i < endBin && i < this.dataArray.length; i++) {
            if (this.dataArray[i] > maxValue) {
                maxValue = this.dataArray[i];
                maxIndex = i;
            }
        }
        
        // Convert bin to frequency
        return (maxIndex * this.audioContext.sampleRate) / (2 * this.bufferLength);
    }

    analyzeFrequencyBins() {
        const nyquist = this.audioContext.sampleRate / 2;
        const binWidth = nyquist / this.bufferLength;
        
        this.frequencyBins = {};
        
        for (const [rangeName, range] of Object.entries(this.frequencyRanges)) {
            const startBin = Math.floor(range.min / binWidth);
            const endBin = Math.floor(range.max / binWidth);
            
            let sum = 0;
            let count = 0;
            
            for (let i = startBin; i <= endBin && i < this.dataArray.length; i++) {
                sum += this.dataArray[i];
                count++;
            }
            
            this.frequencyBins[rangeName] = count > 0 ? (sum / count) / 255 : 0;
        }
    }

    detectBeat() {
        const now = Date.now();
        const bassEnergy = this.frequencyBins.bass || 0;
        const threshold = 0.3 * (this.sensitivity / 5);
        
        // Simple beat detection based on bass energy spikes
        if (bassEnergy > threshold && (now - this.lastBeatTime) > 300) {
            this.beatDetected = true;
            this.lastBeatTime = now;
        } else {
            this.beatDetected = false;
        }
    }

    setSensitivity(value) {
        this.sensitivity = Math.max(1, Math.min(10, value));
    }

    addCallback(callback) {
        this.callbacks.push(callback);
    }

    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    notifyCallbacks(data) {
        this.callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in audio callback:', error);
            }
        });
    }

    stop() {
        this.isActive = false;
        
        if (this.microphone) {
            this.microphone.disconnect();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.microphone = null;
        this.analyser = null;
        this.audioContext = null;
    }

    // Utility methods for music analysis
    getMusicalNote(frequency) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const A4 = 440;
        const C0 = A4 * Math.pow(2, -4.75);
        
        if (frequency <= 0) return { note: '', octave: 0 };
        
        const h = Math.round(12 * Math.log2(frequency / C0));
        const octave = Math.floor(h / 12);
        const n = h % 12;
        
        return {
            note: noteNames[n],
            octave: octave,
            frequency: frequency
        };
    }

    isCeilidhInstrumentRange(frequency) {
        // Common ceilidh instrument frequency ranges
        const instrumentRanges = {
            fiddle: { min: 196, max: 2093 },    // G3 to C7
            accordion: { min: 65, max: 2093 },  // C2 to C7
            flute: { min: 262, max: 2093 },     // C4 to C7
            bodhran: { min: 60, max: 200 },     // Low percussion
            pipes: { min: 466, max: 932 }       // Bb4 to Bb5 (typical chanter range)
        };
        
        return Object.values(instrumentRanges).some(range => 
            frequency >= range.min && frequency <= range.max
        );
    }
}

// Export for use in other modules
window.AudioProcessor = AudioProcessor; 