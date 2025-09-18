
const express = require('express');
const BoqController = require('@controllers/boqController')
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post("/createBoq", authenticate, BoqController.createBoq);
router.get("/getBoqsByProject/:projectId", authenticate, BoqController.getBoqsByProject);
router.get("/getBoqById/:id", authenticate, BoqController.getBoqById);
router.delete("/deleteBoq/:id", authenticate, BoqController.deleteBoq);

module.exports = router;
