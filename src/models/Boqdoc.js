
const mongoose = require('mongoose');

const boqSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  source: { type: String, enum: ["scratch", "template"], required: true },
  items: [
    {
      itemName: { type: String, required: true },
      unit: { type: String },
      quantity: { type: Number, required: true },
      rate: { type: Number, required: true },
      amount: { type: Number }
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

boqSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const BOQ = mongoose.model('BOQ', boqSchema);

module.exports = BOQ;