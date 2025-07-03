const express = require('express');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');

const router = express.Router();

// GET /public/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('artisan', 'name story imageUrl location specialty');
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        description: product.description,
        category: product.category,
        isAvailable: product.isAvailable,
        stockQuantity: product.stockQuantity,
        artisan: product.artisan
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// GET /public/artisans/:id
router.get('/artisans/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('products', 'name price imageUrl description category isAvailable')
      .select('-__v');

    if (!artisan) {
      return res.status(404).json({
        error: 'Artisan not found'
      });
    }

    res.json({
      artisan: {
        id: artisan._id,
        name: artisan.name,
        story: artisan.story,
        imageUrl: artisan.imageUrl,
        location: artisan.location,
        specialty: artisan.specialty,
        isActive: artisan.isActive,
        productCount: artisan.productCount,
        products: artisan.products
      }
    });
  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({
      error: 'Failed to fetch artisan',
      message: error.message
    });
  }
});

// GET /public/artisans - List all artisans
router.get('/artisans', async (req, res) => {
  try {
    const { page = 1, limit = 10, specialty, location } = req.query;
    
    const query = { isActive: true };
    
    if (specialty) {
      query.specialty = new RegExp(specialty, 'i');
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const artisans = await Artisan.find(query)
      .populate('products', 'name price imageUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .sort({ createdAt: -1 });

    const total = await Artisan.countDocuments(query);

    res.json({
      artisans: artisans.map(artisan => ({
        id: artisan._id,
        name: artisan.name,
        story: artisan.story,
        imageUrl: artisan.imageUrl,
        location: artisan.location,
        specialty: artisan.specialty,
        productCount: artisan.productCount,
        products: artisan.products.slice(0, 3) // Show only first 3 products
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalArtisans: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({
      error: 'Failed to fetch artisans',
      message: error.message
    });
  }
});

// GET /public/products - List all products
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, artisanId, minPrice, maxPrice } = req.query;
    
    const query = { isAvailable: true };
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (artisanId) {
      query.artisan = artisanId;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('artisan', 'name location specialty')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        description: product.description,
        category: product.category,
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable,
        artisan: product.artisan
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

module.exports = router; 