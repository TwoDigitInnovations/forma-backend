const Program = require('../models/programSchema');
const response = require('../../responses');
const Project = require('../models/Projectschema');

const ProgramController = {
  create: async (req, res) => {
    try {
      const userId = req.user.id;

      const newProgram = await Program.create({
        name: req.body.name,
        createdBy: userId,
      });

      return response.ok(res, {
        message: 'Program created successfully',
        data: newProgram,
      });
    } catch (error) {
      console.error('Create Program error:', error);
      return response.error(res, error.message || 'Failed to create program');
    }
  },

  getAll: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      let programs = [];

      if (projectId) {
        // Check project access
        const project = await Project.findOne({
          _id: projectId,
          'members.userId': userId,
        });

        if (!project) {
          return res.status(403).json({ message: 'Access denied' });
        }

        // Find programs linked to that project
        programs = await Program.find({
          projectIds: projectId,
        }).sort({ createdAt: -1 });
      } else {
        // Personal programs
        programs = await Program.find({
          createdBy: userId,
        }).sort({ createdAt: -1 });
      }

      return response.ok(res, {
        message: 'Programs fetched successfully',
        data: programs,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const program = await Program.findById(id);

      if (!program) {
        return response.error(res, 'Program not found');
      }

      return response.ok(res, {
        message: 'Program fetched successfully',
        data: program,
      });
    } catch (error) {
      console.error('Get Program error:', error);
      return response.error(res, error.message);
    }
  },

  update: async (req, res) => {
    try {
      const { editId } = req.params;

      const updatedProgram = await Program.findByIdAndUpdate(
        editId,
        {
          name: req.body.name,
        },
        { new: true },
      );

      if (!updatedProgram) {
        return response.error(res, 'Program not found');
      }

      return response.ok(res, {
        message: 'Program updated successfully',
        data: updatedProgram,
      });
    } catch (error) {
      console.error('Update Program error:', error);
      return response.error(res, error.message);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedProgram = await Program.findByIdAndDelete(id);

      if (!deletedProgram) {
        return response.error(res, 'Program not found');
      }

      return response.ok(res, {
        message: 'Program deleted successfully',
      });
    } catch (error) {
      console.error('Delete Program error:', error);
      return response.error(res, error.message);
    }
  },
};

module.exports = ProgramController;
