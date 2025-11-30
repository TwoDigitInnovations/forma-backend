const express = require('express');
const router = express.Router();
const CheckListController = require('../controllers/checkListController');
const { authenticate } = require('@middlewares/authMiddleware');

router.post('/create/:projectId', authenticate, CheckListController.create);
router.get('/getAllByProject/:projectId', CheckListController.getByProject);
router.get('/getById/:itemId', authenticate, CheckListController.getById);
router.post('/update/:itemId', authenticate, CheckListController.update);
router.delete('/delete/:itemId', authenticate, CheckListController.delete);

module.exports = router;
