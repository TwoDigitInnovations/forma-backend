const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const { authenticate } = require('@middlewares/authMiddleware');
const upload = require("../services/upload");

router.post('/fileUpload', authenticate, upload.single("file"), user.fileUpload);

module.exports = router;
