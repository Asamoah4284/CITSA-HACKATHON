const { body, validationResult } = require('express-validator');

// Validation middleware for user registration
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('userType')
    .isIn(['customer', 'artisan'])
    .withMessage('User type must be either customer or artisan'),
  // Conditional validation for artisan fields
  body('businessName')
    .if(body('userType').equals('artisan'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters long'),
  body('businessCategory')
    .if(body('userType').equals('artisan'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Business category must be between 2 and 50 characters long'),
  body('businessDescription')
    .if(body('userType').equals('artisan'))
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Business description must be between 10 and 2000 characters long'),
  body('phone')
    .if(body('userType').equals('artisan'))
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters long'),
  body('country')
    .if(body('userType').equals('artisan'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters long'),
  body('city')
    .if(body('userType').equals('artisan'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters long'),
  body('website')
    .if(body('userType').equals('artisan'))
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL')
];

// Validation middleware for user login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for referrals
const referralValidation = [
  body('refereeEmail')
    .isEmail()
    .withMessage('Please provide a valid referee email address')
    .normalizeEmail(),
  body('artisanId')
    .isMongoId()
    .withMessage('Please provide a valid artisan ID')
];

// Validation middleware for generating referral links
const generateReferralLinkValidation = [
  body('artisanId')
    .isMongoId()
    .withMessage('Please provide a valid artisan ID')
];

// Validation middleware for claiming referral links
const claimReferralValidation = [
  body('referralCode')
    .isString()
    .trim()
    .isLength({ min: 8, max: 8 })
    .withMessage('Referral code must be exactly 8 characters long')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Referral code must contain only uppercase letters and numbers')
];

// Validation middleware for updating referral scores
const updateScoreValidation = [
  body('referralId')
    .isMongoId()
    .withMessage('Please provide a valid referral ID'),
  body('qualityScore')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Quality score must be a number between 0 and 10'),
  body('reasoning')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reasoning must be between 10 and 1000 characters long')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  referralValidation,
  generateReferralLinkValidation,
  claimReferralValidation,
  updateScoreValidation,
  handleValidationErrors
}; 