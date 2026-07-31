const stripeService = require('../services/stripeService');

// Create Payment Intent
exports.createIntent = async (req, res) => {
  try {
    const { amount, currency, orderId } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Amount and Order ID are required.' });
    }

    const paymentIntent = await stripeService.createPaymentIntent(amount, currency, { orderId });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle Stripe Webhooks
exports.handleWebhook = async (req, res) => {
  // Webhook signature verification logic goes here
  res.status(200).json({ received: true });
};