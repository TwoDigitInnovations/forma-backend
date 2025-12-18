const PricingPlan = require('../models/PricingPlanSchema');
const response = require('../../responses');

const PricingPlanController = {
  createPlan: async (req, res) => {
    try {
      const {
        name,
        teamSize,
        projectLimit,
        priceMonthly,
        priceYearly,
        currency,
      } = req.body;

      const planExists = await PricingPlan.findOne({ name });
      if (planExists) {
        return response.badRequest(res, {
          message: 'Pricing plan already exists',
        });
      }

      const plan = await PricingPlan.create({
        name,
        teamSize,
        projectLimit,
        priceMonthly,
        priceYearly,
        currency,
      });

      return response.ok(res, {
        message: 'Pricing plan created successfully',
        data: plan,
      });
    } catch (error) {
      console.error('Create Plan Error:', error);
      return response.error(res, error.message || 'Something went wrong');
    }
  },

  updatePlan: async (req, res) => {
    try {
      const { id } = req.params;

      const plan = await PricingPlan.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!plan) {
        return response.notFound(res, {
          message: 'Pricing plan not found',
        });
      }

      return response.ok(res, {
        message: 'Pricing plan updated successfully',
        data: plan,
      });
    } catch (error) {
      console.error('Update Plan Error:', error);
      return response.error(res, error.message || 'Something went wrong');
    }
  },

  getPlanById: async (req, res) => {
    try {
      const { id } = req.params;

      const plan = await PricingPlan.findById(id);

      if (!plan) {
        return response.notFound(res, {
          message: 'Pricing plan not found',
        });
      }

      return response.ok(res, {
        data: plan,
      });
    } catch (error) {
      console.error('Get Plan Error:', error);
      return response.error(res, error.message || 'Something went wrong');
    }
  },

  getAllPlans: async (req, res) => {
    try {
      const plans = await PricingPlan.find({ isActive: true }).sort({
        priceMonthly: 1,
      }); 

      return response.ok(res, {
        message: 'Pricing plans fetched successfully',
        data: plans,
      });
    } catch (error) {
      console.error('Get All Plans Error:', error);
      return response.error(res, error.message || 'Something went wrong');
    }
  },
};

module.exports = PricingPlanController;
