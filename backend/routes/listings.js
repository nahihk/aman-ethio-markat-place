const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all listings (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, region, type, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    
    let filter = { status: 'active', approvedByAdmin: true };
    
    if (category) filter.category = category;
    if (region) filter.region = region;
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    const listings = await Listing.find(filter)
      .populate('createdBy', 'name phone region')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Listing.countDocuments(filter);
    
    res.json({
      listings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('createdBy', 'name phone region');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
});

// Create new listing (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const listingData = {
      ...req.body,
      createdBy: req.user.id,
      contactInfo: {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      }
    };
    
    const listing = new Listing(listingData);
    await listing.save();
    
    res.status(201).json({ 
      message: 'Listing created successfully. It will be visible after admin approval.',
      listing 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating listing', error: error.message });
  }
});

// Admin routes for listing management
router.patch('/:id/approve', adminAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { approvedByAdmin: true, status: 'active', adminNotes: req.body.notes },
      { new: true }
    );
    
    res.json({ message: 'Listing approved', listing });
  } catch (error) {
    res.status(500).json({ message: 'Error approving listing', error: error.message });
  }
});

router.patch('/:id/reject', adminAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { approvedByAdmin: false, status: 'rejected', adminNotes: req.body.notes },
      { new: true }
    );
    
    res.json({ message: 'Listing rejected', listing });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting listing', error: error.message });
  }
});

module.exports = router;
