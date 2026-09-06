const amqp = require('amqplib');

const EVENT_EXCHANGE = 'aura.events';
const PAYMENT_CREATED_ROUTING_KEY = 'payment.created';
const EMAIL_NOTIFICATION_QUEUE = 'email_notifications';

const connectRabbitMQ = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();
  await channel.assertExchange(EVENT_EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(EMAIL_NOTIFICATION_QUEUE, { durable: true });
  await channel.bindQueue(
    EMAIL_NOTIFICATION_QUEUE,
    EVENT_EXCHANGE,
    PAYMENT_CREATED_ROUTING_KEY,
  );
  console.log(' Connected to RabbitMQ');
  return { connection, channel };
};

module.exports = {
  connectRabbitMQ,
  EVENT_EXCHANGE,
  PAYMENT_CREATED_ROUTING_KEY,
  EMAIL_NOTIFICATION_QUEUE,
};