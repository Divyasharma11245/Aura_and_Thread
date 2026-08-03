const stripe = require('../config/stripe');

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
  });
};

const processRefund = async (paymentIntentId) => {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
};

module.exports = { createPaymentIntent, processRefund };