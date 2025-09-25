const mongoose = require('mongoose');

const boqItemSchema = new mongoose.Schema(
  {
    itemNo: { type: String, required: true }, 
    itemType: { type: String, enum: ['item', 'subitem'], default: 'item' },
    description: { type: String, required: true },
    quantity: { type: String },
    unit: { type: String },
    rate: { type: String },
    sortOrder: { type: Number, default: 1 },
  },
  { _id: true },
);

const boqSectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true },
    sectionId: { type: String }, 
    items: [boqItemSchema], 
  },
  { _id: true },
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
    },
  },
  { timestamps: true },
);

boqTemplateSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Template = mongoose.model('Template', boqTemplateSchema);
module.exports = Template;
