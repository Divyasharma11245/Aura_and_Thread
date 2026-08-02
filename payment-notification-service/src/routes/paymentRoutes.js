const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-intent', paymentController.createIntent);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;