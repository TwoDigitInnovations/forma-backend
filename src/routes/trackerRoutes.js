const express = require('express');
const trackerController = require('@controllers/trackerController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/create', authenticate, trackerController.createTracker);
router.get('/getAll', authenticate, trackerController.getAllTracker);
router.get('/get/:id', authenticate, trackerController.getTrackerById);
router.put('/update/:id', authenticate, trackerController.updateTracker);
router.delete('/delete/:id', authenticate, trackerController.deleteTracker);

module.exports = router;
