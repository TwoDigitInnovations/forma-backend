const express = require('express');
const router = express.Router();
const PricingPlanController = require('../controllers/pricePlanController');
const { authenticate } = require('@middlewares/authMiddleware');

router.post('/createPlan', authenticate, PricingPlanController.createPlan);
router.post('/updatePlan/:editId', authenticate, PricingPlanController.updatePlan);
router.get(
  '/getPlanById/:planId',
  authenticate,
  PricingPlanController.getPlanById,
);
router.get('/getAllPlan', PricingPlanController.getAllPlans);
router.post('/buyPlan', authenticate, PricingPlanController.buyPlan);
router.delete(
  '/deleteplan/:planId',
  authenticate,
  PricingPlanController.deletePlan,
);
module.exports = router;
