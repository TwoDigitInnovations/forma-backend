const express = require('express');
const Project = require('@controllers/projectController')
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/createProject', authenticate, Project.createProject);
router.get('/getAllProjects', Project.getAllProjects);
router.get('/getProjectStats', Project.getProjectStats);
router.get('/getProjectById/:id', Project.getProjectById);
router.put('/updateProject/:id', Project.updateProject);
router.post('/updateProjectStatus', Project.updateProjectStatus);
router.delete('deleteProject/:id', Project.deleteProject);

module.exports = router;
