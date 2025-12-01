const DailyLogs = require('../models/logsSchema');
const response = require('../../responses');

const LogsController = {
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const { projectId } = req.params;
      
      const newLog = await DailyLogs.create({
        projectId,
        createdBy: userId,
        ...req.body,
      });

      return response.ok(res, {
        message: 'Daily log created successfully',
        data: newLog,
      });
    } catch (error) {
      console.error('Create Daily Log Error:', error);
      return response.error(res, error.message || 'Failed to create daily log');
    }
  },

  getByProject: async (req, res) => {
    try {
      const { projectId } = req.params;

      const logs = await DailyLogs.find({ projectId }).sort({ date: -1 });

      return response.ok(res, {
        message: 'Daily logs fetched successfully',
        data: logs,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to fetch daily logs');
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const log = await DailyLogs.findById(id);
      if (!log) return response.notFound(res, 'Log not found');

      return response.ok(res, {
        message: 'Daily log fetched successfully',
        data: log,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to fetch daily log');
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const updatedLog = await DailyLogs.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true },
      );

      if (!updatedLog) return response.notFound(res, 'Log not found');

      return response.ok(res, {
        message: 'Daily log updated successfully',
        data: updatedLog,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to update daily log');
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await DailyLogs.findByIdAndDelete(id);
      if (!deleted) return response.notFound(res, 'Log not found');

      return response.ok(res, {
        message: 'Daily log deleted successfully',
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to delete daily log');
    }
  },
};

module.exports = LogsController;
