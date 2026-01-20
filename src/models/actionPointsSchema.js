const mongoose = require("mongoose");

const actionPointsSchema = new mongoose.Schema(
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

    description: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In-Progress", "Completed"],
      default: "Open",
    },

    assignedTo: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

actionPointsSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const ActionPoints = mongoose.model("ActionPoints", actionPointsSchema);
module.exports = ActionPoints;
