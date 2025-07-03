const express = require('express');
const User = require('../models/User');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');
const { validateDeviceToken, generateDeviceFingerprint } = require('../utils/deviceToken');

const router = express.Router();

// POST /auth/register
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    // Debug: Log the entire request body
    console.log('🔍 DEBUG: Full request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      email, 
      password, 
      name, 
      userType,
      enteredReferralCode,
      businessName,
      businessCategory,
      businessDescription,
      phone,
      country,
      city,
      website
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email'
      });
    }

    // Validate entered referral code if provided
    let referrer = null;
    let fraudCheck = null;
    let fraudDetected = false;
    let fraudReason = null;
    
    // Get device token from request body or generate fingerprint
    const deviceToken = req.body.deviceToken || generateDeviceFingerprint(req);
    
    // Debug logging
    console.log('🔍 Backend Device Token Debug:');
    console.log('Request Body:', req.body);
    console.log('Device Token from request:', req.body.deviceToken);
    console.log('Generated Device Token:', deviceToken);
    console.log('Client IPs:', req.clientIPs);
    
    if (enteredReferralCode) {
      // Check for fraud using all IP addresses and device token
      fraudCheck = await User.checkForFraud(enteredReferralCode, req.clientIPs, deviceToken);
      
      if (fraudCheck.isFraud) {
        fraudDetected = true;
        fraudReason = fraudCheck.reason;
        
        // Still allow registration but mark for no points
        referrer = fraudCheck.referrer;
      } else {
        referrer = fraudCheck.referrer;
      }
      
      // Prevent self-referral by email (this still blocks registration)
      if (referrer.email === email) {
        return res.status(400).json({
          error: 'You cannot refer yourself'
        });
      }
    }

    // Create user data object
    const userData = {
      email,
      password,
      name,
      userType,
      enteredReferralCode: enteredReferralCode || null,
      registrationIP: req.clientIP, // Keep first IP for backward compatibility
      registrationIPs: req.clientIPs, // Store all IP addresses
      registrationDeviceToken: deviceToken // Store device token
    };

    // Debug: Log user data being saved
    console.log('🔍 DEBUG: User data being saved:', JSON.stringify(userData, null, 2));

    // Add artisan-specific fields if user type is artisan
    if (userType === 'artisan') {
      userData.businessName = businessName;
      userData.businessCategory = businessCategory;
      userData.businessDescription = businessDescription;
      userData.phone = phone;
      userData.country = country;
      userData.city = city;
      if (website) userData.website = website;
    }

    // Create new user
    const user = new User(userData);
    await user.save();
    
    // Debug: Log what was saved to database
    console.log('🔍 Database Save Debug:');
    console.log('User Data Saved:', userData);
    console.log('Saved User Object:', user.toJSON());

    // Award referral points if valid referrer code was used and no fraud detected
    let referralResult = null;
    if (enteredReferralCode && referrer && !fraudDetected) {
      try {
        referralResult = await User.awardReferralPoints(enteredReferralCode, user._id);
        
        // Track all IP addresses and device tokens used by both users
        await referrer.addUsedIPs(req.clientIPs);
        await referrer.addUsedDeviceTokens([deviceToken]);
        await user.addUsedIPs(req.clientIPs);
        await user.addUsedDeviceTokens([deviceToken]);
      } catch (error) {
        console.error('Error awarding referral points:', error);
        // Don't fail registration if referral points fail
      }
    } else if (enteredReferralCode && referrer) {
      // Even if fraud detected, track IPs and device tokens for future detection
      try {
        await referrer.addUsedIPs(req.clientIPs);
        await referrer.addUsedDeviceTokens([deviceToken]);
        await user.addUsedIPs(req.clientIPs);
        await user.addUsedDeviceTokens([deviceToken]);
      } catch (error) {
        console.error('Error tracking IPs and device tokens:', error);
      }
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Prepare response
    const response = {
      message: 'User registered successfully',
      user: user.toJSON(),
      referralInfo: referralResult,
      fraudWarning: fraudDetected ? {
        message: 'Referral points blocked due to fraud detection',
        reason: fraudReason,
        details: 'Account created successfully but referral points were not awarded due to fraud detection rules'
      } : null,
      // Include tracking information for transparency
      trackingInfo: {
        registrationIP: req.clientIP,
        registrationIPs: req.clientIPs,
        registrationDeviceToken: deviceToken,
        fraudDetected: fraudDetected,
        fraudReason: fraudReason
      }
    };

    // Debug: Log final response
    console.log('🔍 DEBUG: Final response trackingInfo:', JSON.stringify(response.trackingInfo, null, 2));

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// POST /auth/login
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data with token
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
      // Include tracking information for transparency
      trackingInfo: {
        registrationIP: user.registrationIP,
        registrationIPs: user.registrationIPs,
        registrationDeviceToken: user.registrationDeviceToken,
        usedIPs: user.usedIPs,
        usedDeviceTokens: user.usedDeviceTokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

module.exports = router; 