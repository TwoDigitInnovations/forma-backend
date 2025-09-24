const BOQ = require('../models/Boqdoc');
const Template = require('../models/Boqtemplate');
const response = require('./../../responses');

const BoqController = {
  createBoq: async (req, res) => {
    try {
      const payload = req?.body || {};
      payload.createdBy = req.user?.id || req.userId;
      const newBoq = new BOQ(payload);
      await newBoq.save();

      return response.ok(res, {
        message: 'BOQ Document Save successfully',
        data: newBoq,
      });
    } catch (error) {
      console.error('Create BOQ error:', error);
      return response.error(res, error.message || 'Failed to create BOQ');
    }
  },

  getBoqsByProject: async (req, res) => {
    try {
      const { projectId } = req.params;

      const boqs = await BOQ.find({ projectId })
        .populate('createdBy', 'name email')
        .populate('projectId', 'name location');

      return response.ok(res, {
        message: 'BOQs fetched successfully',
        data: boqs,
      });
    } catch (error) {
      console.error('Get BOQs error:', error);
      return response.error(res, error.message || 'Failed to fetch BOQs');
    }
  },

  getBoqById: async (req, res) => {
    try {
      const { projectId, id } = req.query; // fixed typo

      const boq = await BOQ.findById(id)
        .populate('createdBy', 'name email')
        .populate('projectId', 'name location');
      console.log(boq)

      if (!boq) {
        return res.status(404).json({
          status: false,
          message: 'BOQ not found',
        });
      }

      return response.ok(res, {
        message: 'BOQs fetched successfully',
        data: boq,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to fetch BOQs');
    }
  },

  deleteBoq: async (req, res) => {
    try {
      const { id } = req.params;
      console.log("id", id)
      const deletedBoq = await BOQ.findByIdAndDelete(id);

      if (!deletedBoq) {
        return res.status(404).json({
          status: false,
          message: 'BOQ not found',
        });
      }

      return response.ok(res, {
        message: 'BOQ deleted successfully',
        data: deletedBoq,
      });
    } catch (error) {
      console.error('Delete BOQ error:', error);
      return response.error(res, error.message || 'Failed to delete BOQ');
    }
  },

  updateBoqById: async (req, res) => {
    try {
      const { id } = req.query;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          status: false,
          message: "BOQ ID is required",
        });
      }

      const updatedBoq = await BOQ.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .populate("createdBy", "name email")
        .populate("projectId", "name location");

      if (!updatedBoq) {
        return res.status(404).json({
          status: false,
          message: "BOQ not found",
        });
      }

      return response.ok(res, {
        message: "BOQ updated successfully",
        data: updatedBoq,
      });
    } catch (error) {
      console.error("Update BOQ error:", error);
      return response.error(res, error.message || "Failed to update BOQ");
    }
  },

};

module.exports = BoqController;
