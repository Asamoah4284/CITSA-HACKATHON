const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referrer is required']
  },
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: [true, 'Artisan is required']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  initialPurchaseValue: {
    type: Number,
    default: 0,
    min: [0, 'Purchase value cannot be negative']
  },
  qualityScore: {
    type: Number,
    min: [0, 'Quality score cannot be negative'],
    max: [100, 'Quality score cannot exceed 100'],
    default: null
  },
  reasoning: {
    type: String,
    maxlength: [1000, 'Reasoning cannot exceed 1000 characters'],
    default: null
  },
  basePointsAwarded: {
    type: Number,
    default: 0
  },
  bonusPointsAwarded: {
    type: Number,
    default: 0
  },
  totalPointsAwarded: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  // Link type: 'personal' (one-time use) or 'promotional' (multiple use)
  linkType: {
    type: String,
    enum: ['personal', 'promotional'],
    default: 'personal'
  },
  // For promotional links, track multiple claims
  claims: [{
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    claimIpAddress: String,
    claimUserAgent: String,
    claimTimestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Security tracking fields
  claimIpAddress: {
    type: String,
    default: null
  },
  claimUserAgent: {
    type: String,
    default: null
  },
  claimTimestamp: {
    type: Date,
    default: null
  },
  fingerprint: {
    type: String,
    default: null
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

// Generate unique referral code
referralSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let code;
    let isUnique = false;
    
    while (!isUnique) {
      code = generateCode();
      const existingReferral = await this.constructor.findOne({ referralCode: code });
      if (!existingReferral) {
        isUnique = true;
      }
    }
    
    this.referralCode = code;
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate total points
referralSchema.methods.calculateTotalPoints = function() {
  this.totalPointsAwarded = this.basePointsAwarded + this.bonusPointsAwarded;
  return this.totalPointsAwarded;
};

// Award base points
referralSchema.methods.awardBasePoints = function() {
  const basePoints = parseInt(process.env.BASE_REFERRAL_POINTS) || 10;
  this.basePointsAwarded = basePoints;
  this.calculateTotalPoints();
  return this.save();
};

// Award bonus points
referralSchema.methods.awardBonusPoints = function(qualityScore) {
  if (qualityScore && qualityScore > 0) {
    const multiplier = parseInt(process.env.BONUS_POINTS_MULTIPLIER) || 2;
    this.bonusPointsAwarded = Math.floor(qualityScore * multiplier);
    this.calculateTotalPoints();
  }
  return this.save();
};

// Indexes for better query performance
referralSchema.index({ referrer: 1, artisan: 1 });
referralSchema.index({ referee: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ referralCode: 1 });

module.exports = mongoose.model('Referral', referralSchema); 