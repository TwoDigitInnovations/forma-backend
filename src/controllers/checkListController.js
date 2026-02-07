const CheckListItem = require('../models/checkListschema');
const response = require('../../responses');

const CheckListController = {
  create: async (req, res) => {
    try {
      const userId = req.user._id;
      const { projectId } = req.params;

      const newItem = await CheckListItem.create({
        projectId,
        createdBy: userId,
        ...req.body,
      });

      return response.ok(res, {
        message: 'Checklist item created successfully',
        data: newItem,
      });
    } catch (error) {
      console.error('Create checklist error:', error);
      return response.error(
        res,
        error.message || 'Failed to create checklist item',
      );
    }
  },

  getByProject: async (req, res) => {
    try {
      const { projectId } = req.params;

      const items = await CheckListItem.find({ projectId }).sort({
        createdAt: -1,
      });

      return response.ok(res, {
        message: 'Checklist items fetched successfully',
        data: items,
      });
    } catch (error) {
      return response.error(
        res,
        error.message || 'Failed to fetch checklist items',
      );
    }
  },

  getById: async (req, res) => {
    try {
      const { itemId } = req.params;

      const item = await CheckListItem.findById(itemId);
      if (!item) return response.error(res, 'Checklist item not found');

      return response.ok(res, {
        message: 'Checklist item fetched successfully',
        data: item,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to fetch item');
    }
  },

  // ➤ UPDATE Checklist Item
  update: async (req, res) => {
    try {
      const { itemId } = req.params;

      const updated = await CheckListItem.findByIdAndUpdate(
        itemId,
        { $set: req.body },
        { new: true },
      );

      if (!updated) return response.error(res, 'Checklist item not found');

      return response.ok(res, {
        message: 'Checklist item updated successfully',
        data: updated,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to update item');
    }
  },

  // ➤ DELETE Checklist Item
  delete: async (req, res) => {
    try {
      const { itemId } = req.params;

      const deleted = await CheckListItem.findByIdAndDelete(itemId);
      if (!deleted) return response.error(res, 'Checklist item not found');

      return response.ok(res, {
        message: 'Checklist item deleted successfully',
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to delete item');
    }
  },
  getStacts: async (req, res) => {
    try {
      const createdBy = req.user.id;
      const projectId = req.query.projectId;
      const status = 'Pending';

      const filter = {
        createdBy,
        status,
      };

      if (projectId) {
        filter.projectId = projectId;
      }

      const data = await CheckListItem.find(filter);

      return response.ok(res, {
        status: true,
        count: data.length,
        data,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to fetch stats');
    }
  },
};

module.exports = CheckListController;
