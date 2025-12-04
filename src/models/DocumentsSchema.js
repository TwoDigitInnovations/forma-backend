const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "monthly-progress-report",
        "taking-over-certificate",
        "commencement-order",
        "instruction-letter",
        "meeting-minutes",
      ],
      required: true,
    },

    name: { type: String, required: true },

    data: {
      type: Object,   
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

documentSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Documents = mongoose.model("Document", documentSchema);

module.exports = Documents;