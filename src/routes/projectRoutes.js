const express = require('express');
const Project = require('@controllers/projectController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/createProject', authenticate, Project.createProject);
router.get('/getAllProjects', authenticate, Project.getAllProjects);
router.get('/getProjectStats', authenticate, Project.getProjectStats);
router.get('/getProjectById/:id', authenticate, Project.getProjectById);
router.put('/updateProject/:id', authenticate, Project.updateProject);
router.post('/updateProjectStatus', authenticate, Project.updateProjectStatus);
router.delete('deleteProject/:id', authenticate, Project.deleteProject);

module.exports = router;
