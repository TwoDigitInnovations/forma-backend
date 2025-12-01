const express = require('express');
const LogsController = require('../controllers/logsController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/create/:projectId', authenticate, LogsController.create);
router.get(
  '/getAllLogs/:projectId',
  authenticate,
  LogsController.getByProject,
);
router.get('/getOne/:id', authenticate, LogsController.getById);
router.put('/update/:id', authenticate, LogsController.update);
router.delete('/delete/:id', authenticate, LogsController.delete);

module.exports = router;
