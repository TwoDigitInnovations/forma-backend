const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
  },
  { _id: false },
);

const agendaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. Review physical progress
    order: { type: Number },
  },
  { _id: false },
);

const actionRegistrySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectName: { type: String, required: true },

    actionItemDescription: {
      type: String,
      required: true,
    },

    responsiblePerson: {
      type: String,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

const meetingMinutesSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    meetingTitle: {
      type: String,
      required: true, // Project Review Meeting - 12/26/2025
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    membersPresent: [memberSchema],

    agendas: [agendaSchema],

    meetingDiscussions: {
      reviewPhysicalProgress: { type: String },
      budgetAlignment: { type: String },
    },

    projectActionRegistry: [actionRegistrySchema],

    status: {
      type: String,
      enum: ['draft', 'saved', 'synced'],
      default: 'draft',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('MeetingMinutes', meetingMinutesSchema);
