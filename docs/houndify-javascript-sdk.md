# Houndify JavaScript SDK Documentation

## Overview

The Houndify JavaScript SDK allows you to make voice and text queries to the Houndify API from a web browser or NodeJS. It comes in two forms:

1. **In-browser JavaScript library** - for client-side applications
2. **Server-side houndify Node.js module** - for server-side authentication and proxying

Both parts contain functions for sending text and voice requests to the Houndify API. Additionally, the in-browser library has an AudioRecorder for capturing audio from microphone, and the Node.js module has authentication and proxy middleware creators for Express servers.

## Table of Contents

1. [Installation](#installation)
2. [Browser SDK Setup](#browser-sdk-setup)
3. [NodeJS SDK Setup](#nodejs-sdk-setup)
4. [API Overview](#api-overview)
5. [Text Requests](#text-requests)
6. [Voice Requests](#voice-requests)
7. [Recording Audio in the Browser](#recording-audio-in-the-browser)
8. [Managing Conversation State](#managing-conversation-state)
9. [Supporting React Native](#supporting-react-native)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

## Installation

The easiest way to install the SDK is via npm:

```bash
npm install houndify
```

You can also download the SDK from the Client SDKs section of the Houndify website.

## Browser SDK Setup

### Limitations

- **Microphone Access**: Your browser needs to have access to the microphone using the getUserMedia API
- **SSL Required**: Latest browsers require secure connection (HTTPS) for microphone access. You can test on localhost with HTTP, but production requires HTTPS

### Method 1: Direct Hosting

Download the SDK and place it in your `/public` directory:

```html
<script src="/path/to/houndify.js"></script>
```

This exposes a global `Houndify` object:

```javascript
<script>
const voiceRequest = new Houndify.VoiceRequest({ /* options */ });
</script>
```

### Method 2: Using a Bundler

If using browserify or similar bundlers:

```javascript
const Houndify = require('houndify');
```

### Important: Server-Side Setup Required

Your CLIENT_ID and CLIENT_KEY must be kept private and handled server-side. You need to create server-side endpoints for authentication and proxying.

## Setting up your server for browser requests

Using Express with the houndify module:

```javascript
const houndifyExpress = require('houndify').HoundifyExpress;

// Authentication endpoint
app.get('/houndifyAuth', houndifyExpress.createAuthenticationHandler({
  clientId: "YOUR_CLIENT_ID",
  clientKey: "YOUR_CLIENT_KEY"
}));

// Text proxy endpoint
app.post('/textSearchProxy', houndifyExpress.createTextProxyHandler());
```

## NodeJS SDK Setup

For server-only environments:

```bash
npm install --save houndify
```

```javascript
const Houndify = require('houndify');
```

## API Overview

The Houndify object provides these constructors and utilities:

- **`VoiceRequest(options)`** - Constructor for voice requests
- **`TextRequest(options)`** - Constructor for text requests
- **`AudioRecorder(options)`** - Constructor for audio recording (browser only)
- **`decodeAudioData`** - Utility for decoding audio data
- **`HoundifyExpress.createAuthenticationHandler`** - Express route for authentication
- **`HoundifyExpress.createTextProxyHandler`** - Express route for text proxying
- **`HoundifyExpress.createReactNativeProxy`** - Express route for React Native
- **`setDebug(isDebugging)`** - Enable/disable debug mode

## Text Requests

### Basic Usage

```javascript
const textRequest = new Houndify.TextRequest({
  // Required options
  query: "What is the weather like?",
  clientId: "YOUR_CLIENT_ID",
  
  // Authentication (choose one)
  clientKey: "YOUR_CLIENT_KEY", // Only for testing/internal use
  authURL: "/houndifyAuth", // Recommended for production
  
  // Required request info
  requestInfo: {
    UserID: "test_user",
    Latitude: 37.388309,
    Longitude: -121.973968
  },
  
  // Optional conversation state
  conversationState: conversationState,
  
  // Required for browser requests
  proxy: {
    method: 'POST',
    url: "/textSearchProxy",
    headers: {}
  },
  
  // Required callbacks
  onResponse: (response, info) => {
    console.log(response);
  },
  
  onError: (error, info) => {
    console.log(error);
  }
});
```

### Text Request Options

#### Required Options

- **`clientId`** - Your Houndify Client ID
- **`query`** - The text to send to Houndify
- **`requestInfo`** - RequestInfo object with at minimum a `UserID`
- **`onResponse`** - Success callback function
- **`onError`** - Error callback function

#### Authentication (choose one)

- **`clientKey`** - Your Client Key (server-side only, not for production browsers)
- **`authURL`** - Server endpoint for authentication (recommended)

#### Optional Options

- **`method`** - Request method, default is "GET", can be "POST"
- **`endpoint`** - Custom endpoint URL (default: `https://api.houndify.com/v1/text`)
- **`conversationState`** - Conversation state from previous requests
- **`proxy`** - Required for browser requests, proxy configuration object

### Complete Text Request Example

```javascript
var textRequest = new Houndify.TextRequest({
  query: "What is the weather like?",
  clientId: "YOUR_CLIENT_ID",
  authURL: "/houndifyAuth",
  
  requestInfo: {
    UserID: "test_user",
    Latitude: 37.388309,
    Longitude: -121.973968
  },
  
  conversationState: conversationState,
  
  proxy: {
    method: 'POST',
    url: "/textSearchProxy",
  },
  
  onResponse: function(response, info) {
    console.log(response);
  },
  
  onError: function(err, info) {
    console.log(err);
  }
});
```

## Voice Requests

Voice requests allow streaming audio to Houndify with real-time transcription updates.

### Voice Request Options

All TextRequest options apply except `proxy` and `query`. Additional options:

- **`onTranscriptionUpdate`** - Callback for partial transcripts during recording
- **`sampleRate`** - Audio sample rate in Hz (required)
- **`endpoint`** - WebSocket endpoint (default: `wss://apiws.houndify.com:443`)
- **`convertAudioToSpeex`** - Convert audio to Speex format (default: true)
- **`enableVAD`** - Voice Activity Detection (default: true)

### Voice Request Methods

- **`write(chunk)`** - Stream audio data
- **`end()`** - End the voice request
- **`abort()`** - Abort the voice request

### Complete Voice Request Example

```javascript
var voiceRequest = new Houndify.VoiceRequest({
  clientId: "YOUR_CLIENT_ID",
  authURL: "/houndifyAuth",
  
  requestInfo: {
    UserID: "test_user",
    Latitude: 37.388309,
    Longitude: -121.973968
  },
  
  conversationState: conversationState,
  sampleRate: 16000,
  convertAudioToSpeex: true,
  enableVAD: true,
  
  onTranscriptionUpdate: (transcript) => {
    console.log("Partial Transcript:", transcript.PartialTranscript);
  },
  
  onResponse: (response, info) => {
    console.log(response);
  },
  
  onError: (err, info) => {
    console.log(err);
  }
});

// Stream audio data
voiceRequest.write(audioChunk);

// End the request
voiceRequest.end();
```

## Recording Audio in the Browser

The `AudioRecorder` simplifies browser audio capture:

```javascript
const recorder = new Houndify.AudioRecorder();
let voiceRequest;

recorder.on('start', () => {
  voiceRequest = new Houndify.VoiceRequest({
    clientId: "YOUR_CLIENT_ID",
    authURL: "/houndifyAuth",
    requestInfo: {
      UserID: "test_user",
      Latitude: 37.388309,
      Longitude: -121.973968
    },
    sampleRate: 16000,
    onTranscriptionUpdate: (transcript) => {
      console.log("Partial:", transcript.PartialTranscript);
    },
    onResponse: (response, info) => {
      console.log(response);
    },
    onError: (err, info) => {
      console.log(err);
    }
  });
});

recorder.on('data', (data) => {
  voiceRequest.write(data);
});

recorder.on('end', () => {
  voiceRequest.end();
});

recorder.on('error', (err) => {
  console.log(err);
});

// Start/stop recording
recorder.start();
recorder.stop();

// Check recording status
console.log(recorder.isRecording());
```

## Managing Conversation State

Conversation state enables context-aware follow-up queries:

```javascript
// Initialize conversation state
let userConversationState = {};

// Create request with conversation state
let voiceRequest = new Houndify.VoiceRequest({
  // ... other options
  conversationState: userConversationState,
  
  onResponse: (response, info) => {
    // Update conversation state from response
    userConversationState = response.AllResults[0].ConversationState;
  }
});

// Reset conversation state when needed
userConversationState = {};
```

## Supporting React Native

For React Native apps, use the `houndify-react-native` library with server-side support:

### Server Setup

```javascript
const houndifyExpress = require('houndify').HoundifyExpress;
const express = require('express');
const app = express();

// Add WebSocket support
require('express-ws')(app);

// React Native proxy route
app.use(
  '/houndifyReactNativeProxy',
  houndifyExpress.createReactNativeProxy(express, 'CLIENT_ID', 'CLIENT_KEY')
);
```

Remember to install `express-ws`:

```bash
npm install --save express-ws
```

## Best Practices

### Request Objects

- Create new `TextRequest` and `VoiceRequest` objects for each query
- Maintain `requestInfo` and `conversationState` separately
- Reuse these objects across multiple requests

### Security

- Never expose `clientKey` in browser production code
- Use server-side authentication endpoints
- Implement proper CORS policies
- Use HTTPS in production

### Performance

- Use appropriate sample rates for voice requests
- Implement proper error handling and retry logic
- Consider connection pooling for high-volume applications

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Client ID and Key are correct
   - Check server-side authentication endpoints
   - Ensure clientKey is not exposed in browser

2. **Microphone Access**
   - Check browser permissions
   - Ensure HTTPS in production
   - Test getUserMedia API availability

3. **Audio Recording Issues**
   - Verify sample rate compatibility
   - Check audio format settings
   - Test with different browsers

### Debug Mode

Enable debug logging:

```javascript
Houndify.setDebug(true);
```

### Server-Side Route Implementation (Non-NodeJS)

If not using NodeJS, implement these routes in your preferred language:

#### Authentication Handler

```javascript
function createAuthenticationHandler(opts) {
    return function (req, res) {
        var clientKey = opts.clientKey.replace(/-/g, "+").replace(/_/g, "/");
        var clientKeyBin = new Buffer(clientKey, "base64");
        var hash = crypto.createHmac("sha256", clientKeyBin).update(req.query.token).digest("base64");
        var signature = hash.replace(/\+/g, "-").replace(/\//g, "_");
        res.send(signature);
    }
}
```

#### Text Proxy Handler

```javascript
function createTextProxyHandler() {
    return function (req, res) {
        var houndifyHeaders = {};
        for (var key in req.headers) {
            var splitKey = key.toLowerCase().split("-");
            if (splitKey[0] == "hound") {
                var houndHeader = splitKey.map(function(pt) {
                    return pt.charAt(0).toUpperCase() + pt.slice(1);
                }).join("-");
                houndifyHeaders[houndHeader] = req.headers[key];
            }
        }

        houndifyHeaders['Hound-Request-Info'] = houndifyHeaders['Hound-Request-Info'] || req.body;

        request({
            url: "https://api.houndify.com/v1/text",
            qs: req.query,
            headers: houndifyHeaders
        }, function (err, resp, body) {
            if (err) return res.status(500).send(err.toString());
            res.status(resp.statusCode).send(body);
        });
    }
}
```

## Response Format

Houndify responses follow this structure:

```javascript
{
  "AllResults": [
    {
      "CommandKind": "WeatherCommand",
      "SpokenResponseLong": "The weather today is sunny with a high of 75 degrees.",
      "SpokenResponse": "Sunny, 75 degrees",
      "WrittenResponseLong": "Today's weather: Sunny, High 75°F, Low 60°F",
      "WrittenResponse": "Sunny, 75°F",
      "ConversationState": { /* conversation state object */ },
      "Result": {
        // Command-specific result data
      }
    }
  ],
  "Status": "OK",
  "NumToReturn": 1
}
```

## Resources

- [Houndify Developer Portal](https://houndify.com/developer)
- [Official Example Repository](https://github.com/houndify/houndify-sdk-javascript-example)
- [Houndify JavaScript SDK on npm](https://www.npmjs.com/package/houndify)
- [React Native Houndify SDK](https://www.npmjs.com/package/houndify-react-native)

## Version Information

- **SDK Version**: 3.1.13
- **API Version**: v1
- **Supported Audio Formats**: PCM, WAV, Opus, Speex
- **Browser Support**: Chrome, Firefox, Safari, Edge (with getUserMedia support)

---

*Last updated: January 2025*  
*For the most current information, visit the [official Houndify documentation](https://docs.houndify.com/sdks/docs/javascript)*