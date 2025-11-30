const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Rejected", "Expired"],
      default: "Pending",
    },

    responsibleParty: {
      type: String,
      trim: true,
      default: "",
    },

    deadline: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);


const checklist = mongoose.model('ChecklistItem', checklistItemSchema);
module.exports = checklist;