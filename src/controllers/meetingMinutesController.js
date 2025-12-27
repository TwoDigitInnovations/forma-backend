const MeetingMinutes = require('../models/meetingMintesSchema');
const response = require('../../responses');
const ActionPoints = require('../models/actionPointsSchema');

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

      const data = req.body?.projectActionRegistry;
      
      if (!Array.isArray(data) || data.length === 0) {
        return response.error(res, {
          message: 'Invalid project action registry data',
        });
      }

      const actionPointsPayload = [];

      data.forEach((project) => {
        const { projectId, actions } = project;

        if (!projectId || !Array.isArray(actions)) return;

        actions.forEach((action) => {
          actionPointsPayload.push({
            projectId: projectId,
            createdBy: userId,
            description: action.actionItemDescription,
            assignedTo: action.responsiblePerson || '',
            dueDate: action.deadline || null,
            status:
              action.status === 'completed'
                ? 'Completed'
                : action.status === 'in-progress'
                  ? 'In-Progress'
                  : 'Open',
          });
        });
      });

      await ActionPoints.insertMany(actionPointsPayload);

      return response.ok(res, {
        message: 'Meeting minutes created successfully',
        meeting,
        totalCreated: actionPointsPayload.length,
      });
    } catch (error) {
      return response.error(res, error.message);
    }
  },

  getMeetingMinutesById: async (req, res) => {
    try {
      const { id } = req.params;

      const meeting = await MeetingMinutes.findById(id)
        .populate('createdBy')
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

      const meetings = await MeetingMinutes.find({ createdBy: userId })
        .populate('createdBy')
        .sort({
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
