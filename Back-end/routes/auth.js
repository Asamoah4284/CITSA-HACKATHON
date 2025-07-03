const express = require('express');
const User = require('../models/User');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// POST /auth/register
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
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
    
    if (enteredReferralCode) {
      // Check for fraud using all IP addresses
      fraudCheck = await User.checkForFraud(enteredReferralCode, req.clientIPs);
      
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
      registrationIPs: req.clientIPs // Store all IP addresses
    };

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

    // Award referral points if valid referrer code was used and no fraud detected
    let referralResult = null;
    if (enteredReferralCode && referrer && !fraudDetected) {
      try {
        referralResult = await User.awardReferralPoints(enteredReferralCode, user._id);
        
        // Track all IP addresses used by both users
        await referrer.addUsedIPs(req.clientIPs);
        await user.addUsedIPs(req.clientIPs);
      } catch (error) {
        console.error('Error awarding referral points:', error);
        // Don't fail registration if referral points fail
      }
    } else if (enteredReferralCode && referrer) {
      // Even if fraud detected, track IPs for future detection
      try {
        await referrer.addUsedIPs(req.clientIPs);
        await user.addUsedIPs(req.clientIPs);
      } catch (error) {
        console.error('Error tracking IPs:', error);
      }
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Prepare response
    const responseData = {
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        points: user.points,
        myReferralCode: user.myReferralCode,
        enteredReferralCode: user.enteredReferralCode,
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        country: user.country,
        city: user.city
      },
      token
    };

    // Add referral information if points were awarded
    if (referralResult) {
      responseData.referralInfo = {
        referrerName: referrer.name,
        pointsAwarded: referralResult.newUserPointsAwarded,
        referrerPointsAwarded: referralResult.referrerPointsAwarded
      };
    }

    // Add fraud detection warning if fraud was detected
    if (fraudDetected) {
      responseData.fraudWarning = {
        message: 'Account created but referral points not awarded due to fraud detection',
        reason: fraudReason,
        details: 'Same IP address detected - referral points blocked for security'
      };
    }

    res.status(201).json(responseData);
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

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        points: user.points,
        myReferralCode: user.myReferralCode,
        enteredReferralCode: user.enteredReferralCode,
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        businessDescription: user.businessDescription,
        phone: user.phone,
        country: user.country,
        city: user.city,
        website: user.website,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
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