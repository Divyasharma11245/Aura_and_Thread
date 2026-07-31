const amqp = require('amqplib');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    console.log(' Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error(' RabbitMQ Connection Error:', error.message);
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };