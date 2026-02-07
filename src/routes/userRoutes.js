const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const { authenticate } = require('@middlewares/authMiddleware');
const upload = require('../services/upload');

router.post(
  '/fileUpload',
  authenticate,
  upload.single('file'),
  user.fileUpload,
);
router.get('/dashboard/stats', authenticate, user.getAdminDashboardStats);
router.get(
  '/dashboard/weekly-registrations',
  authenticate,
  user.getWeeklyRegistrations,
);
router.get('/dashboard/payments', authenticate, user.getPaymentDistribution);
router.get('/dashboard/monthly-revenue', authenticate, user.getMonthlyRevenue);
router.get('/dashboard/recent-payments', authenticate, user.getRecentPayments);
router.get('/dashboardData', authenticate, user.DashboardStats);
module.exports = router;
