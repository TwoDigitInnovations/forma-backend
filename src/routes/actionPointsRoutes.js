const express = require('express');
const ActionsPoints = require('../controllers/actionPointsController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/create/:projectId', authenticate, ActionsPoints.create);
router.get('/getAlllist/:projectId', authenticate, ActionsPoints.getByProject);
router.get('/getOne/:id', authenticate, ActionsPoints.getOne);
router.put('/update/:id', authenticate, ActionsPoints.update);
router.delete('/delete/:id', authenticate, ActionsPoints.delete);

module.exports = router;
