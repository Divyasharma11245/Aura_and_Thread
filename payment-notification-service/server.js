const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const paymentRoutes = require('./src/routes/paymentRoutes');
const paymentController = require('./src/controllers/paymentController');

const app = express();

app.use(helmet());
app.use(cors());

// Keep the webhook raw and register it before the JSON parser so Stripe's
// signature can be verified against the exact request bytes.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook,
);

app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Payment & Notification Service', status: 'Active' });
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(` Payment & Notification Service running on port ${PORT}`);
});