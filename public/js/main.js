class HoundifyVoiceAgent {
    constructor() {
        this.isRecording = false;
        this.recorder = null;
        this.conversationState = {};
        this.clientId = null;
        this.voiceRequestInfo = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadConfiguration();
    }

    initializeElements() {
        this.textInput = document.getElementById('textQuery');
        this.sendTextBtn = document.getElementById('sendTextBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.loading = document.getElementById('loading');
        this.response = document.getElementById('response');
        this.responseContent = document.getElementById('responseContent');
        this.error = document.getElementById('error');
        this.errorContent = document.getElementById('errorContent');
    }

    attachEventListeners() {
        this.sendTextBtn.addEventListener('click', () => this.handleTextQuery());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleTextQuery();
            }
        });
        this.voiceBtn.addEventListener('click', () => this.handleVoiceQuery());
    }

    async loadConfiguration() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            this.clientId = config.clientId;
            this.voiceRequestInfo = config.voiceRequestInfo;
            console.log('Configuration loaded successfully');
        } catch (error) {
            console.error('Failed to load configuration:', error);
            this.showError('Failed to load configuration. Please refresh the page.');
        }
    }

    async handleTextQuery() {
        const query = this.textInput.value.trim();
        if (!query) {
            this.showError('Please enter a query');
            return;
        }

        this.showLoading();
        
        try {
            if (!this.clientId) {
                this.showError('Configuration not loaded. Please refresh the page.');
                return;
            }

            // Use the official Houndify SDK for text requests
            const textRequest = new Houndify.TextRequest({
                query: query,
                clientId: this.clientId,
                authURL: "/houndifyAuth",
                
                requestInfo: {
                    UserID: "test_user",
                    Latitude: 37.388309,
                    Longitude: -121.973968
                },
                
                conversationState: this.conversationState,
                
                proxy: {
                    method: 'POST',
                    url: "/textSearchProxy",
                },
                
                onResponse: (response, info) => {
                    // Update conversation state
                    if (response.AllResults && response.AllResults.length > 0) {
                        this.conversationState = response.AllResults[0].ConversationState || {};
                    }
                    this.showResponse(response);
                    this.textInput.value = '';
                },
                
                onError: (error, info) => {
                    this.showError(`Error: ${error.message || error}`);
                }
            });
        } catch (error) {
            this.showError(`Error: ${error.message}`);
        }
    }

    async handleVoiceQuery() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            await this.stopRecording();
        }
    }

    async startRecording() {
        if (!this.clientId) {
            this.showError('Configuration not loaded. Please refresh the page.');
            return;
        }

        // Check for getUserMedia support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Your browser does not support audio recording. Please use Chrome or Firefox.');
            return;
        }

        try {
            // Request microphone permission first
            console.log('Requesting microphone permission...');
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permission granted');
            
            // Create the voice request first
            const voiceRequest = new Houndify.VoiceRequest({
                clientId: this.clientId,
                authURL: "/houndifyAuth",
                
                requestInfo: Object.assign({
                    UserID: "test_user",
                    Latitude: 37.388309,
                    Longitude: -121.973968,
                    PartialTranscriptsDesired: true
                }, this.voiceRequestInfo || {}),
                
                conversationState: this.conversationState,
                sampleRate: 16000,
                enableVAD: true,
                vadTimeout: 2000, // 2 seconds of silence before stopping
                convertAudioToSpeex: false, // Use raw PCM for better compatibility
                
                onTranscriptionUpdate: (transcript) => {
                    console.log('Transcription update:', transcript);
                    console.log('PartialTranscript:', transcript.PartialTranscript);
                    console.log('SafeToStopAudio:', transcript.SafeToStopAudio);
                    console.log('Duration:', transcript.DurationMS);
                    
                    // Show partial transcription
                    if (transcript.PartialTranscript && transcript.PartialTranscript.trim()) {
                        this.showPartialTranscript(transcript.PartialTranscript);
                    }
                },
                
                onResponse: (response, info) => {
                    console.log('Voice response:', response);
                    console.log('Response info:', info);
                    
                    // Check if there was an error or no transcription
                    if (response.AllResults && response.AllResults.length > 0) {
                        const result = response.AllResults[0];
                        console.log('Result CommandKind:', result.CommandKind);
                        console.log('Result Transcription:', result.Transcription);
                        
                        // Check for no speech detected
                        if (result.CommandKind === 'NoResult' || !result.Transcription) {
                            this.showError('No speech detected. Please try speaking louder and clearer.');
                        } else {
                            this.conversationState = result.ConversationState || {};
                            this.showResponse(response);
                        }
                    } else {
                        this.showError('No response received from Houndify.');
                    }
                    
                    this.stopRecording();
                },
                
                onError: (error, info) => {
                    console.error('Voice error:', error);
                    console.error('Error info:', info);
                    this.showError(`Voice error: ${error.message || error}`);
                    this.stopRecording();
                }
            });

            // Use the official Houndify AudioRecorder with proper configuration
            this.recorder = new Houndify.AudioRecorder({
                sampleRate: 16000,
                enableVAD: true
            });
            
            this.recorder.on('start', () => {
                console.log('Recorder started successfully');
                console.log('Audio context sample rate:', this.recorder.audioContext?.sampleRate);
                this.showLoading();
            });

            this.recorder.on('data', (data) => {
                console.log('Audio data received:', data.length, 'bytes');
                // Verify we have actual audio data
                if (data && data.length > 0) {
                    try {
                        voiceRequest.write(data);
                    } catch (error) {
                        console.error('Error writing audio data:', error);
                    }
                } else {
                    console.warn('Empty audio data received');
                }
            });

            this.recorder.on('end', () => {
                console.log('Recorder ended');
                try {
                    voiceRequest.end();
                } catch (error) {
                    console.error('Error ending voice request:', error);
                }
            });

            this.recorder.on('error', (err) => {
                console.error('Recorder error:', err);
                this.showError(`Recording error: ${err.message || err}`);
                this.stopRecording();
            });

            // Start recording
            console.log('Starting recorder...');
            try {
                this.recorder.start();
                this.isRecording = true;
                this.updateVoiceButton();
                console.log('Recording started, isRecording:', this.isRecording);
            } catch (error) {
                console.error('Error starting recorder:', error);
                this.showError('Failed to start recording: ' + error.message);
            }
            
        } catch (error) {
            console.error('Voice recording error:', error);
            if (error.name === 'NotAllowedError') {
                this.showError('Microphone access denied. Please allow microphone access and try again.');
            } else if (error.name === 'NotFoundError') {
                this.showError('No microphone found. Please check your audio devices.');
            } else {
                this.showError('Error accessing microphone: ' + error.message);
            }
        }
    }

    async stopRecording() {
        if (this.recorder && this.isRecording) {
            console.log('Stopping recording...');
            try {
                this.recorder.stop();
                this.isRecording = false;
                this.updateVoiceButton();
                console.log('Recording stopped');
            } catch (error) {
                console.error('Error stopping recorder:', error);
            }
        }
    }

    updateVoiceButton() {
        const btnText = this.voiceBtn.querySelector('.btn-text');
        if (this.isRecording) {
            this.voiceBtn.classList.add('recording');
            btnText.textContent = 'Recording... Click to stop';
        } else {
            this.voiceBtn.classList.remove('recording');
            btnText.textContent = 'Click to speak';
        }
    }

    showLoading() {
        this.hideAll();
        this.loading.classList.remove('hidden');
    }

    showPartialTranscript(transcript) {
        if (transcript && transcript.trim()) {
            this.hideAll();
            this.responseContent.innerHTML = `<p><em>Listening: ${transcript}</em></p>`;
            this.response.classList.remove('hidden');
        }
    }

    showResponse(data) {
        this.hideAll();
        
        // Format the response based on Houndify API structure
        let formattedResponse = '';
        
        if (data.AllResults && data.AllResults.length > 0) {
            const result = data.AllResults[0];
            
            if (result.SpokenResponseLong) {
                formattedResponse = `<p><strong>Response:</strong> ${result.SpokenResponseLong}</p>`;
            } else if (result.SpokenResponse) {
                formattedResponse = `<p><strong>Response:</strong> ${result.SpokenResponse}</p>`;
            }
            
            if (result.WrittenResponseLong) {
                formattedResponse += `<p><strong>Details:</strong> ${result.WrittenResponseLong}</p>`;
            } else if (result.WrittenResponse) {
                formattedResponse += `<p><strong>Details:</strong> ${result.WrittenResponse}</p>`;
            }
        } else {
            formattedResponse = '<p>No response available</p>';
        }
        
        this.responseContent.innerHTML = formattedResponse;
        this.response.classList.remove('hidden');
    }

    showError(message) {
        this.hideAll();
        this.errorContent.textContent = message;
        this.error.classList.remove('hidden');
    }

    hideAll() {
        this.loading.classList.add('hidden');
        this.response.classList.add('hidden');
        this.error.classList.add('hidden');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HoundifyVoiceAgent();
});