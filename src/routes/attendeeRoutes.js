const express = require('express');
const router = express.Router();
const AttendeeGroupController = require('../controllers/attendeeController');
const { authenticate } = require('@middlewares/authMiddleware');

router.post('/create', authenticate, AttendeeGroupController.create);

router.get('/getAll', authenticate, AttendeeGroupController.getAll);

router.get('/getById/:id', authenticate, AttendeeGroupController.getById);

router.put('/update/:editId', authenticate, AttendeeGroupController.update);

router.delete('/delete/:editId', authenticate, AttendeeGroupController.delete);

module.exports = router;
