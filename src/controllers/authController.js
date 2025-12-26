const User = require('@models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const response = require('../../responses');
const Verification = require('@models/verification');
const userHelper = require('../helper/user');
const Payment = require('../models/PaymentSchema');
// const mailNotification = require('./../services/mailNotification');
const crypto = require('crypto');
const Invite = require('../models/InviteSchema');

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, phone, role } = req.body;

      if (!password || password.length < 6) {
        return response.error(res, {
          message: `Password must be at least 6 characters long`,
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response.error(res, {
          message: `User already exists`,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      });

      await newUser.save();

      const userResponse = await User.findById(newUser._id).select('-password');

      return response.ok(res, {
        message: 'Registration successful',
        user: userResponse,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return response.error(res, {
          message: `Email and password are required`,
        });
      }

      let user = await User.findOne({ email });

      if (!user) {
        return response.error(res, {
          message: `User not Found`,
        });
      }

      if (user.role === 'TeamsMember' && user.status === 'pending') {
        return response.error(res, {
          message:
            'Your account is pending approval. Please wait for your organization to approve your access.',
        });
      }

      if (user.role === 'TeamsMember' && user.status === 'suspend') {
        return response.error(res, {
          message:
            'Your account has been suspended. Please contact your organization for assistance.',
        });
      }

      if (user.status === 'suspend') {
        return response.error(res, {
          message: 'Your account has been suspended. Please contact your Admin',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return response.error(res, {
          message: `Password is incorrect`,
        });
      }

      if (user.role === 'TeamsMember' && user.OrganizationId) {
        user = await User.findById(user._id)
          .populate('OrganizationId')
          .select('-password');
      } else {
        user.password = undefined;
      }

      console.log(user);

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );

      return response.ok(res, {
        message: 'Login successful',
        token,
        user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  getUser: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: 'User ID is required',
        });
      }

      let query = User.findById(userId).select('-password');

      query = query.populate('OrganizationId');
      const user = await query;

      if (!user) {
        return res.status(404).json({
          status: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        status: true,
        message: 'User profile fetched successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  sendOTP: async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return response.badReq(res, { message: 'Email does not exist.' });
      }

      const fullNameFromRequest = `${firstName} ${lastName}`
        .trim()
        .toLowerCase();
      const fullNameFromDB = user.name?.trim().toLowerCase();
      console.log('fullNameFromRequest', fullNameFromRequest);
      console.log('fullNameFromDB', fullNameFromDB);
      if (fullNameFromRequest !== fullNameFromDB) {
        return response.badReq(res, {
          message: 'Name and email do not match our records.',
        });
      }

      let ran_otp = Math.floor(1000 + Math.random() * 9000);

      // await mailNotification.sendOTPmail({
      //   code: ran_otp,
      //   email: email,
      // });

      const ver = new Verification({
        email: email,
        user: user._id,
        otp: ran_otp,
        expiration_at: userHelper.getDatewithAddedMinutes(5),
      });

      await ver.save();
      const token = await userHelper.encode(ver._id);

      return response.ok(res, { message: 'OTP sent.', token });
    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: 'OTP and token required.' });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ':' + userHelper.getDatewithAddedMinutes(5).getTime(),
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: 'OTP verified', token });
      } else {
        return response.notFound(res, { message: 'Invalid OTP' });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(':');
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: 'Session expired.' });
      }
      let otp = await Verification.findById(verID);
      if (!otp?.verified) {
        return response?.forbidden(res, { message: 'unAuthorize' });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: 'unAuthorize' });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      // mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: 'Password changed ! Login now.' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { userId, ...updateData } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ status: false, message: 'User ID is required' });
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!updatedUser) {
        return res
          .status(404)
          .json({ status: false, message: 'User not found' });
      }

      return res.status(200).json({
        status: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  changePasswordfromAdmin: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // middleware से मिल रहा है

      if (!currentPassword || !newPassword) {
        return response.error(
          res,
          'Old password and new password are required',
        );
      }

      let user = await User.findById(userId);

      if (!user) {
        return response.error(res, 'User not found');
      }

      // Purana password check karo
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return response.error(res, 'Old password is incorrect');
      }

      // New password encrypt karke save karo
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return response.ok(res, {
        message: 'Password changed successfully',
        role: user.role,
      });
    } catch (error) {
      return response.error(res, error.message || 'Something went wrong');
    }
  },

  getAllTeamMembers: async (req, res) => {
    try {
      const organizationId = req.user?.id;
      const search = req.query.search || '';

      if (!organizationId) {
        return response.error(res, 'Unauthorized: Organization ID not found');
      }

      const filter = {
        role: 'TeamsMember',
        OrganizationId: organizationId,
      };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const members = await User.find(filter)
        .populate('OrganizationId')
        .sort({ createdAt: -1 });

      return response.ok(res, {
        message: 'Team members fetched successfully',
        data: members,
      });
    } catch (error) {
      console.error('Get team members error:', error);
      return response.error(
        res,
        error.message || 'Failed to fetch Team Members',
      );
    }
  },

  deleteTeamMember: async (req, res) => {
    try {
      const organizationId = req.body?.id;
      const memberId = req.params.deleteId;

      if (!organizationId || !memberId) {
        return response.error(res, 'Organization ID and Member ID required');
      }

      const member = await User.findById(memberId);

      if (!member) {
        return response.error(res, 'Team member not found');
      }

      if (member.role !== 'TeamsMember') {
        return response.error(res, 'This user is not a Team Member');
      }

      if (String(member.OrganizationId) !== String(organizationId)) {
        return response.error(
          res,
          'Unauthorized: This member belongs to another organization',
        );
      }

      const organization = await User.findById(organizationId);

      if (!organization) {
        return response.error(res, 'Organization not found');
      }

      await User.findByIdAndDelete(memberId);

      if (
        organization.subscription &&
        organization.subscription.usedTeamSize > 0
      ) {
        organization.subscription.usedTeamSize -= 1;
        await organization.save();
      }

      return response.ok(res, {
        message:
          'Team member deleted successfully and subscription usage updated',
      });
    } catch (error) {
      console.error('Delete team member error:', error);
      return response.error(
        res,
        error.message || 'Failed to delete team member',
      );
    }
  },

  createInviteLink: async (req, res) => {
    try {
      const { email, organizationId } = req.body;
      if (!email || !organizationId) {
        return response.error(res, {
          message: 'Email and organizationId are required',
        });
      }

      const token = crypto.randomBytes(32).toString('hex');

      const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

      await Invite.create({
        email,
        organizationId,
        token,
        invitedBy: req.user.id,
        expiresAt: new Date(Date.now() + TWO_WEEKS),
      });

      const inviteLink = `${process.env.FRONTEND_URL}/acceptInvite?token=${token}`;

      // await sendMail(email, inviteLink);

      return response.ok(res, {
        message: 'Invite link sent successfully',
        inviteLink,
      });
    } catch (error) {
      console.error(error);
      return response.error(res, {
        message: 'Server error while creating invite link',
      });
    }
  },
  acceptInvite: async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return response.error(res, {
          message: 'Invite token is required',
        });
      }

      const invite = await Invite.findOne({
        token,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });

      if (!invite) {
        return response.error(res, {
          message: 'Invite link expired or invalid',
        });
      }

      return response.ok(res, {
        email: invite.email,
        organizationId: invite.organizationId,
        inviteId: invite._id,
      });
    } catch (error) {
      console.error(error);
      return response.error(res, {
        message: 'Server error while validating invite',
      });
    }
  },
  signupWithInvite: async (req, res) => {
    try {
      const { inviteId, password, name, phone, role } = req.body;

      const invite = await Invite.findById(inviteId);

      if (!invite || invite.isUsed || invite.expiresAt < new Date()) {
        return response.error(res, {
          message: 'Invite link is invalid or expired',
        });
      }

      const existingUser = await User.findOne({ email: invite.email });
      if (existingUser) {
        return response.error(res, {
          message: 'Email already exists',
        });
      }

      const organization = await User.findById(invite.organizationId);

      if (!organization) {
        return response.error(res, {
          message: 'Organization not found',
        });
      }

      if (
        organization.teamSize &&
        organization.usedTeamsSize >= organization.teamSize
      ) {
        return response.error(res, {
          message: `Team size limit exceeded. Maximum allowed is ${organization.teamSize}`,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: invite.email,
        password: hashedPassword,
        phone,
        OrganizationId: invite.organizationId,
        role,
        status: 'pending',
      });

      invite.isUsed = true;
      await invite.save();

      await User.findByIdAndUpdate(
        invite.organizationId,
        { $inc: { 'subscription.usedTeamsSize': 1 } },
        { new: true },
      );

      return response.ok(res, {
        message: 'Signup successful',
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.OrganizationId,
          status: user.status,
        },
      });
    } catch (error) {
      console.error(error);
      return response.error(res, {
        message: 'Server error',
        error: error.message,
      });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { userId, status } = req.body;
      const organizationId = req.user?.id;

      if (!userId || !status) {
        return response.error(res, {
          message: 'User ID and status are required',
        });
      }

      if (!['verified', 'suspend'].includes(status)) {
        return response.error(res, {
          message: 'Invalid status value',
        });
      }

      const user = await User.findOne({
        _id: userId,
        OrganizationId: organizationId,
      });

      if (!user) {
        return response.error(res, {
          message: 'User not found or does not belong to your organization',
        });
      }

      user.status = status;
      await user.save();

      return response.ok(res, {
        message: `User ${status} successfully`,
        user: {
          _id: user._id,
          status: user.status,
        },
      });
    } catch (error) {
      console.error(error);
      return response.error(res, {
        message: 'Server error',
        error: error.message,
      });
    }
  },
  getPaymentHistory: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return response.error(res, {
          message: 'User ID is required',
        });
      }

      const payments = await Payment.find({ userId })
        .populate('planId')
        .sort({ createdAt: -1 });

      return response.ok(res, {
        message: 'Payment history fetched successfully',
        totalPayments: payments.length,
        payments,
      });
    } catch (error) {
      return response.error(res, {
        message: 'Server error',
        error: error.message,
      });
    }
  },
  cancelSubscription: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return response.error(res, 'Unauthorized');
      }

      const user = await User.findById(userId);

      if (!user || !user.subscription) {
        return response.error(res, 'No active subscription found');
      }

      const subscription = user.subscription;

      // ❌ Already cancelled
      if (subscription.status === 'cancelled') {
        return response.error(res, 'Subscription already cancelled');
      }

      // ❌ Already expired
      if (new Date(subscription.planEndDate) <= new Date()) {
        subscription.status = 'expired';
        await user.save();
        return response.error(res, 'Subscription already expired');
      }

      // ✅ Cancel logic
      subscription.status = 'cancelled';
      subscription.autoRenew = false;
      subscription.cancelledAt = new Date(); // optional but useful

      await user.save();

      return response.ok(res, {
        message:
          'Subscription cancelled successfully. You will retain access until the end of your billing period.',
        subscription,
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return response.error(
        res,
        error.message || 'Failed to cancel subscription',
      );
    }
  },
  resumeSubscription: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return response.error(res, 'Unauthorized');
      }

      const user = await User.findById(userId);

      if (!user || !user.subscription) {
        return response.error(res, 'No subscription found');
      }

      const subscription = user.subscription;

      if (subscription.status === 'active') {
        return response.error(res, 'Subscription is already active');
      }

      if (new Date(subscription.planEndDate) <= new Date()) {
        subscription.status = 'expired';
        await user.save();
        return response.error(res, 'Subscription already expired');
      }

      subscription.status = 'active';
      subscription.autoRenew = true;
      subscription.resumedAt = new Date(); // optional audit

      await user.save();

      return response.ok(res, {
        message: 'Subscription resumed successfully',
        subscription,
      });
    } catch (error) {
      console.error('Resume subscription error:', error);
      return response.error(
        res,
        error.message || 'Failed to resume subscription',
      );
    }
  },
  toggleAutoRenew: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { autoRenew } = req.body; // true / false

      if (!userId) {
        return response.error(res, 'Unauthorized');
      }

      if (typeof autoRenew !== 'boolean') {
        return response.error(res, 'autoRenew must be boolean');
      }

      const user = await User.findById(userId);

      if (!user || !user.subscription) {
        return response.error(res, 'No subscription found');
      }

      const subscription = user.subscription;

      if (new Date(subscription.planEndDate) <= new Date()) {
        subscription.status = 'expired';
        await user.save();
        return response.error(res, 'Subscription already expired');
      }

      if (subscription.status === 'cancelled' && autoRenew === true) {
        return response.error(
          res,
          'Resume subscription before enabling auto-renew',
        );
      }
      subscription.autoRenew = autoRenew;
      subscription.autoRenewUpdatedAt = new Date();

      await user.save();

      return response.ok(res, {
        message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`,
        subscription,
      });
    } catch (error) {
      console.error('Auto-renew error:', error);
      return response.error(
        res,
        error.message || 'Failed to update auto-renew',
      );
    }
  },
};
