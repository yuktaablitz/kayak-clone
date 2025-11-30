const { createProducer } = require('../config/kafka');
const winston = require('winston');

let producer;

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
});

async function initProducer() {
  if (!producer) {
    producer = createProducer();
    try {
      await producer.connect();
      logger.info('Kafka producer connected');
    } catch (err) {
      logger.error('Failed to connect Kafka producer', { error: err.message });
      throw err;
    }
  }
  return producer;
}

async function sendMessage(topic, message) {
  const p = await initProducer();
  try {
    await p.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
    logger.info(`Message sent to topic ${topic}`);
  } catch (err) {
    logger.error('Error sending Kafka message', { topic, error: err.message });
    throw err;
  }
}

async function disconnectProducer() {
  if (producer) {
    try {
      await producer.disconnect();
      logger.info('Kafka producer disconnected');
    } catch (err) {
      logger.error('Error disconnecting Kafka producer', { error: err.message });
    }
  }
}

module.exports = {
  sendMessage,
  disconnectProducer,
};
