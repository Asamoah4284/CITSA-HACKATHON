const crypto = require('crypto');

// Generate a unique device token
const generateDeviceToken = () => {
  // Generate a random token using crypto
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now().toString();
  const token = crypto.createHash('sha256')
    .update(randomBytes + timestamp)
    .digest('hex');
  
  return token;
};

// Validate device token format
const validateDeviceToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token is a valid hex string with correct length (SHA256 = 64 chars)
  const hexRegex = /^[a-f0-9]{64}$/i;
  return hexRegex.test(token);
};

// Generate device fingerprint from request headers
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const accept = req.headers['accept'] || '';
  
  // Create a fingerprint from browser characteristics
  const fingerprint = crypto.createHash('sha256')
    .update(userAgent + acceptLanguage + acceptEncoding + accept)
    .digest('hex');
  
  return fingerprint;
};

module.exports = {
  generateDeviceToken,
  validateDeviceToken,
  generateDeviceFingerprint
}; 