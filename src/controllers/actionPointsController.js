const ActionPoints = require('../models/actionPointsSchema');
const response = require('../../responses');

const ActionPointsController = {
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;

      const newItem = await ActionPoints.create({
        projectId,
        createdBy: userId,
        ...req.body,
      });

      return response.ok(res, {
        message: 'Action point created successfully',
        data: newItem,
      });
    } catch (error) {
      console.error('Create ActionPoint error:', error);
      return response.error(
        res,
        error.message || 'Failed to create action point',
      );
    }
  },

  getByProject: async (req, res) => {
    try {
      const { projectId } = req.params;

      const items = await ActionPoints.find({ projectId }).sort({
        createdAt: -1,
      });

      return response.ok(res, {
        message: 'Action points fetched successfully',
        data: items,
      });
    } catch (error) {
      console.error('Get ActionPoints error:', error);
      return response.error(
        res,
        error.message || 'Failed to fetch action points',
      );
    }
  },

  getOne: async (req, res) => {
    try {
      const { id } = req.params;

      const item = await ActionPoints.findById(id);

      if (!item) return response.notFound(res, 'Action point not found');

      return response.ok(res, {
        message: 'Action point fetched successfully',
        data: item,
      });
    } catch (error) {
      return response.error(
        res,
        error.message || 'Failed to fetch action point',
      );
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const updated = await ActionPoints.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true },
      );

      if (!updated) return response.notFound(res, 'Action point not found');

      return response.ok(res, {
        message: 'Action point updated successfully',
        data: updated,
      });
    } catch (error) {
      return response.error(
        res,
        error.message || 'Failed to update action point',
      );
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await ActionPoints.findByIdAndDelete(id);

      if (!deleted) return response.notFound(res, 'Action point not found');

      return response.ok(res, {
        message: 'Action point deleted successfully',
      });
    } catch (error) {
      return response.error(
        res,
        error.message || 'Failed to delete action point',
      );
    }
  },

  getAllActionPoints: async (req, res) => {
    try {
      const { projectId } = req.query;
      const orgId = req.user.id; // ✅ FIXED

      let filter = {
        createdBy: orgId, // user reference
      };

      if (projectId && projectId !== 'all') {
        filter.projectId = projectId;
      }

      const items = await ActionPoints.find(filter)
        .populate('createdBy')
        .populate('projectId')
        .sort({
          createdAt: -1,
        });

      return response.ok(res, {
        message: 'Action points fetched successfully',
        data: items,
      });
    } catch (error) {
      console.error('Get ActionPoints error:', error);
      return response.error(
        res,
        error.message || 'Failed to fetch action points',
      );
    }
  },
};

module.exports = ActionPointsController;
