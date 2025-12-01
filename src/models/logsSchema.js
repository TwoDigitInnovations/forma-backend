const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Projects",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // "01-12-2025" format
      required: true,
    },

    weather: {
      type: String,
      default: "",
    },

    workSummary: {
      type: String,
      default: "",
    },

    issues: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// remove __v
logsSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const DailyLogs = mongoose.model("DailyLogs", logsSchema);
module.exports = DailyLogs;
