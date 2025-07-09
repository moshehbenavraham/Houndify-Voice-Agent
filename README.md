# Houndify Voice Agent

A complete implementation of the Houndify JavaScript SDK with both client-side and server-side components for voice and text queries. This project uses the official Houndify SDK structure with proper authentication and WebSocket-based voice processing.

## 📚 Complete SDK Documentation

**👉 For detailed SDK information, examples, and implementation guidance, see: [`docs/houndify-javascript-sdk.md`](docs/houndify-javascript-sdk.md)**

This comprehensive documentation covers:
- Installation and setup methods
- Complete API reference
- Text and voice request implementation
- Audio recording and conversation state management
- Troubleshooting and best practices
- Server-side authentication and proxying

## Project Structure

```
c:/Projects/Houndify-Voice-Agent/
├── .gitattributes
├── LICENSE
├── package.json                 # Project dependencies and scripts
├── README.md                   # This file
├── src/                        # Source code
│   ├── server/                 # Server-side Node.js code
│   │   ├── server.js          # Main Express server
│   │   ├── routes/            # API routes
│   │   │   └── houndify.js    # Official Houndify SDK handlers
│   │   └── config/            # Configuration files
│   │       └── houndify-config.js # Houndify API configuration
├── public/                     # Client-side files served by server
│   ├── index.html             # Main HTML interface (includes Houndify SDK)
│   ├── js/                    # Client-side JavaScript
│   │   └── main.js           # Official SDK implementation
│   └── css/                   # Stylesheets
│       └── styles.css        # Application styles
├── node_modules/              # Dependencies (auto-generated)
└── docs/                      # Documentation
    └── houndify-javascript-sdk.md # Complete SDK documentation
```

## Installation and Setup

### 1. Install Dependencies

The Houndify SDK and required dependencies are already installed via npm:

```bash
npm install
```

**📖 For detailed installation options and setup methods, see: [`docs/houndify-javascript-sdk.md#installation`](docs/houndify-javascript-sdk.md#installation)**

### 2. API Configuration

You need to create a `.env` file with your Houndify credentials:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Houndify credentials
# Get your credentials from https://www.houndify.com/dashboard
```

**Required Environment Variables:**
```bash
HOUNDIFY_CLIENT_ID=your_client_id_here
HOUNDIFY_CLIENT_KEY=your_client_key_here
```

**Note**: Never commit your `.env` file to version control. The `.gitignore` file is configured to exclude it.

**📖 For complete authentication setup and security guidelines, see: [`docs/houndify-javascript-sdk.md#browser-sdk-setup`](docs/houndify-javascript-sdk.md#browser-sdk-setup)**

### 3. Start the Application

```bash
# Start the server
npm start

# For development with auto-restart (requires nodemon)
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Text Queries
1. Open your browser to `http://localhost:3000`
2. Type your question in the text input field
3. Click "Send" or press Enter
4. View the response from Houndify with conversation context

**📖 For complete TextRequest implementation details, see: [`docs/houndify-javascript-sdk.md#text-requests`](docs/houndify-javascript-sdk.md#text-requests)**

### Voice Queries
1. Click the "Click to speak" button
2. Allow microphone access when prompted
3. Speak your question (partial transcripts shown in real-time)
4. Click the button again to stop recording
5. View the processed response from Houndify

**📖 For complete VoiceRequest and AudioRecorder implementation, see: [`docs/houndify-javascript-sdk.md#voice-requests`](docs/houndify-javascript-sdk.md#voice-requests)**

## API Endpoints

- `GET /houndifyAuth` - Official authentication handler
- `POST /textSearchProxy` - Official text query proxy
- `POST /api/houndify/voice` - Voice query information endpoint
- `GET /health` - Health check endpoint

## Features

- ✅ **Text Queries**: Official SDK TextRequest implementation
- ✅ **Voice Queries**: Official SDK VoiceRequest with AudioRecorder
- ✅ **Real-time Transcription**: Partial transcripts during voice recording
- ✅ **Conversation State**: Context-aware follow-up questions
- ✅ **Modern UI**: Clean, responsive interface with loading states
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Security**: Server-side API key management with official handlers
- ✅ **WebSocket Support**: Real-time voice processing via WebSocket

## Implementation Details

### Official SDK Integration

This project uses the official Houndify JavaScript SDK (v3.1.13) with:

- **TextRequest**: Official text query handling with proxy authentication
- **VoiceRequest**: WebSocket-based voice processing with real-time transcription
- **AudioRecorder**: Browser audio capture with proper event handling
- **HoundifyExpress**: Server-side authentication and proxy handlers

**📖 For complete API overview and all constructors, see: [`docs/houndify-javascript-sdk.md#api-overview`](docs/houndify-javascript-sdk.md#api-overview)**

### Authentication Flow

1. Client requests authentication token from `/houndifyAuth`
2. Server signs token with client key using official handler
3. Client uses signed token for API requests
4. Text queries go through `/textSearchProxy` for secure processing

**📖 For detailed authentication implementation, see: [`docs/houndify-javascript-sdk.md#setting-up-your-server-for-browser-requests`](docs/houndify-javascript-sdk.md#setting-up-your-server-for-browser-requests)**

### Voice Processing

1. AudioRecorder captures microphone input
2. VoiceRequest establishes WebSocket connection
3. Audio streams in real-time with partial transcripts
4. Final response includes conversation state for context

**📖 For complete audio recording implementation, see: [`docs/houndify-javascript-sdk.md#recording-audio-in-the-browser`](docs/houndify-javascript-sdk.md#recording-audio-in-the-browser)**

### Conversation State Management

The application maintains conversation context across queries for natural follow-up questions.

**📖 For conversation state implementation details, see: [`docs/houndify-javascript-sdk.md#managing-conversation-state`](docs/houndify-javascript-sdk.md#managing-conversation-state)**

## Security Considerations

- **API Keys**: Client key is securely stored server-side only
- **Authentication**: Uses official Houndify authentication handlers
- **CORS**: Configured for local development (adjust for production)
- **HTTPS**: Required for microphone access in production

## Development

### File Structure

- **Server-side**: [`src/server/`](src/server/) - Official SDK handlers and Express server
- **Client-side**: [`public/`](public/) - Official SDK integration with modern UI
- **Configuration**: [`src/server/config/`](src/server/config/) - API credentials and settings
- **Documentation**: [`docs/`](docs/) - Complete SDK documentation

### Key Files

- [`src/server/server.js`](src/server/server.js) - Express server with official endpoints
- [`src/server/routes/houndify.js`](src/server/routes/houndify.js) - Official HoundifyExpress handlers
- [`public/js/main.js`](public/js/main.js) - Official SDK TextRequest/VoiceRequest implementation
- [`src/server/config/houndify-config.js`](src/server/config/houndify-config.js) - Pre-configured API credentials
- [`public/index.html`](public/index.html) - Includes official SDK via CDN

### Adding New Features

1. **Server-side**: Use official HoundifyExpress handlers in [`src/server/routes/`](src/server/routes/)
2. **Client-side**: Extend with official SDK constructors in [`public/js/main.js`](public/js/main.js)
3. **Styling**: Update [`public/css/styles.css`](public/css/styles.css)

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check server logs for authentication handler issues
2. **Microphone Access**: Ensure HTTPS in production, HTTP works on localhost
3. **WebSocket Errors**: Check browser console for VoiceRequest connection issues
4. **Port Conflicts**: If port 3000 is in use, set `PORT` environment variable

**📖 For comprehensive troubleshooting guide, see: [`docs/houndify-javascript-sdk.md#troubleshooting`](docs/houndify-javascript-sdk.md#troubleshooting)**

### Debug Mode

Enable SDK debug mode in client-side code:
```javascript
Houndify.setDebug(true);
```

### Testing

1. **Text Queries**: Try "What's the weather?" or "What time is it?"
2. **Voice Queries**: Test with clear speech and good microphone
3. **Conversation**: Ask follow-up questions to test context awareness

**📖 For best practices and performance optimization, see: [`docs/houndify-javascript-sdk.md#best-practices`](docs/houndify-javascript-sdk.md#best-practices)**

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Resources

### 📚 Primary Documentation

- **[Houndify JavaScript SDK Documentation](docs/houndify-javascript-sdk.md)** - **Complete SDK reference, examples, and implementation guide**
  - [Installation & Setup](docs/houndify-javascript-sdk.md#installation)
  - [Text Requests](docs/houndify-javascript-sdk.md#text-requests)
  - [Voice Requests](docs/houndify-javascript-sdk.md#voice-requests)
  - [Audio Recording](docs/houndify-javascript-sdk.md#recording-audio-in-the-browser)
  - [Conversation State](docs/houndify-javascript-sdk.md#managing-conversation-state)
  - [Troubleshooting](docs/houndify-javascript-sdk.md#troubleshooting)

### 🌐 External Resources

- [Official Houndify Example Repository](https://github.com/houndify/houndify-sdk-javascript-example)
- [Houndify Developer Documentation](https://houndify.com/developer)
- [Houndify JavaScript SDK on npm](https://www.npmjs.com/package/houndify)
- [Express.js Documentation](https://expressjs.com/)