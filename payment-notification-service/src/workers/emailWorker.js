const { connectRabbitMQ } = require('../config/rabbitmq');
const { sendEmail } = require('../services/emailService');

const startEmailWorker = async () => {
  try {
    const { channel } = await connectRabbitMQ();
    const queue = 'email_notifications';

    // Ensure the queue exists
    await channel.assertQueue(queue, { durable: true });
    console.log(` Worker listening for messages in queue: "${queue}"...`);

    // Consume messages from the queue
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(` Received background event [${content.event}] for ${content.email}`);

          const { email, subject, htmlContent } = content;

          if (email && subject && htmlContent) {
            await sendEmail(email, subject, htmlContent);
            console.log(` Email sent successfully to ${email}`);
          } else {
            console.warn(' Missing required email fields in message payload.');
          }

          // Acknowledge that message was handled successfully
          channel.ack(msg);
        } catch (err) {
          console.error(' Error processing message:', err.message);
          // Reject and requeue message if processing fails
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error(' Failed to start Email Worker:', error.message);
  }
};

startEmailWorker();