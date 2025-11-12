const express = require('express');
const {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  addActivity,
  getActivitiesByPlanId,
  // getActivityById,
  updateActivity,
  deleteActivity
} = require('@controllers/workplanController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/createPlan', authenticate, createPlan);
router.get('/getAllPlans', authenticate, getAllPlans);                
router.get('/getPlanById/:id', authenticate, getPlanById);           
router.put('/updatePlan/:id', authenticate, updatePlan);              
router.delete('/deletePlan/:id', authenticate, deletePlan);           
router.post('/addActivity/:planId', authenticate, addActivity);       
router.get('/getActivities/:planId', authenticate, getActivitiesByPlanId); 
// router.get('/getActivityById/:id', authenticate, getActivityById);   
router.put('/updateActivity/:id', authenticate, updateActivity);      
router.delete('/deleteActivity/:id', authenticate, deleteActivity);

module.exports = router;
