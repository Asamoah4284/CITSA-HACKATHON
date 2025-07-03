const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  userType: {
    type: String,
    enum: ['customer', 'artisan'],
    required: [true, 'User type is required'],
    default: 'customer'
  },
  // Customer fields
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  myReferralCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Referral code cannot exceed 50 characters']
  },
  // Code that user entered during registration (who referred them)
  enteredReferralCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Entered referral code cannot exceed 50 characters'],
    default: null
  },
  // IP address tracking for fraud detection
  registrationIP: {
    type: String,
    trim: true,
    maxlength: [45, 'IP address cannot exceed 45 characters']
  },
  // Store all IP addresses from registration
  registrationIPs: [{
    type: String,
    trim: true,
    maxlength: [45, 'IP address cannot exceed 45 characters']
  }],
  // Track all IP addresses used by this user
  usedIPs: [{
    ip: {
      type: String,
      trim: true,
      maxlength: [45, 'IP address cannot exceed 45 characters']
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Device token tracking for fraud detection
  registrationDeviceToken: {
    type: String,
    trim: true,
    maxlength: [255, 'Device token cannot exceed 255 characters']
  },
  // Track all device tokens used by this user
  usedDeviceTokens: [{
    token: {
      type: String,
      trim: true,
      maxlength: [255, 'Device token cannot exceed 255 characters']
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Artisan fields
  businessName: {
    type: String,
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessCategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Business category cannot exceed 50 characters']
  },
  businessDescription: {
    type: String,
    maxlength: [2000, 'Business description cannot exceed 2000 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code for new users
userSchema.pre('save', async function(next) {
  // Only generate referral code for new users who don't have one
  if (this.isNew && !this.myReferralCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.myReferralCode = result;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Add points method
userSchema.methods.addPoints = function(points) {
  this.points += points;
  return this.save();
};

// Find user by referral code (static method)
userSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ myReferralCode: referralCode });
};

// Check for fraud by IP address and device token
userSchema.statics.checkForFraud = async function(referrerCode, clientIPs, deviceToken) {
  try {
    // Find the referrer
    const referrer = await this.findByReferralCode(referrerCode);
    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Check if device token matches the referrer's registration device token
    if (referrer.registrationDeviceToken && deviceToken && referrer.registrationDeviceToken === deviceToken) {
      return {
        isFraud: true,
        reason: 'Same device token detected - potential self-referral fraud',
        referrer: referrer,
        allowRegistration: true,
        allowPoints: false
      };
    }

    // Check if device token is in the referrer's used device tokens
    if (deviceToken && referrer.usedDeviceTokens && referrer.usedDeviceTokens.length > 0) {
      const hasUsedDeviceToken = referrer.usedDeviceTokens.some(tokenRecord => tokenRecord.token === deviceToken);
      if (hasUsedDeviceToken) {
        return {
          isFraud: true,
          reason: 'Device token previously used by referrer - potential fraud',
          referrer: referrer,
          allowRegistration: true,
          allowPoints: false
        };
      }
    }

    // Check if any of the client IPs match the referrer's registration IP
    if (referrer.registrationIP && clientIPs.includes(referrer.registrationIP)) {
      return {
        isFraud: true,
        reason: 'Same IP address detected - potential self-referral fraud',
        referrer: referrer,
        allowRegistration: true,
        allowPoints: false
      };
    }

    // Check if any of the client IPs match any of the referrer's registration IPs
    if (referrer.registrationIPs && referrer.registrationIPs.length > 0) {
      const matchingIPs = clientIPs.filter(ip => referrer.registrationIPs.includes(ip));
      if (matchingIPs.length > 0) {
        return {
          isFraud: true,
          reason: `Same IP address detected (${matchingIPs.join(', ')}) - potential self-referral fraud`,
          referrer: referrer,
          allowRegistration: true,
          allowPoints: false
        };
      }
    }

    // Check if any of the client IPs are in the referrer's used IPs
    const referrerUsedIPs = referrer.usedIPs.map(ipRecord => ipRecord.ip);
    const matchingUsedIPs = clientIPs.filter(ip => referrerUsedIPs.includes(ip));
    if (matchingUsedIPs.length > 0) {
      return {
        isFraud: true,
        reason: `IP address previously used by referrer (${matchingUsedIPs.join(', ')}) - potential fraud`,
        referrer: referrer,
        allowRegistration: true,
        allowPoints: false
      };
    }

    // Check if any user with any of these IPs or device token has used this referral code before
    const existingUserQuery = {
      enteredReferralCode: referrerCode,
      $or: [
        { 'usedIPs.ip': { $in: clientIPs } },
        { registrationIP: { $in: clientIPs } },
        { registrationIPs: { $in: clientIPs } }
      ]
    };

    // Add device token check if provided
    if (deviceToken) {
      existingUserQuery.$or.push(
        { 'usedDeviceTokens.token': deviceToken },
        { registrationDeviceToken: deviceToken }
      );
    }

    const existingUserWithIP = await this.findOne(existingUserQuery);

    if (existingUserWithIP) {
      return {
        isFraud: true,
        reason: 'IP address or device token already used with this referral code - potential fraud',
        referrer: referrer,
        allowRegistration: true,
        allowPoints: false
      };
    }

    return {
      isFraud: false,
      referrer: referrer,
      allowRegistration: true,
      allowPoints: true
    };
  } catch (error) {
    throw error;
  }
};

// Add IP addresses to user's used IPs
userSchema.methods.addUsedIPs = function(ips) {
  const currentTime = new Date();
  
  ips.forEach(ip => {
    // Check if IP already exists
    const ipExists = this.usedIPs.some(ipRecord => ipRecord.ip === ip);
    if (!ipExists) {
      this.usedIPs.push({ ip, usedAt: currentTime });
    }
  });
  
  return this.save();
};

// Add single IP address to user's used IPs (for backward compatibility)
userSchema.methods.addUsedIP = function(ip) {
  return this.addUsedIPs([ip]);
};

// Award referral points to both referrer and new user
userSchema.statics.awardReferralPoints = async function(referralCode, newUserId) {
  try {
    // Find the referrer by their referral code
    const referrer = await this.findByReferralCode(referralCode);
    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Find the new user
    const newUser = await this.findById(newUserId);
    if (!newUser) {
      throw new Error('New user not found');
    }

    // Award points to referrer (100 points for successful referral)
    await referrer.addPoints(100);

    // New user gets 0 points (no bonus for using a referral code)
    // await newUser.addPoints(50); // Removed this line

    return {
      referrer: referrer,
      newUser: newUser,
      referrerPointsAwarded: 100,
      newUserPointsAwarded: 0
    };
  } catch (error) {
    throw error;
  }
};

// Generate unique referral code for the user
userSchema.methods.generateReferralCode = function() {
  // Generate a unique 8-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.myReferralCode = result;
  return this.save();
};

// Get user without password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Add device tokens to user's used device tokens
userSchema.methods.addUsedDeviceTokens = function(tokens) {
  const currentTime = new Date();
  
  tokens.forEach(token => {
    if (token) {
      // Check if token already exists
      const tokenExists = this.usedDeviceTokens.some(tokenRecord => tokenRecord.token === token);
      if (!tokenExists) {
        this.usedDeviceTokens.push({ token, usedAt: currentTime });
      }
    }
  });
  
  return this.save();
};

// Add single device token to user's used device tokens (for backward compatibility)
userSchema.methods.addUsedDeviceToken = function(token) {
  return this.addUsedDeviceTokens([token]);
};

module.exports = mongoose.model('User', userSchema); 