// Audio processing module for live music visualization
class AudioProcessor {
    constructor() {
        // Audio nodes
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.stream = null;
        
        // Audio data
        this.bufferLength = 0;
        this.dataArray = null;
        this.frequencyData = null;
        this.timeDomainData = null;
        
        // Analysis results
        this.currentVolume = 0;
        this.dominantFrequency = 0;
        this.frequencyBins = {};
        this.beatDetected = false;
        this.lastBeatTime = 0;
        
        // Settings
        this.sensitivity = 5;
        this.isActive = false;
        
        // Callbacks for data updates
        this.callbacks = [];
        
        // Error handling
        this.trackFailures = 0;
        this.isMuted = false;
        this.retryTimeout = null;
        
        // Debug counter
        this.debugCounter = 0;
        
        // Frequency ranges optimized for ceilidh instruments
        this.frequencyRanges = {
            bass: { min: 20, max: 200 },      // Bodhrán, low strings
            mid: { min: 200, max: 2000 },     // Core instrument range
            treble: { min: 2000, max: 8000 }, // High strings, flute
            high: { min: 8000, max: 20000 }   // Harmonics, breath sounds
        };
        
        console.log('🎵 AudioProcessor initialized with callback system');
    }

    async initialize() {
        try {
            console.log('🎤 Starting audio initialization...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
            }
            
            // Check if we're on HTTPS or localhost
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                console.warn('⚠️ Not on HTTPS or localhost - microphone access may be blocked');
            }
            
            // Create audio context
            console.log('🔊 Creating audio context...');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Audio context created, state:', this.audioContext.state);
            
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                console.log('🔄 Resuming suspended audio context...');
                await this.audioContext.resume();
                console.log('✅ Audio context resumed, state:', this.audioContext.state);
            }
            
            // Try to get list of available audio input devices
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                console.log('🎙️ Available audio input devices:', audioInputs.length);
                audioInputs.forEach((device, index) => {
                    console.log(`  ${index + 1}. ${device.label || 'Unknown device'} (${device.deviceId})`);
                });
            } catch (devicesError) {
                console.warn('⚠️ Could not enumerate devices:', devicesError);
            }
            
            // Request microphone access with detailed constraints
            console.log('🎤 Requesting microphone access...');
            const constraints = {
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: { ideal: 44100 },
                    channelCount: { ideal: 1 }
                }
            };
            
            console.log('📋 Audio constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Microphone access granted');
            
            // Check stream tracks
            const audioTracks = stream.getAudioTracks();
            console.log('🎵 Audio tracks:', audioTracks.length);
            audioTracks.forEach((track, index) => {
                console.log(`  Track ${index + 1}:`, {
                    label: track.label,
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                    settings: track.getSettings()
                });
                
                // Add error handling for track failures
                track.addEventListener('ended', () => {
                    console.error('🚨 MediaStreamTrack ended unexpectedly');
                    this.handleTrackFailure('Track ended unexpectedly. This usually means another application took control of the microphone.');
                });
                
                track.addEventListener('mute', () => {
                    console.warn('🔇 MediaStreamTrack muted');
                    this.handleTrackMute();
                });
                
                track.addEventListener('unmute', () => {
                    console.log('🔊 MediaStreamTrack unmuted');
                    this.handleTrackUnmute();
                });
            });

            // Create audio nodes
            console.log('🔗 Creating audio nodes...');
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            // Configure analyser
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            // Initialize Float32 arrays for more precise analysis
            this.frequencyData = new Float32Array(this.bufferLength);
            this.timeDomainData = new Float32Array(this.analyser.fftSize);
            
            console.log('📊 Analyser configured - FFT size:', this.analyser.fftSize, 'Buffer length:', this.bufferLength);
            
            // Connect audio nodes
            this.microphone.connect(this.analyser);
            console.log('🔌 Audio nodes connected');
            
            // Store stream reference for cleanup
            this.stream = stream;
            
            this.isActive = true;
            this.startAnalysis();
            
            console.log('🎉 Audio initialization complete!');
            return true;
        } catch (error) {
            console.error('❌ Error initializing audio:', error);
            
            // Provide specific error messages
            let errorMessage = 'Could not access microphone. ';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += 'Permission denied. Please allow microphone access and refresh the page.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += 'No microphone found. Please connect a microphone and try again.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage += 'Microphone is being used by another application. Please close other apps using the microphone.';
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                errorMessage += 'Microphone does not support the required audio settings. Trying basic settings...';
                
                // Try again with basic constraints
                try {
                    console.log('🔄 Retrying with basic audio constraints...');
                    const basicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    this.microphone = this.audioContext.createMediaStreamSource(basicStream);
                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 1024;
                    this.analyser.smoothingTimeConstant = 0.8;
                    this.bufferLength = this.analyser.frequencyBinCount;
                    this.dataArray = new Uint8Array(this.bufferLength);
                    
                    // Initialize Float32 arrays for more precise analysis
                    this.frequencyData = new Float32Array(this.bufferLength);
                    this.timeDomainData = new Float32Array(this.analyser.fftSize);
                    
                    this.microphone.connect(this.analyser);
                    this.stream = basicStream;
                    this.isActive = true;
                    this.startAnalysis();
                    
                    console.log('✅ Basic audio initialization successful!');
                    return true;
                } catch (retryError) {
                    console.error('❌ Basic audio initialization also failed:', retryError);
                    errorMessage += ' Basic settings also failed.';
                }
            } else if (error.name === 'TypeError') {
                errorMessage += 'Browser does not support microphone access. Please use Chrome, Firefox, Safari, or Edge.';
            } else {
                errorMessage += error.message || 'Unknown error occurred.';
            }
            
            throw new Error(errorMessage);
        }
    }

    startAnalysis() {
        if (!this.isActive) {
            console.warn('🚨 Cannot start analysis - audio processor not active');
            return;
        }
        
        if (!this.analyser) {
            console.warn('🚨 Cannot start analysis - no analyser available');
            return;
        }
        
        this.analyzeAudio();
        requestAnimationFrame(() => this.startAnalysis());
    }

    analyzeAudio() {
        if (!this.analyser) {
            console.warn('🚨 No analyser available for audio analysis');
            return;
        }

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getFloatFrequencyData(this.frequencyData);
        this.analyser.getFloatTimeDomainData(this.timeDomainData);

        // Debug: Check if we're getting any data
        const dataSum = this.dataArray.reduce((sum, val) => sum + val, 0);
        const dataAverage = dataSum / this.dataArray.length;

        // Calculate overall volume
        this.currentVolume = this.calculateVolume();
        
        // Find dominant frequency
        this.dominantFrequency = this.findDominantFrequency();
        
        // Analyze frequency bins for different instrument ranges
        this.analyzeFrequencyBins();
        
        // Detect beats/rhythm
        this.detectBeat();
        
        // Debug: Log processed results occasionally (removed for clean console)
        
        // Create audio data object
        const audioData = {
            volume: this.currentVolume || 0,
            dominantFrequency: this.dominantFrequency || 0,
            dominantNote: this.getMusicalNote(this.dominantFrequency || 0),
            bassEnergy: (this.frequencyBins?.bass || 0) * 100,
            midEnergy: (this.frequencyBins?.mid || 0) * 100,
            trebleEnergy: (this.frequencyBins?.treble || 0) * 100,
            highEnergy: (this.frequencyBins?.high || 0) * 100,
            rawFrequencyData: this.dataArray,
            rawTimeDomainData: this.timeDomainData,
            beatDetected: this.beatDetected || false,
            sensitivity: this.sensitivity || 5
        };
        
        // Notify callbacks with processed data
        this.notifyCallbacks(audioData);
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
        console.log('🛑 Stopping audio processor...');
        this.isActive = false;
        
        // Clear any retry timeouts
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
        
        // Stop all tracks in the stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('🔇 Stopped audio track:', track.label);
            });
            this.stream = null;
        }
        
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            console.log('🔌 Audio context closed');
        }
        
        this.analyser = null;
        this.audioContext = null;
        this.trackFailures = 0;
        this.isMuted = false;
        console.log('✅ Audio processor stopped');
    }

    handleTrackFailure(reason) {
        console.error('🚨 Audio track failure:', reason);
        
        // Track failure count for exponential backoff
        this.trackFailures = (this.trackFailures || 0) + 1;
        
        // Notify the UI about the failure
        if (window.liveMusicArtwork && window.liveMusicArtwork.showAudioError) {
            window.liveMusicArtwork.showAudioError(`Microphone connection lost: ${reason}`);
        }
        
        // Set inactive but don't fully stop - we'll try to recover
        this.isActive = false;
        
        // Attempt automatic recovery with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, this.trackFailures - 1), 10000); // Max 10 seconds
        console.log(`🔄 Attempting recovery in ${retryDelay}ms (attempt ${this.trackFailures})`);
        
        this.retryTimeout = setTimeout(async () => {
            if (this.trackFailures <= 3) { // Max 3 retry attempts
                try {
                    console.log('🔄 Attempting to restart audio...');
                    await this.restartAudio();
                } catch (error) {
                    console.error('❌ Audio restart failed:', error);
                    this.handleTrackFailure('Failed to restart audio connection');
                }
            } else {
                console.error('❌ Maximum retry attempts reached. Manual restart required.');
                if (window.liveMusicArtwork && window.liveMusicArtwork.showAudioError) {
                    window.liveMusicArtwork.showAudioError('Multiple microphone failures. Please click "Start" to try again or check the troubleshooting guide.');
                }
            }
        }, retryDelay);
    }

    handleTrackMute() {
        this.isMuted = true;
        console.warn('🔇 Microphone muted (possibly by system or another app)');
        
        if (window.liveMusicArtwork && window.liveMusicArtwork.showAudioWarning) {
            window.liveMusicArtwork.showAudioWarning('Microphone muted - check system audio settings');
        }
    }

    handleTrackUnmute() {
        this.isMuted = false;
        console.log('🔊 Microphone unmuted');
        
        if (window.liveMusicArtwork && window.liveMusicArtwork.clearAudioWarning) {
            window.liveMusicArtwork.clearAudioWarning();
        }
    }

    async restartAudio() {
        console.log('🔄 Restarting audio system...');
        
        // Clean up existing resources
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Don't close audio context - reuse it
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        // Request new microphone access
        const constraints = {
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: { ideal: 44100 },
                channelCount: { ideal: 1 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ New microphone stream acquired');
        
        // Set up new audio chain
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0.8;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // Initialize Float32 arrays for more precise analysis
        this.frequencyData = new Float32Array(this.bufferLength);
        this.timeDomainData = new Float32Array(this.analyser.fftSize);
        
        this.microphone.connect(this.analyser);
        this.stream = stream;
        
        // Add event listeners to new tracks
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track, index) => {
            track.addEventListener('ended', () => {
                console.error('🚨 MediaStreamTrack ended unexpectedly');
                this.handleTrackFailure('Track ended unexpectedly. This usually means another application took control of the microphone.');
            });
            
            track.addEventListener('mute', () => {
                console.warn('🔇 MediaStreamTrack muted');
                this.handleTrackMute();
            });
            
            track.addEventListener('unmute', () => {
                console.log('🔊 MediaStreamTrack unmuted');
                this.handleTrackUnmute();
            });
        });
        
        this.isActive = true;
        this.trackFailures = 0; // Reset failure count on successful restart
        console.log('🎉 Audio system restarted successfully');
        
        if (window.liveMusicArtwork && window.liveMusicArtwork.clearAudioError) {
            window.liveMusicArtwork.clearAudioError();
        }
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