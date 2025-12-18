const mongoose = require("mongoose");

const pricingPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String, // Starter, Team, Pro
      required: true,
      unique: true,
    },

    teamSize: {
      type: Number,
      required: true,
    },

    projectLimit: {
      type: Number, // kitne projects create kar sakta hai
      required: true,
    },

    priceMonthly: {
      type: Number,
      required: true,
    },

    priceYearly: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingPlan", pricingPlanSchema);
