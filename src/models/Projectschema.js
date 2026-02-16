const mongoose = require('mongoose');

const roundToTwo = (num) => {
  if (num === undefined || num === null) return num;
  return Number(parseFloat(num).toFixed(2));
};

const projectSchema = new mongoose.Schema(
  {
    // Basic Information
    projectName: {
      type: String,
      trim: true,
    },
    projectNo: {
      type: String,
    },
    OrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
    },
    programName: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    ProjectScope: {
      type: String,
      trim: true,
    },
    ExcuetiveSummary: {
      type: String,
      trim: true,
    },
    LocationSummary: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    projectType: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    contractAmount: {
      type: Number,
      min: 0,
      set: roundToTwo,
    },
    paidAmount: {
      type: Number,
      min: 0,
      set: roundToTwo,
    },
    projectBudget: {
      type: Number,
      min: 0,
      set: roundToTwo,
    },
    advancePayment: {
      type: Number,
      min: 0,
      set: roundToTwo,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    Duration: {
      type: String,
    },
    LiabilityPeriod: {
      type: String,
    },
    actualEndDate: {
      type: Date,
      default: null,
    },
    actualProgress: {
      type: Number,
      default: 0,
    },
    certificates: [
      {
        certificateNo: String,
        amount: Number,
        date: Date,
        status: {
          type: String,
          enum: ['Submitted', 'In-Process', 'Paid'],
          default: 'Submitted',
        },
      },
    ],

    clientInfo: {
      ClientName: { type: String, trim: true },
      Email: { type: String, trim: true },
      phone: { type: String, trim: true },
      contactPerson: { type: String, trim: true },
      Address: { type: String, trim: true },
      ClientLogo: { type: String, default: null },
      teamMembers: [],
    },

    contractorInfo: {
      contractorName: { type: String, trim: true },
      Email: { type: String, trim: true },
      phone: { type: String, trim: true },
      contactPerson: { type: String, trim: true },
      contractorLogo: { type: String, default: null },
      teamMembers: [],
      equipment: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    assignedMembers: [
      {
        memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actionType: {
          type: String,
          enum: ['view', 'edit', 'both'],
          default: 'view',
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Remove __v before sending response
projectSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
