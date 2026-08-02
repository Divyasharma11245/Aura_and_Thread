const stripe = require('../config/stripe');
const stripeService = require('../services/stripeService');
const { sendEmail } = require('../services/emailService');

// Create Payment Intent
exports.createIntent = async (req, res) => {
  try {
    const { amount, currency, orderId, email } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Amount and Order ID are required.' });
    }

    // Attach email & orderId into metadata so the Webhook can read them later
    const paymentIntent = await stripeService.createPaymentIntent(amount, currency, { orderId, email });

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
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 1. Verify that the event came directly from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(` Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle specific Stripe payment event types
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(` PaymentIntent ${paymentIntent.id} succeeded!`);

      const recipientEmail = paymentIntent.metadata?.email || paymentIntent.receipt_email;
      const orderId = paymentIntent.metadata?.orderId || 'N/A';
      const amountPaid = (paymentIntent.amount / 100).toFixed(2);

      if (recipientEmail) {
        // Send order payment receipt email
        await sendEmail(
          recipientEmail,
          `Payment Confirmation - Order #${orderId}`,
          `<h2>Payment Received!</h2>
           <p>Thank you for shopping with <strong>Aura & Thread</strong>.</p>
           <p><strong>Order ID:</strong> ${orderId}</p>
           <p><strong>Amount Paid:</strong> $${amountPaid} ${paymentIntent.currency.toUpperCase()}</p>
           <p>We are processing your order and will notify you once shipped.</p>`
        );
        console.log(` Confirmation email sent to ${recipientEmail}`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object;
      console.log(`Payment failed for PaymentIntent ${failedIntent.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // 3. Acknowledge receipt of the event to Stripe
  res.status(200).json({ received: true });
};