const express = require('express');
const BoqController = require('@controllers/boqController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/createBoq', authenticate, BoqController.createBoq);
router.get(
  '/getBoqsByProject/:projectId',
  authenticate,
  BoqController.getBoqsByProject,
);
router.get('/getBoqById', authenticate, BoqController.getBoqById);
router.post('/updateBoqById', authenticate, BoqController.updateBoqById);
router.delete('/deleteBoq/:id', authenticate, BoqController.deleteBoq);

module.exports = router;
