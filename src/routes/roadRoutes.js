const express = require('express');
const controller = require('@controllers/roadsController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/add', authenticate, controller.addRoad);
router.get('/getAll/:projectId', authenticate, controller.getRoads);
router.post('/update/:roadId', authenticate, controller.updateRoad);
router.delete('/delete/:roadID', authenticate, controller.deleteRoad);
router.get('/getRoadById/:roadId', authenticate, controller.getRoadById);

router.put(
  '/updateLayer/:roadId/:layerId',
  authenticate,
  controller.updateLayer,
);
router.put('/refreshLayer/:roadId/:layerId', controller.refreshLayer);

module.exports = router;
