const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to capture client IP address
const captureIP = (req, res, next) => {
  // Get all possible IP addresses from various headers
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const remoteAddr = req.connection.remoteAddress || req.socket.remoteAddress;
  const socketAddr = req.connection.socket ? req.connection.socket.remoteAddress : null;
  const reqIP = req.ip;
  
  // Collect all IP addresses
  let allIPs = [];
  
  // Add x-forwarded-for IPs (comma-separated list)
  if (forwardedFor) {
    const forwardedIPs = forwardedFor.split(',').map(ip => ip.trim());
    allIPs = allIPs.concat(forwardedIPs);
  }
  
  // Add other IP sources
  if (realIP) allIPs.push(realIP);
  if (remoteAddr) allIPs.push(remoteAddr);
  if (socketAddr) allIPs.push(socketAddr);
  if (reqIP) allIPs.push(reqIP);
  
  // Remove duplicates and clean up IPs
  const uniqueIPs = [...new Set(allIPs)]
    .map(ip => ip.replace(/^::ffff:/, '')) // Remove IPv6 prefix
    .filter(ip => ip && ip !== 'undefined' && ip !== 'null');
  
  // Store all IPs for fraud detection
  req.clientIPs = uniqueIPs;
  req.clientIP = uniqueIPs[0] || null; // Keep first IP for backward compatibility
  
  next();
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { auth, captureIP }; 