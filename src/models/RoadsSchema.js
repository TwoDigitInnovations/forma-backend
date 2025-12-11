'use client';

const mongoose = require('mongoose');
const { object } = require('underscore');

const RoadsSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Projects',
      required: true,
    },

    roadName: {
      type: String,
      required: true,
      trim: true,
    },
    lengthKm: {
      type: Number,
      required: true,
      min: 0,
    },

    roadType: {
      type: String,
      enum: ['Highway', 'Arterial Road', 'Collector Road', 'Local Road'],
      required: true,
    },

    carriageway: {
      type: String,
      enum: ['Single Carriageway', 'Double Carriageway'],
      default: 'Single Carriageway',
    },

    constructionLayers: [
      {
        name: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        QualityStatus: {
          type: String,
          enum: ['Approved', 'PendingReviews', 'RequiresRework'],
          default: 'Approved',
        },
        sides: [
          {
            side: {
              type: String,
              enum: ['Single', 'Left', 'Right'],
              required: true,
            },
            StartChainageKM: {
              type: Number,
            },
            EndChainageKM: {
              type: Number,
            },
            CompletionDate: {
              type: Date,
            },
            notes: {
              type: String,
            },
            history: [Object],
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

const Roads = mongoose.model('Roads', RoadsSchema);
module.exports = Roads;
