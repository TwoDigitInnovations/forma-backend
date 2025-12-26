const express = require('express');
const authController = require('@controllers/authController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticate, authController.getUser);
router.post('/sendOTP', authController.sendOTP);
router.post('/updateProfile', authController.updateProfile);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/changePassword', authController.changePassword);
router.post(
  '/changePasswordfromAdmin',
  authenticate,
  authController.changePasswordfromAdmin,
);
router.get(
  '/getAllTeamMembers',
  authenticate,
  authController.getAllTeamMembers,
);
router.delete('/deleteTeamMember/:deleteId', authController.deleteTeamMember);
router.get('/acceptInvite', authController.acceptInvite);
router.post('/createInviteLink', authenticate, authController.createInviteLink);
router.post('/signupWithInvite', authController.signupWithInvite);
router.patch(
  '/update-user-status',
  authenticate,
  authController.updateUserStatus,
);
router.get('/paymenthistory', authController.getPaymentHistory);

router.post(
  '/cancelSubscription',
  authenticate,
  authController.cancelSubscription,
);
router.post(
  '/resumeSubscription',
  authenticate,
  authController.resumeSubscription,
);
router.post('/toggleAutoRenew', authenticate, authController.toggleAutoRenew);

module.exports = router;
