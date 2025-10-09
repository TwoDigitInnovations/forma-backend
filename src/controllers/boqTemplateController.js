const Template = require('../models/Boqtemplate');
const response = require('./../../responses');

const TemplateController = {
  createTemplate: async (req, res) => {
    try {
      const payload = req?.body || {};
      payload.createdBy = req.user?.id || req.userId;

      const existingTemplate = await Template.findOne({
        name: payload.name,
        category: payload.category,
      });

      if (existingTemplate) {
        return res.status(400).json({
          status: false,
          message: 'Template with same name and category already exists',
        });
      }

      const newTemplate = new Template(payload);
      await newTemplate.save();

      return response.ok(res, {
        message: 'Template created successfully',
        data: newTemplate,
      });
    } catch (error) {
      console.error('Create template error:', error);
      return response.error(res, error.message || 'Failed to create template');
    }
  },

  getTemplates: async (req, res) => {
    try {
      const templates = await Template.find().populate(
        'createdBy',
        'name email',
      );

      return response.ok(res, {
        message: 'Templates fetched successfully',
        data: templates,
      });
    } catch (error) {
      console.error('Get templates error:', error);
      return response.error(res, error.message || 'Failed to fetch templates');
    }
  },

  getTemplatesByProjectId: async (req, res) => {
    try {
      const { projectId } = req.params;
      console.log('projectID', projectId);

      const templates = await Template.find({ projectId });
      // .populate("createdBy", "name email");
      console.log('templates', templates);
      if (!templates || templates.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No templates found for this project',
        });
      }

      return response.ok(res, {
        message: 'Templates fetched successfully',
        data: templates,
      });
    } catch (error) {
      console.error('Get templates error:', error);
      return response.error(res, error.message || 'Failed to fetch templates');
    }
  },

  deleteTemplate: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedTemplate = await Template.findByIdAndDelete(id);
      if (!deletedTemplate) {
        return res.status(404).json({
          status: false,
          message: 'Template not found',
        });
      }

      return response.ok(res, {
        message: 'Template deleted successfully',
        data: deletedTemplate,
      });
    } catch (error) {
      console.error('Delete template error:', error);
      return response.error(res, error.message || 'Failed to delete template');
    }
  },
  getAllTemplates: async (req, res) => {
    try {
      const templates = await Template.find();

      if (!templates || templates.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No templates found for this project',
        });
      }

      return response.ok(res, {
        message: 'Templates fetched successfully',
        data: templates,
      });
    } catch (error) {
      console.error('Get templates error:', error);
      return response.error(res, error.message || 'Failed to fetch templates');
    }
  },
};

module.exports = TemplateController;
