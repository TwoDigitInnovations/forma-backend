const express = require('express');
const {
  login,
  register,
  getUser,
  sendOTP,
  verifyOTP,
  changePassword,
  updateProfile,
  changePasswordfromAdmin,
  getAllTeamMembers,
  deleteTeamMember,
  createInviteLink,
  acceptInvite,
  signupWithInvite,
  updateUserStatus,
} = require('@controllers/authController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticate, getUser);
router.post('/sendOTP', sendOTP);
router.post('/updateProfile', updateProfile);
router.post('/verifyOTP', verifyOTP);
router.post('/changePassword', changePassword);
router.post('/changePasswordfromAdmin', authenticate, changePasswordfromAdmin);
router.get('/getAllTeamMembers', authenticate, getAllTeamMembers);
router.delete('/deleteTeamMember/:deleteId', deleteTeamMember);
router.get('/acceptInvite', acceptInvite);
router.post('/createInviteLink', authenticate, createInviteLink);
router.post('/signupWithInvite', signupWithInvite);
router.patch('/update-user-status', authenticate, updateUserStatus);

module.exports = router;
