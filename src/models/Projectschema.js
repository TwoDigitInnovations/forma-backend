const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Information
  projectName: {
    type: String,
    trim: true
  },
  ProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
    trim: true
  },
  ProjectScope: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  projectType: {
    type: String,
    enum: ['Commercial', 'Residential', 'Industrial', 'Infrastructure'],
    default: 'Commercial'
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },

  // Contract Information
  contractAmount: {
    type: Number,
    min: 0
  },
  projectBudget: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  actualEndDate: {
    type: Date,
    default: null
  },

  // Stakeholder Information
  clientInfo: {
    contactAmount: {
      type: Number,
      min: 0
    },
    projectBudget: {
      type: Number,
      min: 0
    },
    clientLogo: {
      type: String,
      default: null
    }
  },

  contractorInfo: {
    contractorName: {
      type: String,

      trim: true
    },
    contractorAddress: {
      type: String,

      trim: true
    },
    contractorLogo: {
      type: String,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
});

projectSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;