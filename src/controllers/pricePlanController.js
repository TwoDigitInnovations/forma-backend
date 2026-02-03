const PricingPlan = require('../models/PricingPlanSchema');
const Payment = require('../models/PaymentSchema');
const User = require('@models/User');
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
      const id = req.params?.editId;

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
      const { planId } = req.params;

      const plan = await PricingPlan.findById(planId);

      if (!plan) {
        return response.notFound(res, {
          message: 'Pricing plan not found',
        });
      }

      return response.ok(res, plan);
    } catch (error) {
      console.error('Get Plan Error:', error);
      return response.error(res, error.message || 'Something went wrong');
    }
  },

  deletePlan: async (req, res) => {
    try {
      const { planId } = req.params;

      const plan = await PricingPlan.findByIdAndDelete(planId);

      if (!plan) {
        return response.notFound(res, {
          message: 'Pricing plan not found',
        });
      }

      return response.ok(res, { message: 'deleted sucessfully', PricingPlan });
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

  buyPlan: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        planId,
        billingType,
        teamSize,
        paymentMethod,
        transactionId,
        role,
      } = req.body;

      if (!planId || !billingType || !teamSize) {
        return response.error(res, { message: 'Required fields missing' });
      }

      const user = await User.findById(userId).select('subscription');
      if (!user) {
        return response.error(res, { message: 'User not found' });
      }

      if (user.subscription && user.subscription.status === 'active') {
        const isExpired =
          !user.subscription.planEndDate ||
          new Date(user.subscription.planEndDate) <= new Date();

        if (!isExpired) {
          return response.error(res, {
            message: 'You already have an active subscription',
          });
        }

      }

      const plan = await PricingPlan.findById(planId);
      if (!plan || !plan.isActive) {
        return response.error(res, { message: 'Plan not available' });
      }

      let amount = 0;
      if (billingType === 'monthly') {
        amount = plan.priceMonthly * teamSize;
      } else if (billingType === 'annually') {
        amount = plan.priceYearly * teamSize;
      } else {
        return response.error(res, { message: 'Invalid billing type' });
      }

      const planStartDate = new Date();
      const planEndDate = new Date();

      if (billingType === 'monthly') {
        planEndDate.setMonth(planEndDate.getMonth() + 1);
      } else {
        planEndDate.setFullYear(planEndDate.getFullYear() + 1);
      }

      const payment = await Payment.create({
        userId,
        planId,
        amount,
        currency: plan.currency,
        billingType,
        paymentMethod,
        paymentStatus: 'success',
        transactionId: transactionId || `DEMO_${Date.now()}`,
        paidAt: new Date(),
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscription: {
            planId: plan._id,
            planName: plan.name,
            status: 'active',
            billingType,
            teamSize,
            planStartDate,
            planEndDate,
            autoRenew: false,
          },
          ...(role && { role }),
        },
        {
          new: true,
          runValidators: true,
        },
      );

      return response.ok(res, {
        message: 'Subscription updated successfully',
        user: updatedUser,
        payment: payment,
      });
    } catch (error) {
      console.error('Buy Plan Error:', error);
      return response.error(res, error.message || 'Failed to buy plan');
    }
  },
};

module.exports = PricingPlanController;
