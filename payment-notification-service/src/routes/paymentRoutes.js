const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const paymentRoutes = require('./src/routes/paymentRoutes');

const app = express();

app.use(helmet());
app.use(cors());
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