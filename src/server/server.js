const express = require('express');
const cors = require('cors');
const path = require('path');
const houndifyRoutes = require('./routes/houndify');

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000'];
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.static(path.join(__dirname, '../../public')));

// Houndify routes
app.get('/api/config', houndifyRoutes.getClientConfig);
app.get('/houndifyAuth', houndifyRoutes.authHandler);
app.post('/textSearchProxy', houndifyRoutes.handleTextQuery);
app.post('/api/houndify/voice', houndifyRoutes.handleVoiceQuery);

// Serve client files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  
  // Handle other errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Houndify Voice Agent server running on port ${PORT}`);
  console.log(`📍 Visit http://localhost:${PORT} to use the application`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  
  // Check for environment configuration
  if (!process.env.HOUNDIFY_CLIENT_ID || !process.env.HOUNDIFY_CLIENT_KEY) {
    console.warn('⚠️  Warning: Houndify credentials not found in environment variables');
    console.warn('   The server will fail when trying to authenticate requests');
    console.warn('   Please create a .env file based on .env.example\n');
  }
});

module.exports = app;