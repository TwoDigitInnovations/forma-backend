const mongoose = require("mongoose");

const boqItemSchema = new mongoose.Schema(
  {
    itemNo: { type: String, required: true }, // Will store numbering like "1.0", "1.1"
    itemType: { type: String, enum: ["item", "subitem"], default: "item" },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    unit: { type: String, required: true },
    rate: { type: String, required: true },
    sortOrder: { type: Number, default: 1 },
  },
  { _id: true }
);

const boqSectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true },
    sectionId: { type: String }, // optional if you want custom id
    items: [boqItemSchema], // items grouped under this section
  },
  { _id: true }
);

const boqTemplateSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    categoryName: { type: String, required: true },
    categoryId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
    sections: [boqSectionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

boqTemplateSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Template = mongoose.model("Template", boqTemplateSchema);
module.exports = Template;
