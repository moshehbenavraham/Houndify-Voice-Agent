// Houndify Configuration
// Uses environment variables for sensitive data
// See .env.example for required variables

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Validate required environment variables
const requiredEnvVars = ['HOUNDIFY_CLIENT_ID', 'HOUNDIFY_CLIENT_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please copy .env.example to .env and fill in your Houndify credentials.');
  process.exit(1);
}

module.exports = {
  // API credentials from environment variables
  clientId: process.env.HOUNDIFY_CLIENT_ID,
  clientKey: process.env.HOUNDIFY_CLIENT_KEY,
  
  // Optional configuration with defaults
  endpoint: process.env.HOUNDIFY_ENDPOINT || 'https://api.houndify.com/v1/text',
  requestTimeout: parseInt(process.env.HOUNDIFY_REQUEST_TIMEOUT) || 10000,
  
  // Voice request settings
  voiceRequestInfo: {
    Latitude: parseFloat(process.env.DEFAULT_LATITUDE) || 37.388309,
    Longitude: parseFloat(process.env.DEFAULT_LONGITUDE) || -121.973968,
    PartialTranscriptsDesired: true,
    ResponseAudioFormat: 'WAV',
    SampleRate: 16000,
    EnableVAD: true,
    VADSensitivity: 0.5,
    VADTimeout: parseInt(process.env.HOUNDIFY_VAD_TIMEOUT) || 2000
  }
};