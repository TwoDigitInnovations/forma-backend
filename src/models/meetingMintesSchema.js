const mongoose = require('mongoose');
const { object } = require('underscore');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    Organization: { type: String },
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

    actions: [
      {
        actionItemDescription: {
          type: String,
        },

        responsiblePerson: {
          type: String,
        },

        deadline: {
          type: Date,
        },

        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High'],
          default: 'Medium',
        },

        status: {
          type: String,
          enum: ['Open', 'In-Progress', 'Completed'],
          default: 'Open',
        },
      },
    ],
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
