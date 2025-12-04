const Documents = require('../models/DocumentsSchema');
const response = require('../../responses');
const generateDocumentName = require('../services/genrateAutoName');

const DocumentsController = {
  create: async (req, res) => {
    try {
      const { projectId, type, data, name } = req.body;

      if (!projectId || !type) {
        return response.error(res, 'projectId and type are required');
      }

      const newDoc = await Documents.create({
        projectId,
        type,
        name,
        data: data || {},
        createdBy: req.user?.id,
      });

      return response.ok(res, {
        message: 'Document created successfully',
        data: newDoc,
      });
    } catch (error) {
      console.error('Create Document Error:', error);
      return response.error(res, error.message || 'Failed to create document');
    }
  },

  // GET ALL DOCUMENTS BY PROJECT ID
  getByProjectId: async (req, res) => {
    try {
      const { projectId } = req.params;

      const docs = await Documents.find({ projectId }).sort({ createdAt: -1 });

      return response.ok(res, {
        message: 'Documents fetched successfully',
        data: docs,
      });
    } catch (error) {
      console.error('Get Document Error:', error);
      return response.error(res, 'Failed to fetch documents');
    }
  },

  // GET SINGLE DOCUMENT
  getOne: async (req, res) => {
    try {
      const { id } = req.params;

      const doc = await Documents.findById(id);

      if (!doc) return response.error(res, 'Document not found');

      return response.ok(res, {
        message: 'Document fetched successfully',
        data: doc,
      });
    } catch (error) {
      return response.error(res, error.message || 'Failed to fetch document');
    }
  },

  // UPDATE DOCUMENT (mainly data update)
  update: async (req, res) => {
    try {
      const { editId } = req.params;
      const { data } = req.body;

      const updated = await Documents.findByIdAndUpdate(
        editId,
        { data },
        { new: true },
      );

      if (!updated) return response.error(res, 'Document not found');

      return response.ok(res, {
        message: 'Document updated successfully',
        data: updated,
      });
    } catch (error) {
      return response.error(res, 'Failed to update document');
    }
  },

  // DELETE DOCUMENT
  delete: async (req, res) => {
    try {
      const { editId } = req.params;

      const deleted = await Documents.findByIdAndDelete(editId);

      if (!deleted) return response.error(res, 'Document not found');

      return response.ok(res, {
        message: 'Document deleted successfully',
      });
    } catch (error) {
      return response.error(res, 'Failed to delete document');
    }
  },
};

module.exports = DocumentsController;
