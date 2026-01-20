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

    const projectActionRegistry = req.body?.projectActionRegistry;
    if (!Array.isArray(projectActionRegistry)) {
      return response.error(res, {
        message: 'Invalid project action registry data',
      });
    }

    // 1️⃣ Create Meeting
    const meeting = await MeetingMinutes.create({
      ...req.body,
      createdBy: userId,
      projectActionRegistry,
    });

    // 2️⃣ UPSERT action points (NO DUPLICATES)
    const actionPointsOps = [];

    projectActionRegistry.forEach((project) => {
      const { projectId, actions } = project;
      if (!projectId || !Array.isArray(actions)) return;

      actions.forEach((action) => {
        actionPointsOps.push({
          updateOne: {
            filter: {
              projectId,
              createdBy: userId,
              description: action.actionItemDescription,
            },
            update: {
              $set: {
                assignedTo: action.responsiblePerson || '',
                dueDate: action.deadline || null,
                status: action.status,
              },
            },
            upsert: true, // 🔥 prevents duplicates
          },
        });
      });
    });

    if (actionPointsOps.length > 0) {
      await ActionPoints.bulkWrite(actionPointsOps);
    }

    return response.ok(res, {
      message: 'Meeting minutes created successfully',
      meeting,
      totalActionPointsProcessed: actionPointsOps.length,
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

    const {
      meetingTitle,
      meetingDate,
      membersPresent,
      agendas,
      meetingDiscussions,
      projectActionRegistry = [],
    } = req.body;

    if (!Array.isArray(projectActionRegistry)) {
      return response.error(res, {
        message: 'Invalid project action registry data',
      });
    }

    const meeting = await MeetingMinutes.findById(editId);
    if (!meeting) {
      return response.error(res, { message: 'Meeting not found' });
    }

    meeting.meetingTitle = meetingTitle ?? meeting.meetingTitle;
    meeting.meetingDate = meetingDate ?? meeting.meetingDate;
    meeting.membersPresent = membersPresent ?? meeting.membersPresent;
    meeting.agendas = agendas ?? meeting.agendas;
    meeting.meetingDiscussions =
      meetingDiscussions ?? meeting.meetingDiscussions;
    meeting.projectActionRegistry = projectActionRegistry;
    meeting.status = 'synced';

    await meeting.save();

    const actionPointsOps = [];

    projectActionRegistry.forEach((project) => {
      const { projectId, actions } = project;
      if (!projectId || !Array.isArray(actions)) return;

      actions.forEach((action) => {
        actionPointsOps.push({
          updateOne: {
            filter: {
              projectId,
              createdBy: userId,
              description: action.actionItemDescription,
            },
            update: {
              $set: {
                assignedTo: action.responsiblePerson || '',
                dueDate: action.deadline || null,
                status: action.status,
              },
            },
            upsert: true,
          },
        });
      });
    });

    if (actionPointsOps.length > 0) {
      await ActionPoints.bulkWrite(actionPointsOps);
    }

    return response.ok(res, {
      message: 'Meeting minutes updated successfully',
      meeting,
      totalActionPointsProcessed: actionPointsOps.length,
    });
  } catch (error) {
    console.error('updateMeetingMinutes error:', error);
    return response.error(res, { message: error.message });
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
