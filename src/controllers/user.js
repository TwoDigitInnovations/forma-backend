const response = require('../../responses');
const User = require('@models/User');
const PaymentHistory = require('../models/PaymentSchema');
const PricePlan = require('../models/PricingPlanSchema');

module.exports = {
  fileUpload: async (req, res) => {
    try {
      if (!req.file) {
        return response.badRequest(res, { message: 'No file uploaded.' });
      }
      console.log(req.file);
      return response.ok(res, {
        message: 'File uploaded successfully.',
        fileUrl: req.file.path, // Cloudinary file URL
        fileName: req.file.filename, // public ID
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getRecentPayments: async (req, res) => {
    try {
      const payments = await PaymentHistory.find({ paymentStatus: 'success' })
        .populate('userId', 'name')
        .populate('planId', 'name')
        .sort({ createdAt: -1 });

      const data = payments.map((p, index) => ({
        id: index + 1,
        user: p.userId?.name,
        plan: p.planId?.name,
        amount: p.amount,
        date: p.createdAt.toISOString().split('T')[0],
      }));

      return response.ok(res, { status: true, data });
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  getMonthlyRevenue: async (req, res) => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

      const data = await Promise.all(
        months.map(async (month, index) => {
          const start = new Date(new Date().getFullYear(), index, 1);
          const end = new Date(new Date().getFullYear(), index + 1, 0);

          const revenue = await PaymentHistory.aggregate([
            {
              $match: {
                status: 'SUCCESS',
                createdAt: { $gte: start, $lte: end },
              },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]);

          return {
            month,
            revenue: revenue[0]?.total || 0,
          };
        }),
      );

      return response.ok(res, { status: true, data });
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  getPaymentDistribution: async (req, res) => {
    try {
      const plans = await PricePlan.find();

      const data = await Promise.all(
        plans.map(async (plan) => {
          const payments = await PaymentHistory.aggregate([
            { $match: { planId: plan._id, paymentStatus: 'success' } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
              },
            },
          ]);

          return {
            name: plan.name,
            value: payments[0]?.count || 0,
            amount: payments[0]?.amount || 0,
          };
        }),
      );

      return response.ok(res, { status: true, data });
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  getWeeklyRegistrations: async (req, res) => {
    try {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const data = await Promise.all(
        days.map(async (day, index) => {
          const start = new Date();
          start.setDate(start.getDate() - start.getDay() + index);
          start.setHours(0, 0, 0, 0);

          const end = new Date(start);
          end.setHours(23, 59, 59, 999);

          const users = await User.countDocuments({
            role: 'User',
            createdAt: { $gte: start, $lte: end },
          });

          const organizations = await User.countDocuments({
            role: 'Organization',
            createdAt: { $gte: start, $lte: end },
          });

          return { day, users, organizations };
        }),
      );

      return response.ok(res, { status: true, data });
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  getAdminDashboardStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ role: 'User' });
      const totalOrganizations = await User.countDocuments({
        role: 'Organization',
      });

      const revenueAgg = await PaymentHistory.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const totalRevenue = revenueAgg[0]?.total || 0;

      const activeSubscriptions = await User.countDocuments({
        'subscription.status': 'active',
      });

      const lastWeekUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      const weeklyGrowth = totalUsers
        ? ((lastWeekUsers / totalUsers) * 100).toFixed(1)
        : 0;

      return response.ok(res, {
        status: true,
        data: {
          totalUsers,
          totalOrganizations,
          totalRevenue,
          activeSubscriptions,
          weeklyGrowth: Number(weeklyGrowth),
        },
      });
    } catch (error) {
      return response.error(res, error.message || 'Dashboard stats failed');
    }
  },
};
