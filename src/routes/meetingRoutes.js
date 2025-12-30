const express = require('express');
const meetingController = require('../controllers/meetingMinutesController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/createMeetingMinutes',
  authenticate,
  meetingController.createMeetingMinutes,
);

router.get(
  '/getMyMeetingMinutes',
  authenticate,
  meetingController.getMyMeetingMinutes,
);

router.get(
  '/getMeetingMinutesByID/:id',
  authenticate,
  meetingController.getMeetingMinutesById,
);

router.post(
  '/updateMeetingMinutes/:editId',
  authenticate,
  meetingController.updateMeetingMinutes,
);

router.delete(
  '/deleteMeetingMinutes/:id',
  authenticate,
  meetingController.deleteMeetingMinutes,
);

module.exports = router;
