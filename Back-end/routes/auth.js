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

    // Create user data object
    const userData = {
      email,
      password,
      name,
      userType
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

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        points: user.points,
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        country: user.country,
        city: user.city
      },
      token
    });
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
        points: user.points
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