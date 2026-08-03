const amqp = require('amqplib');

const connectRabbitMQ = async () => {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();
    console.log(' Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error(' RabbitMQ Connection Error:', error.message);
    return null; // Return null on error so destructuring won't break the app abruptly
  }
};

module.exports = { connectRabbitMQ };