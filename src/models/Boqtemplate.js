const mongoose = require("mongoose");

const boqItemSchema = new mongoose.Schema(
  {
    itemNo: { type: String,  },
    description: { type: String, required: true },
    quantity: { type: String },
    unit: { type: String },
    rate: { type: String },
    rowType: { type: String },
  },
  { _id: true }
);

const boqSubSectionSchema = new mongoose.Schema(
  {
    subSectionName: { type: String, required: true },
    subSectionId: { type: String },
    items: [boqItemSchema], 
  },
  { _id: true }
);

const boqSectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String },
    sectionId: { type: String },
    description: { type: String },
    items: [boqItemSchema], 
    subSections: [boqSubSectionSchema], 
  },
  { _id: true }
);

const boqTemplateSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    categoryName: { type: String, required: true },
    categoryId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    sections: [boqSectionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
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
