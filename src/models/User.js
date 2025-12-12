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
      enum: ['User', 'Organization', 'TeamsMember', 'Admin'], // Define user roles
      default: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'suspend'], // Define user roles
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
    OrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedProjects: [
      {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        actionType: { type: String, enum: ['view', 'edit', 'both'] },
      },
    ],
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
