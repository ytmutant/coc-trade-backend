const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Clan name is required'],
    trim: true,
    maxlength: [50, 'Clan name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  level: {
    type: String,
    required: [true, 'Clan level is required'],
    enum: ['1-4', '5-9', '10-14', '15-19', '20-24', '25+']
  },
  members: {
    type: Number,
    required: [true, 'Member count is required'],
    min: [1, 'Member count must be at least 1'],
    max: [50, 'Member count cannot be more than 50']
  },
  warLeague: {
    type: String,
    required: [true, 'War league is required'],
    enum: [
      'Champion I', 'Champion II', 'Champion III',
      'Master I', 'Master II', 'Master III',
      'Crystal I', 'Crystal II', 'Crystal III',
      'Gold I', 'Gold II', 'Gold III',
      'Silver I', 'Silver II', 'Silver III',
      'Bronze I', 'Bronze II', 'Bronze III'
    ]
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
  },
  warWins: {
    type: Number,
    default: 0
  },
  warWinStreak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
clanSchema.index({ level: 1 });
clanSchema.index({ warLeague: 1 });
clanSchema.index({ priceInr: 1 });
clanSchema.index({ status: 1 });
clanSchema.index({ seller: 1 });
clanSchema.index({ createdAt: -1 });

// Virtual for commission calculation
clanSchema.virtual('commission').get(function() {
  const commissionRate = process.env.COMMISSION_RATE || 10;
  return Math.round(this.priceInr * (commissionRate / 100));
});

clanSchema.virtual('sellerReceives').get(function() {
  return this.priceInr - this.commission;
});

// Pre-save middleware to calculate USD price
clanSchema.pre('save', function(next) {
  if (this.isModified('priceInr') && !this.isModified('priceUsd')) {
    // Rough conversion rate (should be updated with real-time rates)
    this.priceUsd = Math.round(this.priceInr * 0.012);
  }
  next();
});

// Method to increment view count
clanSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to mark as sold
clanSchema.methods.markAsSold = function(buyerId) {
  this.status = 'sold';
  this.soldTo = buyerId;
  this.soldAt = new Date();
  return this.save();
};

// Static method to get popular clans
clanSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ viewCount: -1 })
    .limit(limit)
    .populate('seller', 'name');
};

// Static method to get featured clans
clanSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('seller', 'name');
};

module.exports = mongoose.model('Clan', clanSchema);