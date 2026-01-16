const MeetingMinutes = require('../models/meetingMintesSchema');
const response = require('../../responses');
const ActionPoints = require('../models/actionPointsSchema');

const meetingMinutesController = {
  createMeetingMinutes: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return response.error(res, { message: 'Unauthorized' });
      }

      const data = req.body?.projectActionRegistry;

      if (!Array.isArray(data)) {
        return response.error(res, {
          message: 'Invalid project action registry data',
        });
      }

      console.log('data', data?.action);

      const meeting = await MeetingMinutes.create({
        ...req.body,
        createdBy: userId,
        projectActionRegistry: data,
      });

      const actionPointsPayload = [];

      data.forEach((project) => {
        const { projectId, actions } = project;

        if (!projectId || !Array.isArray(actions)) return;

        actions.forEach((action) => {
          actionPointsPayload.push({
            projectId,
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

      if (actionPointsPayload.length > 0) {
        await ActionPoints.insertMany(actionPointsPayload);
      }

      return response.ok(res, {
        message: 'Meeting minutes created successfully',
        meeting,
        totalCreated: actionPointsPayload.length,
      });
    } catch (error) {
      console.error('createMeetingMinutes error:', error);
      return response.error(res, { message: error.message });
    }
  },

  getMeetingMinutesById: async (req, res) => {
    try {
      const { id } = req.params;

      const meeting = await MeetingMinutes.findById(id)
        .populate('createdBy')
        .populate('projectActionRegistry.projectId', 'name');

      if (!meeting) {
        return response.error(res, { message: 'Meeting not found' });
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
      const { editId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return response.error(res, { message: 'Unauthorized' });
      }

      const data = req.body?.projectActionRegistry;

      if (!Array.isArray(data)) {
        return response.error(res, {
          message: 'Invalid project action registry data',
        });
      }

      const meeting = await MeetingMinutes.findById(editId);

      if (!meeting) {
        return response.error(res, {
          message: 'Meeting not found',
        });
      }

      Object.assign(meeting, req.body);
      meeting.status = 'synced';
      await meeting.save();

      if (!Array.isArray(data)) {
        return response.ok(res, {
          message: 'Meeting updated successfully',
          meeting,
          totalCreated: 0,
        });
      }

      const projectIds = data.map((item) => item.projectId).filter(Boolean);

      await ActionPoints.deleteMany({
        projectId: { $in: projectIds },
        createdBy: userId,
      });

      const actionPointsPayload = [];

      console.log('userid', userId);
      console.log('actionPointsPayload', actionPointsPayload);

      data.forEach((project) => {
        const { projectId, actions } = project;

        if (!projectId || !Array.isArray(actions)) return;
        console.log('action', actions);

        actions.forEach((action) => {
          actionPointsPayload.push({
            projectId,
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

      if (actionPointsPayload.length > 0) {
        await ActionPoints.insertMany(actionPointsPayload);
      }

      return response.ok(res, {
        message: 'Meeting minutes updated successfully',
        meeting,
        totalCreated: actionPointsPayload.length,
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
