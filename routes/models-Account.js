const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Account title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  townHall: {
    type: Number,
    required: [true, 'Town Hall level is required'],
    min: [1, 'Town Hall level must be at least 1'],
    max: [20, 'Town Hall level cannot be more than 20']
  },
  playerLevel: {
    type: Number,
    required: [true, 'Player level is required'],
    min: [1, 'Player level must be at least 1'],
    max: [500, 'Player level cannot be more than 500']
  },
  trophies: {
    type: Number,
    required: [true, 'Trophies are required'],
    min: [0, 'Trophies cannot be negative']
  },
  gems: {
    type: Number,
    required: [true, 'Gems are required'],
    min: [0, 'Gems cannot be negative']
  },
  builderCount: {
    type: Number,
    required: [true, 'Builder count is required'],
    min: [1, 'Builder count must be at least 1'],
    max: [6, 'Builder count cannot be more than 6']
  },
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['Max', 'Semi-Max', 'Rush', 'Strategic Rush', 'Starter']
  },
  priceInr: {
    type: Number,
    required: [true, 'Price in INR is required'],
    min: [100, 'Price must be at least ₹100']
  },
  priceUsd: {
    type: Number,
    required: [true, 'Price in USD is required'],
    min: [1, 'Price must be at least $1']
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  }],
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  sellerPhone: {
    type: String,
    required: [true, 'Seller phone is required'],
    match: [
      /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/,
      'Please enter a valid Indian phone number'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'sold', 'inactive'],
    default: 'pending'
  },
  features: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  inquiries: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  soldTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  soldAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
accountSchema.index({ townHall: 1 });
accountSchema.index({ accountType: 1 });
accountSchema.index({ priceInr: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ seller: 1 });
accountSchema.index({ createdAt: -1 });

// Virtual for commission calculation
accountSchema.virtual('commission').get(function() {
  const commissionRate = process.env.COMMISSION_RATE || 10;
  return Math.round(this.priceInr * (commissionRate / 100));
});

accountSchema.virtual('sellerReceives').get(function() {
  return this.priceInr - this.commission;
});

// Pre-save middleware to calculate USD price
accountSchema.pre('save', function(next) {
  if (this.isModified('priceInr') && !this.isModified('priceUsd')) {
    // Rough conversion rate (should be updated with real-time rates)
    this.priceUsd = Math.round(this.priceInr * 0.012);
  }
  next();
});

// Method to increment view count
accountSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to mark as sold
accountSchema.methods.markAsSold = function(buyerId) {
  this.status = 'sold';
  this.soldTo = buyerId;
  this.soldAt = new Date();
  return this.save();
};

// Static method to get popular accounts
accountSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ viewCount: -1 })
    .limit(limit)
    .populate('seller', 'name');
};

// Static method to get featured accounts
accountSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('seller', 'name');
};

module.exports = mongoose.model('Account', accountSchema);