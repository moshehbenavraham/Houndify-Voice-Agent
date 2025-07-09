# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Houndify Voice Agent is a Node.js/Express application that implements voice and text query functionality using the Houndify SDK. It features a web-based interface for interacting with Houndify's natural language processing API through both text input and voice recording.

## Architecture

### Backend (Node.js/Express)
- **Entry Point**: `src/server/server.js` - Express server with static file serving and API routes
- **Routes**: `src/server/routes/houndify.js` - Houndify SDK authentication and proxy handlers
- **Config**: `src/server/config/houndify-config.js` - API credentials (supports environment variables)

### Frontend (Vanilla JavaScript)
- **HTML**: `public/index.html` - Loads Houndify SDK from CDN
- **JavaScript**: `public/js/main.js` - Implements TextRequest and VoiceRequest with conversation state
- **Styles**: `public/css/styles.css` - UI styling

### Key Dependencies
- `express` (v5.1.0) - Web server framework
- `houndify` (v3.1.14) - Official Houndify SDK
- `cors` (v2.8.5) - CORS middleware for cross-origin requests

## Common Commands

```bash
# Install all dependencies (including dev dependencies)
npm install

# Set up environment (REQUIRED before first run)
cp .env.example .env
# Edit .env and add your Houndify credentials

# Start production server (port 3000)
npm start

# Development mode with auto-restart
npm run dev

# Run tests
npm test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report

# Code quality
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check formatting
```

## API Endpoints

- `GET /api/config` - Returns client configuration (client ID and voice settings)
- `GET /houndifyAuth` - Returns signed authentication token
- `POST /textSearchProxy` - Proxies text queries to Houndify API
- `POST /api/houndify/voice` - Voice endpoint (returns 501 - use WebSocket instead)
- `GET /health` - Health check endpoint

## Development Workflow

### Adding Features
1. **Server-side changes**: Modify routes in `src/server/routes/houndify.js`
2. **Client-side changes**: Update `public/js/main.js` for SDK integration
3. **UI changes**: Edit `public/index.html` and `public/css/styles.css`

### Environment Variables
```bash
# Windows
set HOUNDIFY_CLIENT_ID=your_client_id
set HOUNDIFY_CLIENT_KEY=your_client_key
set PORT=3000

# Linux/Mac
export HOUNDIFY_CLIENT_ID=your_client_id
export HOUNDIFY_CLIENT_KEY=your_client_key
export PORT=3000
```

### Testing Voice Features
- Requires microphone access (HTTPS in production, HTTP works on localhost)
- Test with clear speech in a quiet environment
- Check browser console for WebSocket connection issues

## Security & Best Practices

1. **Environment Variables** - All sensitive data stored in `.env` file
2. **CORS Configuration** - Restricted to allowed origins via `CORS_ORIGINS`
3. **No Client-Side Keys** - Client ID fetched from server, client key never exposed
4. **Request Logging** - All requests logged with timestamps
5. **Error Handling** - Comprehensive error handling with appropriate status codes

## Development Tools

- **ESLint** - Code quality checks with Airbnb config
- **Prettier** - Code formatting for consistency
- **Jest** - Testing framework (tests to be added)
- **Nodemon** - Auto-restart in development
- **dotenv** - Environment variable management

## Houndify SDK Integration Notes

- SDK loaded via CDN in `index.html`: `https://unpkg.com/houndify@3.1.13/dist/houndify.js`
- Uses official SDK patterns: TextRequest, VoiceRequest, AudioRecorder
- Maintains conversation state for context-aware queries
- WebSocket-based voice streaming with partial transcripts

## Common Issues

1. **Port already in use**: Change port via `PORT` environment variable
2. **Microphone not working**: Check browser permissions and HTTPS requirements
3. **Authentication errors**: Verify API credentials in config or environment
4. **CORS errors**: Ensure server is running and CORS is properly configured

## Documentation

Comprehensive SDK documentation available at: `docs/houndify-javascript-sdk.md`