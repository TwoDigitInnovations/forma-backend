const MeetingMinutes = require('../models/logsSchema');
const response = require('../../responses');

const meetingMinutesController = {
  createMeetingMinutes: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return response.error(res, 'Unauthorized');
      }

      const meeting = await MeetingMinutes.create({
        ...req.body,
        createdBy: userId,
      });

      return response.ok(res, {
        message: 'Meeting minutes created successfully',
        meeting,
      });
    } catch (error) {
      console.error('Create meeting error:', error);
      return response.error(res, error.message);
    }
  },
  getMeetingMinutesById: async (req, res) => {
    try {
      const { id } = req.params;

      const meeting = await MeetingMinutes.findById(id)
        .populate('createdBy', 'name email')
        .populate('projectActionRegistry.projectId', 'name');

      if (!meeting) {
        return response.error(res, 'Meeting not found');
      }

      return response.ok(res, meeting);
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  getMyMeetingMinutes: async (req, res) => {
    try {
      const userId = req.user?.id;

      const meetings = await MeetingMinutes.find({ createdBy: userId }).sort({
        createdAt: -1,
      });

      return response.ok(res, meetings);
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  updateMeetingMinutes: async (req, res) => {
    try {
      const { id } = req.params;

      const meeting = await MeetingMinutes.findById(id);

      if (!meeting) {
        return response.error(res, 'Meeting not found');
      }

      Object.assign(meeting, req.body);
      meeting.status = 'synced';

      await meeting.save();

      return response.ok(res, {
        message: 'Meeting minutes updated successfully',
        meeting,
      });
    } catch (error) {
      return response.error(res, error.message);
    }
  },
  deleteMeetingMinutes: async (req, res) => {
    try {
      const { id } = req.params;

      const meeting = await MeetingMinutes.findByIdAndDelete(id);

      if (!meeting) {
        return response.error(res, 'Meeting not found');
      }

      return response.ok(res, {
        message: 'Meeting minutes deleted successfully',
      });
    } catch (error) {
      return response.error(res, error.message);
    }
  },
};

module.exports = meetingMinutesController;
