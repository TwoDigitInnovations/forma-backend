const express = require('express');
const DocumentsController = require('../controllers/DocumentsController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/create', authenticate, DocumentsController.create);

router.get('/getAllproject/:projectId', DocumentsController.getByProjectId);

router.get('/getOne/:id', DocumentsController.getOne);

router.put('/update/:editId', DocumentsController.update);

router.delete('/delete/:editId', DocumentsController.delete);

module.exports = router;
