const mongoose = require('mongoose');
const { object } = require('underscore');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    Organization: { type: String, required: true },
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
    },

    actions: {
      actionItemDescription: {
        type: String,
      },

      responsiblePerson: {
        type: String,
      },

      deadline: {
        type: Date,
      },

      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
      },
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
      required: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    membersPresent: [memberSchema],

    agendas: [agendaSchema],

    meetingDiscussions: { type: object },

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
