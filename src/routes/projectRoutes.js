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
router.delete('/deleteProject/:id', authenticate, Project.deleteProject);

router.post(
  '/update-advance-payment/:projectId',
  authenticate,
  Project.updateAdvancePayment,
);

router.post('/addCertificate/:projectId', authenticate, Project.addCertificate);

router.post(
  '/update-certificate-status/:certId/:projectId',
  authenticate,
  Project.updateCertificateStatus,
);

router.post(
  '/update-payment-paid/:projectId',
  authenticate,
  Project.updatePaidAmount,
);

router.post(
  '/updateCertificates/:projectId/:certificateId',
  Project.updateCertificate,
);

router.get(
  '/getCertificate/:projectId/:certificateId',
  Project.getCertificateById,
);
router.delete(
  '/deleteCertificate/:projectId/:certificateId',
  Project.deleteCertificate,
);
router.post(
  '/assignProjectToMember',
  authenticate,
  Project.assignProjectToMember,
);

module.exports = router;
