const Project = require('../models/Projectschema');
const response = require('./../../responses');

const projectController = {
  createProject: async (req, res) => {
    try {
      const payload = req?.body || {};
      payload.createdBy = req.user?.id || req.userId;
      payload.ProviderId = req.user?.id || req.userId;

      const existingProject = await Project.findOne({
        projectName: payload.projectName,
        location: payload.location,
        isActive: true,
      });

      if (existingProject) {
        return res.status(400).json({
          status: false,
          message: 'Project with the same name and location already exists',
        });
      }

      const newProject = new Project(payload);
      await newProject.save();

      return response.ok(res, {
        message: 'Project created successfully',
        data: newProject,
      });

    } catch (error) {
      console.error('Create project error:', error);
      return response.error(res, error.message || 'Failed to create project');
    }
  },

  getAllProjects: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = { isActive: true };

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.projectType) {
        filter.projectType = req.query.projectType;
      }

      if (req.query.search) {
        filter.$or = [
          { projectName: { $regex: req.query.search, $options: 'i' } },
          { location: { $regex: req.query.search, $options: 'i' } },
          {
            'contractorInfo.contractorName': {
              $regex: req.query.search,
              $options: 'i',
            },
          },
        ];
      }

      const projects = await Project.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Project.countDocuments(filter);

      return response.ok(res, {
        message: 'Projects fetched successfully',
        data: projects,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      });
    } catch (error) {
      console.error('Get projects error:', error);
      return response.error(res, error.message || 'Failed to fetch projects');
    }
  },

  getProjectById: async (req, res) => {
    try {
      console.log(req?.params?.id);
      const project = await Project.findById(req?.params?.id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      console.log(project);

      if (!project || !project.isActive) {
        return res.status(404).json({
          status: false,
          message: 'Project not found',
        });
      }

      return response.ok(res, {
        message: 'Project fetched successfully',
        data: project,
      });
    } catch (error) {
      console.error('Get project by ID error:', error);
      return response.error(res, error.message || 'Failed to fetch project');
    }
  },

  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req?.body || {};
      const project = await Project.findById(id);

      if (!project || !project.isActive) {
        return res.status(404).json({
          status: false,
          message: 'Project not found',
        });
      }
      payload.updatedBy = req.user?.id || req.userId;
      payload.ProviderId = req.user?.id || req.userId;

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true },
      )
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

      return response.ok(res, {
        message: 'Project updated successfully',
        data: updatedProject,
      });
    } catch (error) {
      console.error('Update project error:', error);
      return response.error(res, error.message || 'Failed to update project');
    }
  },

  updateProjectStatus: async (req, res) => {
    try {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          status: false,
          message: 'Project ID and status are required',
        });
      }

      const validStatuses = [
        'Planning',
        'In Progress',
        'On Hold',
        'Completed',
        'Cancelled',
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: false,
          message: 'Invalid status value',
        });
      }

      const project = await Project.findById(id);

      if (!project || !project.isActive) {
        return res.status(404).json({
          status: false,
          message: 'Project not found',
        });
      }

      const updateData = {
        status,
        updatedBy: req.user?.id || req.userId,
      };

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      );

      return response.ok(res, {
        message: 'Project status updated successfully',
        data: updatedProject,
      });
    } catch (error) {
      console.error('Update project status error:', error);
      return response.error(
        res,
        error.message || 'Failed to update project status',
      );
    }
  },

  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project || !project.isActive) {
        return res.status(404).json({
          status: false,
          message: 'Project not found',
        });
      }

      await Project.findByIdAndUpdate(id, {
        $set: {
          isActive: false,
          updatedBy: req.user?.id || req.userId,
        },
      });

      return response.ok(res, {
        message: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Delete project error:', error);
      return response.error(res, error.message || 'Failed to delete project');
    }
  },

  getProjectStats: async (req, res) => {
    try {
      const stats = await Project.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalBudget: { $sum: '$projectBudget' },
            totalContract: { $sum: '$contractAmount' },
          },
        },
      ]);

      const totalProjects = await Project.countDocuments({ isActive: true });

      return response.ok(res, {
        message: 'Project statistics fetched successfully',
        data: {
          totalProjects,
          statusBreakdown: stats,
        },
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      return response.error(
        res,
        error.message || 'Failed to fetch project statistics',
      );
    }
  },
};

module.exports = projectController;
