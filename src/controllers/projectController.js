const Project = require('../models/Projectschema');
const response = require('./../../responses');
const User = require('@models/User');

const projectController = {
  createProject: async (req, res) => {
    try {
      const payload = req?.body || {};
      payload.OrganizationId = req.user?.id || req.userId;

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

      if (req.query.OrganizationId) {
        filter.OrganizationId = req.query.OrganizationId;
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
        .populate('OrganizationId')
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
      const project = await Project.findById(req?.params?.id).populate(
        'OrganizationId',
      );

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
      payload.OrganizationId = req.user?.id || req.userId;

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true },
      ).populate('OrganizationId');

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
        OrganizationId: req.user?.id || req.userId,
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
  updatePaidAmount: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { paidAmount } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      project.paidAmount += Number(paidAmount);
      await project.save();

      return response.ok(res, {
        message: 'Paid amount updated successfully',
        data: project.paidAmount,
      });
    } catch (error) {
      console.error('Update paid amount error:', error);
      return response.error(
        res,
        error.message || 'Failed to update paid amount',
      );
    }
  },
  updateCertificateStatus: async (req, res) => {
    try {
      const { certId, projectId } = req.params;
      const { status } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      const cert = project.certificates.id(certId);
      if (!cert) return response.error(res, 'Certificate not found');

      cert.status = status;
      await project.save();

      return response.ok(res, {
        message: 'Certificate status updated successfully',
        data: cert,
      });
    } catch (error) {
      console.error('Certificate status update error:', error);
      return response.error(
        res,
        error.message || 'Failed to update certificate status',
      );
    }
  },
  addCertificate: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { certificateNo, amount, date, status } = req.body;

      if (!amount || amount <= 0) {
        return response.error(
          res,
          'Certificate amount must be greater than zero',
        );
      }

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      project.certificates.push({
        certificateNo,
        amount,
        date,
        status: status,
      });

      await project.save();

      return response.ok(res, {
        message: 'Certificate added successfully',
        data: project.certificates,
      });
    } catch (error) {
      console.error('Add certificate error:', error);
      return response.error(res, error.message || 'Failed to add certificate');
    }
  },
  updateAdvancePayment: async (req, res) => {
    try {
      const { projectId } = req.params;
      let { advanceAmount } = req.body;

      advanceAmount = Number(advanceAmount);

      if (isNaN(advanceAmount) || advanceAmount <= 0) {
        return response.error(
          res,
          'Advance amount must be a valid number greater than zero',
        );
      }

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      // OLD advance amount (if any)
      const oldAdvance = Number(project.advancePayment) || 0;

      // TOTAL paid amount
      const oldPaid = Number(project.paidAmount) || 0;

      /**
       *  👉 LOGIC:
       *  If advance was already added before:
       *    - Remove OLD advance from paid
       *    - Add NEW advance to paid
       */

      const newPaidAmount = oldPaid - oldAdvance + advanceAmount;

      project.advancePayment = advanceAmount; // update latest advance amount
      project.paidAmount = newPaidAmount; // fix total paid

      await project.save();

      return response.ok(res, {
        message: 'Advance payment updated successfully',
        data: project,
      });
    } catch (error) {
      console.error('Advance payment error:', error);
      return response.error(
        res,
        error.message || 'Failed to update advance payment',
      );
    }
  },

  getCertificateById: async (req, res) => {
    try {
      const { projectId, certificateId } = req.params;

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      const certificate = project.certificates.id(certificateId);
      if (!certificate) return response.error(res, 'Certificate not found');

      return response.ok(res, {
        message: 'Certificate details fetched successfully',
        data: certificate,
      });
    } catch (error) {
      console.error('Get certificate error:', error);
      return response.error(
        res,
        error.message || 'Failed to fetch certificate details',
      );
    }
  },

  updateCertificate: async (req, res) => {
    try {
      const { projectId, certificateId } = req.params;
      const { certificateNo, amount, date, status } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      const certificate = project.certificates.id(certificateId);
      if (!certificate) return response.error(res, 'Certificate not found');

      if (certificateNo !== undefined)
        certificate.certificateNo = certificateNo;
      if (amount !== undefined) certificate.amount = amount;
      if (status !== undefined) certificate.status = status;
      if (date !== undefined) certificate.date = date;

      await project.save();

      return response.ok(res, {
        message: 'Certificate updated successfully',
        data: certificate,
      });
    } catch (error) {
      console.error('Update certificate error:', error);
      return response.error(
        res,
        error.message || 'Failed to update certificate',
      );
    }
  },

  deleteCertificate: async (req, res) => {
    try {
      const { projectId, certificateId } = req.params;

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      // Find certificate
      const cert = project.certificates.find(
        (c) => c._id.toString() === certificateId,
      );

      if (!cert) return response.error(res, 'Certificate not found');

      // Remove certificate
      project.certificates = project.certificates.filter(
        (c) => c._id.toString() !== certificateId,
      );

      // 🧮 Update paidAmount if certificate was "Paid"
      if (cert.status === 'Paid') {
        project.paidAmount =
          Number(project.paidAmount || 0) - Number(cert.amount);
        if (project.paidAmount < 0) project.paidAmount = 0; // safety
      }

      await project.save();

      return response.ok(res, {
        message: 'Certificate deleted successfully',
        data: project.certificates,
      });
    } catch (error) {
      console.error('Delete certificate error:', error);
      return response.error(
        res,
        error.message || 'Failed to delete certificate',
      );
    }
  },

  assignProjectToMember: async (req, res) => {
    try {
      const { projectId, memberId, actionType } = req.body;
      const organizationId = req.user?.id;

      if (!projectId || !memberId || !actionType) {
        return response.error(res, 'Missing required fields');
      }

      const member = await User.findById(memberId);
      if (!member) return response.error(res, 'Team member not found');

      if (member.role !== 'TeamsMember')
        return response.error(res, 'This user is not a Team Member');

      if (String(member.OrganizationId) !== String(organizationId))
        return response.error(
          res,
          'Unauthorized: This member belongs to another organization',
        );

      const project = await Project.findById(projectId);
      if (!project) return response.error(res, 'Project not found');

      const isAlreadyInProject = project.assignedMembers?.some(
        (m) => String(m.memberId) === String(memberId),
      );

      if (isAlreadyInProject)
        return response.error(res, 'Member already assigned to this project');

      const isAlreadyInUser = member.assignedProjects?.some(
        (p) => String(p.projectId) === String(projectId),
      );

      if (isAlreadyInUser)
        return response.error(res, 'Project already added for this member');

      project.assignedMembers.push({
        memberId,
        actionType,
      });
      await project.save();

      member.assignedProjects.push({
        projectId,
        actionType,
      });
      await member.save();

      return response.ok(res, {
        message: 'Project assigned to member successfully',
      });
    } catch (error) {
      console.error('Assign project error:', error);
      return response.error(res, error.message || 'Failed to assign project');
    }
  },
};

module.exports = projectController;
