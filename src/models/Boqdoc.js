const mongoose = require("mongoose");

const boqSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    boqName: {
      type: String,
      required: true, // usually BOQ ka naam zaroori hota hai
      trim: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currency: { type: String, default: "USD" },
    quantity: {
      type: Number,
      default: 1,
    },
    rate: {
      type: Number,
    },
    items: [
      {
        itemNo: { type: String },
        description: { type: String },
        unit: { type: String },
        quantity: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        rowType: { type: String},
        amount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

boqSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const BOQ = mongoose.model("BOQ", boqSchema);

module.exports = BOQ;
