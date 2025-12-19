const express = require('express');
const router = express.Router();
const PricingPlanController = require('../controllers/pricePlanController');
const { authenticate } = require('@middlewares/authMiddleware');

router.post('/createPlan', authenticate, PricingPlanController.createPlan);
router.put('/updatePlan/:id', authenticate, PricingPlanController.updatePlan);
router.get('/getPlanById/:planId', authenticate, PricingPlanController.getPlanById);
router.get("/getAllPlan", PricingPlanController.getAllPlans);
router.post('/buyPlan', authenticate, PricingPlanController.buyPlan);
module.exports = router;
