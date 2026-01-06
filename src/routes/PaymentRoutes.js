const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { authenticate } = require('@middlewares/authMiddleware');

const router = express.Router();

router.get('/getAllPayment', authenticate, PaymentController.getAllPayment);

module.exports = router;
