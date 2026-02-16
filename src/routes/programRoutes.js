const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { authenticate } = require('@middlewares/authMiddleware');

router.post('/create', authenticate, programController.create);
router.get('/getAll', authenticate, programController.getAll);
router.get('/getById/:id', authenticate, programController.getById);
router.put('/update/:id', authenticate, programController.update);
router.delete('/delete/:id', authenticate, programController.delete);

module.exports = router;
