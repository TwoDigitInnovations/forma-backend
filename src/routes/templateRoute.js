const express = require('express');
const TemplateController = require('@controllers/boqTemplateController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/createTemplate', TemplateController.createTemplate);
router.get('/getTemplate', authenticate, TemplateController.getTemplates);
router.get(
  '/getTemplatesByProjectId/:projectId',
  authenticate,
  TemplateController.getTemplatesByProjectId,
);
router.delete(
  '/deleteTemplate/:id',
  authenticate,
  TemplateController.deleteTemplate,
);

module.exports = router;
