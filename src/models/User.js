'use Client';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ['User', 'Organization', 'TeamsMember', 'Admin'],
      default: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'suspend'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    billingType: {
      type: String,
      enum: ['annually', 'monthly'],
    },
    teamSize: {
      trype: String,
    },
    organizationName: {
      type: String,
    },
    OrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlan',
      },

      planName: String,

      status: {
        type: String,
        enum: ['trial', 'active', 'expired', 'cancelled'],
        default: 'trial',
      },

      billingType: {
        type: String,
        enum: ['monthly', 'annually'],
      },

      teamSize: Number,

      planStartDate: Date,
      planEndDate: Date,

      autoRenew: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

userSchema.methods.isPasswordMatch = async function (password) {
  return password === this.password;
};

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const User = mongoose.model('User', userSchema);

module.exports = User;
