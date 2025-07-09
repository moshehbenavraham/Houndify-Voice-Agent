const houndifyExpress = require('houndify').HoundifyExpress;
const config = require('../config/houndify-config');

// Create authentication handler
const authHandler = houndifyExpress.createAuthenticationHandler({
  clientId: config.clientId,
  clientKey: config.clientKey
});

// Create text proxy handler
const textProxyHandler = houndifyExpress.createTextProxyHandler();

// Custom text query handler that properly formats the request for the proxy
function handleTextQuery(req, res) {
  // The Houndify SDK sends headers with "Hound-Request-Info" containing the actual request data
  // The textProxyHandler expects this to be in req.body as a string
  // Get the Hound-Request-Info header if it exists
  const requestInfo = req.headers['hound-request-info'] || req.get('Hound-Request-Info');
  
  // Set the body to the request info string
  req.body = requestInfo || '';
  
  console.log('Headers:', req.headers);
  console.log('Body set to:', req.body);
  
  // Now call the proxy handler
  textProxyHandler(req, res);
}

// Voice query handler (for future implementation)
async function handleVoiceQuery(req, res) {
  try {
    // Voice queries are handled via WebSocket in the official SDK
    // This endpoint is for demonstration purposes
    res.status(501).json({
      error: 'Voice queries should use WebSocket connection directly to Houndify',
      message: 'Use VoiceRequest constructor in the client-side code'
    });
  } catch (error) {
    console.error('Voice query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Client configuration endpoint - provides client ID to frontend
function getClientConfig(req, res) {
  res.json({
    clientId: config.clientId,
    // Never send the client key to the frontend!
    voiceRequestInfo: config.voiceRequestInfo
  });
}

module.exports = {
  handleTextQuery,
  handleVoiceQuery,
  authHandler,
  textProxyHandler,
  getClientConfig
};