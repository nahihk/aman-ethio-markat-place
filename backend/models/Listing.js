const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['house', 'vehicle'],
    required: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: ['addis_ababa', 'tigray', 'amhara', 'oromia', 'harari', 'gambella', 'benishangul', 'afar', 'somali']
  },
  location: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    filename: String
  }],
  videos: [{
    url: String,
    filename: String
  }],
  features: {
    type: Map,
    of: String
  },
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'rejected'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedByAdmin: {
    type: Boolean,
    default: false
  },
  adminNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);
