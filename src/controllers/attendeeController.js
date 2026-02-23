const AttendeeGroup = require('../models/attendeeSchema');
const response = require('../../responses');

const AttendeeGroupController = {
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;

      const newGroup = await AttendeeGroup.create({
        title: req.body.title,
        attendees: req.body.attendees || [],
        createdBy: userId,
      });

      return response.ok(res, {
        message: 'Attendee group created successfully',
        data: newGroup,
      });
    } catch (error) {
      console.error('Create AttendeeGroup error:', error);
      return response.error(
        res,
        error.message || 'Failed to create attendee group',
      );
    }
  },

  getAll: async (req, res) => {
    try {
      const groups = await AttendeeGroup.find({
        createdBy: req.user.id, 
      }).populate("createdBy", "name email").sort({
        createdAt: -1, 
      });

      return response.ok(res, {
        message: 'Attendee groups fetched successfully',
        data: groups,
      });
    } catch (error) {
      console.error('Get AttendeeGroups error:', error);
      return response.error(res, error.message);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const group = await AttendeeGroup.findById(id);

      if (!group) {
        return response.error(res, 'Attendee group not found');
      }

      return response.ok(res, {
        message: 'Attendee group fetched successfully',
        data: group,
      });
    } catch (error) {
      console.error('Get AttendeeGroup error:', error);
      return response.error(res, error.message);
    }
  },

  update: async (req, res) => {
    try {
      const { editId } = req.params;

      const updatedGroup = await AttendeeGroup.findByIdAndUpdate(
        editId,
        {
          title: req.body.title,
          attendees: req.body.attendees,
        },
        { new: true },
      );

      if (!updatedGroup) {
        return response.error(res, 'Attendee group not found');
      }

      return response.ok(res, {
        message: 'Attendee group updated successfully',
        data: updatedGroup,
      });
    } catch (error) {
      console.error('Update AttendeeGroup error:', error);
      return response.error(res, error.message);
    }
  },

  delete: async (req, res) => {
    try {
      const { editId } = req.params;

      const deletedGroup = await AttendeeGroup.findByIdAndDelete(editId);

      if (!deletedGroup) {
        return response.error(res, 'Attendee group not found');
      }

      return response.ok(res, {
        message: 'Attendee group deleted successfully',
      });
    } catch (error) {
      console.error('Delete AttendeeGroup error:', error);
      return response.error(res, error.message);
    }
  },
};

module.exports = AttendeeGroupController;
