const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Artisan = require('../models/Artisan');
const { auth } = require('../middleware/auth');
const { referralValidation, handleValidationErrors, generateReferralLinkValidation, claimReferralValidation } = require('../middleware/validation');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// POST /app/referrals - Create a new referral
router.post('/referrals', auth, referralValidation, handleValidationErrors, async (req, res) => {
  try {
    const { refereeEmail, artisanId } = req.body;
    const referrerId = req.user._id;

    // Check if referee exists
    const referee = await User.findOne({ email: refereeEmail });
    if (!referee) {
      return res.status(404).json({
        error: 'Referee not found. Please ensure the email is correct.'
      });
    }

    // Check if referee is the same as referrer
    if (referee._id.toString() === referrerId.toString()) {
      return res.status(400).json({
        error: 'You cannot refer yourself'
      });
    }

    // Check if artisan exists
    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return res.status(404).json({
        error: 'Artisan not found'
      });
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referrer: referrerId,
      referee: referee._id,
      artisan: artisanId
    });

    if (existingReferral) {
      return res.status(400).json({
        error: 'Referral already exists for this user and artisan'
      });
    }

    // Create new referral
    const referral = new Referral({
      referrer: referrerId,
      referee: referee._id,
      artisan: artisanId,
      status: 'pending'
    });

    await referral.save();

    // Award base points to referrer
    await referral.awardBasePoints();
    await req.user.addPoints(referral.basePointsAwarded);

    // Make async call to Langflow webhook
    if (process.env.LANGFLOW_WEBHOOK_URL) {
      try {
        await axios.post(process.env.LANGFLOW_WEBHOOK_URL, {
          referral_id: referral._id,
          referrer_email: req.user.email,
          referee_email: refereeEmail,
          artisan_name: artisan.name,
          artisan_specialty: artisan.specialty,
          artisan_location: artisan.location
        }, {
          timeout: 5000 // 5 second timeout
        });
        console.log('Langflow webhook called successfully for referral:', referral._id);
      } catch (webhookError) {
        console.error('Langflow webhook error:', webhookError.message);
        // Don't fail the request if webhook fails
      }
    }

    res.status(201).json({
      message: 'Referral created successfully',
      referral: {
        id: referral._id,
        referralCode: referral.referralCode,
        status: referral.status,
        basePointsAwarded: referral.basePointsAwarded,
        totalPointsAwarded: referral.totalPointsAwarded,
        createdAt: referral.createdAt
      },
      referee: {
        id: referee._id,
        name: referee.name,
        email: referee.email
      },
      artisan: {
        id: artisan._id,
        name: artisan.name,
        specialty: artisan.specialty
      }
    });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({
      error: 'Failed to create referral',
      message: error.message
    });
  }
});

// GET /app/dashboard - Get user info and referrals
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Validate that user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'User not authenticated',
        message: 'Please log in to access your dashboard'
      });
    }

    const userId = req.user._id;
    console.log('Dashboard request for user:', userId);

    // Get user's referrals with populated data
    const referrals = await Referral.find({ referrer: userId })
      .populate('referee', 'name email')
      .populate('artisan', 'name specialty location imageUrl')
      .sort({ createdAt: -1 });

    console.log('Found referrals:', referrals.length);

    // Filter out referrals with missing artisans
    const validReferrals = referrals.filter(r => r.artisan && r.artisan._id);
    console.log('Valid referrals:', validReferrals.length);

    // Group referrals by referral code to show all people who used each link
    const groupedReferrals = validReferrals.reduce((acc, referral) => {
      const key = referral.referralCode;
      if (!acc[key]) {
        acc[key] = {
          referralCode: key,
          artisan: referral.artisan,
          claims: [],
          totalPoints: 0,
          createdAt: referral.createdAt
        };
      }
      // Always push the referral, even if referee is null (unclaimed link)
      acc[key].claims.push(referral.referee ? {
        id: referral._id,
        referee: referral.referee,
        status: referral.status,
        basePointsAwarded: referral.basePointsAwarded,
        bonusPointsAwarded: referral.bonusPointsAwarded,
        totalPointsAwarded: referral.totalPointsAwarded,
        qualityScore: referral.qualityScore,
        reasoning: referral.reasoning,
        claimTimestamp: referral.claimTimestamp,
        createdAt: referral.createdAt
      } : {
        id: referral._id,
        referee: null,
        status: referral.status,
        basePointsAwarded: referral.basePointsAwarded,
        bonusPointsAwarded: referral.bonusPointsAwarded,
        totalPointsAwarded: referral.totalPointsAwarded,
        qualityScore: referral.qualityScore,
        reasoning: referral.reasoning,
        claimTimestamp: referral.claimTimestamp,
        createdAt: referral.createdAt
      });
      if (referral.referee) {
        acc[key].totalPoints += referral.totalPointsAwarded;
      }
      return acc;
    }, {});

    // Convert to array and sort by total points
    const referralGroups = Object.values(groupedReferrals).sort((a, b) => b.totalPoints - a.totalPoints);

    // Filter out referralGroups with missing or undefined artisan
    const safeReferralGroups = referralGroups.filter(group => group.artisan && group.artisan._id);

    // Get user's orders with product and artisan details
    const orders = await Order.find({ userId: userId.toString() }).sort({ createdAt: -1 });
    console.log('Found orders:', orders.length);
    
    // For each order, populate product and artisan info
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      try {
        // Each order.items is an array of { productId, quantity, ... }
        const detailedItems = await Promise.all((order.items || []).map(async (item) => {
          try {
            const product = await Product.findById(item.productId).populate('artisan', 'name specialty imageUrl');
            return {
              ...item,
              product: product ? {
                _id: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                artisan: product.artisan ? {
                  _id: product.artisan._id,
                  name: product.artisan.name,
                  specialty: product.artisan.specialty,
                  imageUrl: product.artisan.imageUrl
                } : null
              } : null
            };
          } catch (itemError) {
            console.error('Error processing order item:', itemError);
            return {
              ...item,
              product: null
            };
          }
        }));
        return {
          _id: order._id,
          total: order.total,
          reference: order.reference,
          createdAt: order.createdAt,
          items: detailedItems
        };
      } catch (orderError) {
        console.error('Error processing order:', orderError);
        return {
          _id: order._id,
          total: order.total,
          reference: order.reference,
          createdAt: order.createdAt,
          items: []
        };
      }
    }));

    // Get leaderboard data for each artisan
    const leaderboardData = await Promise.all(
      safeReferralGroups.map(async (group) => {
        try {
          const artisanId = group.artisan._id;
          
          // Get top patrons for this artisan
          const topPatrons = await Referral.aggregate([
            { $match: { artisan: artisanId, status: { $in: ['active', 'completed'] } } },
            {
              $group: {
                _id: '$referrer',
                totalPoints: { $sum: '$totalPointsAwarded' },
                referralCount: { $sum: 1 }
              }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: '$user' },
            {
              $project: {
                name: '$user.name',
                email: '$user.email',
                totalPoints: 1,
                referralCount: 1
              }
            }
          ]);

          return {
            artisanId: artisanId,
            artisanName: group.artisan.name,
            topPatrons: topPatrons
          };
        } catch (leaderboardError) {
          console.error('Error processing leaderboard for artisan:', group.artisan._id, leaderboardError);
          return {
            artisanId: group.artisan._id,
            artisanName: group.artisan.name,
            topPatrons: []
          };
        }
      })
    );

    // Calculate user's position in each artisan's leaderboard
    const userLeaderboardPositions = await Promise.all(
      safeReferralGroups.map(async (group) => {
        try {
          const artisanId = group.artisan._id;
          
          const userPosition = await Referral.aggregate([
            { $match: { artisan: artisanId, status: { $in: ['active', 'completed'] } } },
            {
              $group: {
                _id: '$referrer',
                totalPoints: { $sum: '$totalPointsAwarded' }
              }
            },
            { $sort: { totalPoints: -1 } },
            {
              $group: {
                _id: null,
                positions: { $push: '$_id' }
              }
            },
            {
              $project: {
                position: {
                  $add: [
                    { $indexOfArray: ['$positions', userId] },
                    1
                  ]
                }
              }
            }
          ]);

          return {
            artisanId: artisanId,
            artisanName: group.artisan.name,
            position: userPosition[0]?.position || 0
          };
        } catch (positionError) {
          console.error('Error calculating user position for artisan:', group.artisan._id, positionError);
          return {
            artisanId: group.artisan._id,
            artisanName: group.artisan.name,
            position: 0
          };
        }
      })
    );

    console.log('Dashboard response prepared successfully');

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        points: req.user.points,
        totalReferrals: validReferrals.filter(r => r.referee).length,
        totalReferralLinks: referralGroups.length
      },
      referralGroups: referralGroups,
      orders: ordersWithDetails,
      leaderboards: leaderboardData,
      userPositions: userLeaderboardPositions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

router.get('/referrals', auth, async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Unauthorized. User not authenticated.'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user._id;

    const query = { referrer: userId };
    if (status) {
      query.status = status;
    }

    const numericLimit = parseInt(limit);
    const numericPage = parseInt(page);

    const referrals = await Referral.find(query)
      .populate('referee', 'name email')
      .populate('artisan', 'name specialty location imageUrl')
      .limit(numericLimit)
      .skip((numericPage - 1) * numericLimit)
      .sort({ createdAt: -1 });

    const total = await Referral.countDocuments(query);

    res.json({
      referrals: referrals.map(referral => ({
        id: referral._id,
        referralCode: referral.referralCode,
        status: referral.status,
        referee: referral.referee,
        artisan: referral.artisan,
        basePointsAwarded: referral.basePointsAwarded,
        bonusPointsAwarded: referral.bonusPointsAwarded,
        totalPointsAwarded: referral.totalPointsAwarded,
        qualityScore: referral.qualityScore,
        reasoning: referral.reasoning,
        createdAt: referral.createdAt
      })),
      pagination: {
        currentPage: numericPage,
        totalPages: Math.ceil(total / numericLimit),
        totalReferrals: total,
        hasNextPage: numericPage * numericLimit < total,
        hasPrevPage: numericPage > 1
      }
    });

  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      error: 'Failed to fetch referrals',
      message: error.message
    });
  }
});

// POST /orders - Save a new order
router.post('/orders', async (req, res) => {
  console.log('=== ORDER CREATION DEBUG ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.originalUrl);
  
  try {
    const { userId, items, total, reference } = req.body;
    
    console.log('Extracted data:');
    console.log('  - userId:', userId, typeof userId);
    console.log('  - items:', items, typeof items);
    console.log('  - total:', total, typeof total);
    console.log('  - reference:', reference, typeof reference);
    
    // Validate required fields
    if (!userId) {
      console.error('❌ Missing userId');
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!items || !Array.isArray(items)) {
      console.error('❌ Missing or invalid items array');
      return res.status(400).json({ error: 'items array is required' });
    }
    if (!total || typeof total !== 'number') {
      console.error('❌ Missing or invalid total');
      return res.status(400).json({ error: 'total number is required' });
    }
    if (!reference) {
      console.error('❌ Missing reference');
      return res.status(400).json({ error: 'reference is required' });
    }
    
    console.log('✅ All required fields present');
    
    const order = new Order({ userId, items, total, reference, createdAt: new Date() });
    console.log('📋 Order object created:', order);
    
    console.log('💾 Attempting to save order to database...');
    const savedOrder = await order.save();
    console.log('✅ Order saved successfully:', savedOrder);
    
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('💥 Order creation error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to save order', details: err.message });
  }
});

// GET /orders - Get all orders for a user
router.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /app/generate-referral-link - Generate a referral link for sharing
router.post('/generate-referral-link', auth, generateReferralLinkValidation, handleValidationErrors, async (req, res) => {
  try {
    const { artisanId } = req.body;
    const referrerId = req.user._id;

    console.log("=== REFERRAL GENERATION DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Artisan ID received:", artisanId, typeof artisanId);
    console.log("Referrer ID:", referrerId, typeof referrerId);

    // Check if artisan exists
    const artisan = await Artisan.findById(artisanId);
    console.log("Artisan lookup result:", artisan);
    
    if (!artisan) {
      console.log("Artisan not found for ID:", artisanId);
      // Let's also check if there are any artisans in the database
      const allArtisans = await Artisan.find({}).select('_id name');
      console.log("All artisans in database:", allArtisans);
      
      return res.status(404).json({
        error: 'Artisan not found',
        debug: {
          requestedId: artisanId,
          availableArtisans: allArtisans.map(a => ({ id: a._id, name: a.name }))
        }
      });
    }

    console.log("Artisan found:", artisan.name, artisan._id);

    // Check if user has already generated a referral link for this artisan
    const existingReferral = await Referral.findOne({
      referrer: referrerId,
      artisan: artisanId,
      referee: null // Only check unclaimed links
    });

    console.log("Existing referral check:", existingReferral);

    if (existingReferral) {
      return res.status(400).json({
        error: 'You have already generated a referral link for this artisan',
        referral: {
          id: existingReferral._id,
          referralCode: existingReferral.referralCode,
          status: existingReferral.status,
          createdAt: existingReferral.createdAt
        }
      });
    }

    // Generate a unique referral code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let referralCode;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = generateCode();
      const existingReferral = await Referral.findOne({ referralCode });
      if (!existingReferral) {
        isUnique = true;
      }
    }

    // Create a referral record with a placeholder referee (null for now)
    const referral = new Referral({
      referrer: referrerId,
      referee: null, // Will be set when someone uses the link
      artisan: artisanId,
      status: 'pending',
      referralCode: referralCode
    });

    await referral.save();

    res.status(201).json({
      message: 'Referral link generated successfully',
      referral: {
        id: referral._id,
        referralCode: referral.referralCode,
        status: referral.status,
        createdAt: referral.createdAt
      },
      artisan: {
        id: artisan._id,
        name: artisan.name,
        specialty: artisan.specialty
      }
    });
  } catch (error) {
    console.error('Generate referral link error:', error);
    res.status(500).json({
      error: 'Failed to generate referral link',
      message: error.message
    });
  }
});

// POST /app/claim-referral - Claim a referral link
router.post('/claim-referral', auth, claimReferralValidation, handleValidationErrors, async (req, res) => {
  try {
    const { referralCode, fingerprint } = req.body;
    const refereeId = req.user._id;

    // Get IP address and user agent for security tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    // Find the referral by code
    const referral = await Referral.findOne({ referralCode });
    if (!referral) {
      return res.status(404).json({
        error: 'Referral link not found'
      });
    }

    // Check if user is trying to claim their own referral
    if (referral.referrer.toString() === refereeId.toString()) {
      return res.status(400).json({
        error: 'You cannot claim your own referral link'
      });
    }

    // Check if this specific user has already claimed this referral link
    const existingClaim = await Referral.findOne({
      referralCode: referralCode,
      referee: refereeId
    });

    if (existingClaim) {
      return res.status(400).json({
        error: 'You have already used this referral link'
      });
    }

    // Check if user has already claimed a referral for this artisan (prevent multiple claims per artisan)
    const existingArtisanClaim = await Referral.findOne({
      referee: refereeId,
      artisan: referral.artisan,
      status: { $in: ['pending', 'active', 'completed'] }
    });

    if (existingArtisanClaim) {
      return res.status(400).json({
        error: 'You have already claimed a referral link for this artisan'
      });
    }

    // NEW: Check if referrer has already referred 5 unique people
    const referrerReferralCount = await Referral.countDocuments({
      referrer: referral.referrer,
      status: { $in: ['active', 'completed'] }
    });
    if (referrerReferralCount >= 5) {
      return res.status(400).json({
        error: 'This user has already referred the maximum number of people (5)'
      });
    }

    // Additional security check: Check for multiple claims from same IP in short time
    const recentClaimsFromIP = await Referral.countDocuments({
      claimIpAddress: ipAddress,
      claimTimestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentClaimsFromIP >= 10) { // Increased limit since multiple people can use same link
      return res.status(429).json({
        error: 'Too many referral claims from this IP address. Please try again later.'
      });
    }

    // Create a new referral record for this specific claim
    const newReferral = new Referral({
      referrer: referral.referrer, // Same referrer as the original link
      referee: refereeId,
      artisan: referral.artisan,
      status: 'active',
      referralCode: referralCode, // Same referral code
      claimIpAddress: ipAddress,
      claimUserAgent: userAgent,
      claimTimestamp: new Date(),
      fingerprint: fingerprint || null // Store browser fingerprint
    });

    await newReferral.save();

    // Award base points to referrer
    await newReferral.awardBasePoints();
    
    // Get the referrer user to update their points
    const referrer = await User.findById(referral.referrer);
    if (referrer) {
      await referrer.addPoints(newReferral.basePointsAwarded);
    }

    // Make async call to Langflow webhook
    if (process.env.LANGFLOW_WEBHOOK_URL) {
      try {
        const artisan = await Artisan.findById(referral.artisan);
        await axios.post(process.env.LANGFLOW_WEBHOOK_URL, {
          referral_id: newReferral._id,
          referrer_email: referrer.email,
          referee_email: req.user.email,
          artisan_name: artisan.name,
          artisan_specialty: artisan.specialty,
          artisan_location: artisan.location
        }, {
          timeout: 5000 // 5 second timeout
        });
        console.log('Langflow webhook called successfully for referral:', newReferral._id);
      } catch (webhookError) {
        console.error('Langflow webhook error:', webhookError.message);
        // Don't fail the request if webhook fails
      }
    }

    res.json({
      message: 'Referral claimed successfully',
      referral: {
        id: newReferral._id,
        referralCode: newReferral.referralCode,
        status: newReferral.status,
        basePointsAwarded: newReferral.basePointsAwarded,
        totalPointsAwarded: newReferral.totalPointsAwarded,
        createdAt: newReferral.createdAt
      },
      referrer: {
        id: referrer._id,
        name: referrer.name,
        email: referrer.email
      },
      artisan: {
        id: referral.artisan,
        name: artisan.name,
        specialty: artisan.specialty
      }
    });
  } catch (error) {
    console.error('Claim referral error:', error);
    res.status(500).json({
      error: 'Failed to claim referral',
      message: error.message
    });
  }
});

// GET /app/my-referral-links - Get user's existing referral links
router.get('/my-referral-links', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's referral links (both claimed and unclaimed)
    const referrals = await Referral.find({ referrer: userId })
      .populate('artisan', 'name specialty location imageUrl')
      .populate('referee', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      referrals: referrals.map(referral => ({
        id: referral._id,
        referralCode: referral.referralCode,
        status: referral.status,
        referee: referral.referee, // null if unclaimed
        artisan: referral.artisan,
        basePointsAwarded: referral.basePointsAwarded,
        bonusPointsAwarded: referral.bonusPointsAwarded,
        totalPointsAwarded: referral.totalPointsAwarded,
        qualityScore: referral.qualityScore,
        reasoning: referral.reasoning,
        createdAt: referral.createdAt,
        updatedAt: referral.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get my referral links error:', error);
    res.status(500).json({
      error: 'Failed to fetch referral links',
      message: error.message
    });
  }
});

module.exports = router; 