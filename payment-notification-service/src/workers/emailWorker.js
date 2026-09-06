const {
  connectRabbitMQ,
  EMAIL_NOTIFICATION_QUEUE,
} = require('../config/rabbitmq');
const { sendEmail } = require('../services/emailService');

const processMessage = async (channel, msg) => {
  let content;
  try {
    content = JSON.parse(msg.content.toString());
  } catch (error) {
    console.error(' Invalid email notification payload:', error.message);
    channel.nack(msg, false, false);
    return;
  }

  const { event, email, subject, htmlContent } = content;
  console.log(` Received background event [${event}] for ${email}`);

  if (!email || !subject || !htmlContent) {
    console.error(' Missing required email fields in message payload.');
    channel.nack(msg, false, false);
    return;
  }

  try {
    await sendEmail(email, subject, htmlContent);
    channel.ack(msg);
    console.log(` Email sent successfully to ${email}`);
  } catch (error) {
    console.error(' Error sending notification email:', error.message);
    channel.nack(msg, false, true);
  }
};

const startEmailWorker = async () => {
  const rabbit = await connectRabbitMQ();
  const { channel } = rabbit;

  await channel.assertQueue(EMAIL_NOTIFICATION_QUEUE, { durable: true });
  await channel.prefetch(1);
  console.log(
    ` Worker listening for messages in queue: "${EMAIL_NOTIFICATION_QUEUE}"...`,
  );

  await channel.consume(
    EMAIL_NOTIFICATION_QUEUE,
    async (msg) => {
      if (msg) {
        await processMessage(channel, msg);
      }
    },
    { noAck: false },
  );
};

startEmailWorker().catch((error) => {
  console.error(' Failed to start Email Worker:', error.message);
  process.exitCode = 1;
});