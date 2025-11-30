require('dotenv').config();

const { Kafka } = require('kafkajs');

const {
  KAFKA_BROKERS = 'localhost:9092',
  KAFKA_CLIENT_ID = 'flight-service',
  KAFKA_GROUP_ID = 'flight-service-group',
} = process.env;

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS.split(','),
});

function createProducer() {
  return kafka.producer();
}

function createConsumer(groupId = KAFKA_GROUP_ID) {
  return kafka.consumer({ groupId });
}

module.exports = {
  kafka,
  createProducer,
  createConsumer,
};
