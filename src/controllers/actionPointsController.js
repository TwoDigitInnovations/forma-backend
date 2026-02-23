const ActionPoints = require('../models/actionPointsSchema');
const response = require('../../responses');
const Project = require('../models/Projectschema');

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
      const userId = req.user.id;

      let filter = {};

      if (projectId && projectId !== 'all') {
        const project = await Project.findOne({
          _id: projectId,
          members: { $elemMatch: { userId: userId } },
        });

        if (!project) {
          return response.error(res, 'You are not a member of this project');
        }

        filter.projectId = projectId;
      } else {
        const projects = await Project.find({
          members: { $elemMatch: { userId: userId } },
        }).select('_id');

        const projectIds = projects.map((p) => p._id);

        filter.projectId = { $in: projectIds };
      }

      const items = await ActionPoints.find(filter)
        .populate('createdBy')
        .populate('projectId')
        .sort({ createdAt: -1 });

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

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return response.badRequest(res, 'Status is required');
      }

      const allowedStatus = ['Open', 'In-Progress', 'Completed'];

      if (!allowedStatus.includes(status)) {
        return response.badRequest(res, 'Invalid status value');
      }

      const updated = await ActionPoints.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );

      if (!updated) {
        return response.notFound(res, 'Action point not found');
      }

      return response.ok(res, {
        message: 'Action point status updated successfully',
        data: updated,
      });
    } catch (error) {
      return response.error(
        res,
        error.message || 'Failed to update action point',
      );
    }
  },
};

module.exports = ActionPointsController;
