const mongoose = require('mongoose');

const AttendeeGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    attendees: [
      {
        name: String,
        designation: String,
        organization: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('AttendeeGroup', AttendeeGroupSchema);
