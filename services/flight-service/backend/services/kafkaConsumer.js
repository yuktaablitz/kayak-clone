const { createConsumer } = require('../config/kafka');
const winston = require('winston');
const flightModel = require('../models/flightModel');
const bookingModel = require('../models/flightBookingModel');
const { sendMessage } = require('./kafkaProducer');

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
});

let consumer;

async function handleSearchRequest(message) {
  try {
    const payload = JSON.parse(message.value.toString());
    const flights = await flightModel.searchFlights({
      origin: payload.origin,
      destination: payload.destination,
      departureDate: payload.departureDate,
      flightClass: payload.flightClass,
      minPrice: payload.minPrice,
      maxPrice: payload.maxPrice,
      maxStops: payload.maxStops,
      departureTimeRange: payload.timeOfDay,
    });

    await sendMessage('flight-search-response', {
      correlationId: payload.correlationId,
      success: true,
      data: flights,
    });
  } catch (err) {
    logger.error('Error handling search request', { error: err.message });
  }
}

async function handleBookingRequest(message) {
  try {
    const payload = JSON.parse(message.value.toString());

    const result = await bookingModel.createBooking({
      booking_id: payload.booking_id,
      user_id: payload.user_id,
      flight_id: payload.flight_id,
      passenger_name: payload.passenger_name,
      passenger_email: payload.passenger_email,
      passenger_phone: payload.passenger_phone,
      seat_number: payload.seat_number,
      booking_date: new Date(),
      total_amount: payload.total_amount,
      booking_status: 'Pending',
    });

    if (!result.success) {
      await sendMessage('flight-booking-response', {
        correlationId: payload.correlationId,
        success: false,
        reason: result.reason,
      });
      return;
    }

    await sendMessage('flight-booking-response', {
      correlationId: payload.correlationId,
      success: true,
      data: result.data,
    });

    await sendMessage('billing-notification', {
      type: 'FLIGHT_BOOKING',
      booking: result.data,
    });
  } catch (err) {
    logger.error('Error handling booking request', { error: err.message });
  }
}

async function startConsumer() {
  if (consumer) return consumer;

  consumer = createConsumer();
  await consumer.connect();

  await consumer.subscribe({ topic: 'flight-search-request', fromBeginning: false });
  await consumer.subscribe({ topic: 'flight-booking-request', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (topic === 'flight-search-request') {
        await handleSearchRequest(message);
      } else if (topic === 'flight-booking-request') {
        await handleBookingRequest(message);
      }
    },
  });

  logger.info('Kafka consumer started');
  return consumer;
}

async function disconnectConsumer() {
  if (consumer) {
    try {
      await consumer.disconnect();
      logger.info('Kafka consumer disconnected');
    } catch (err) {
      logger.error('Error disconnecting Kafka consumer', { error: err.message });
    }
  }
}

module.exports = {
  startConsumer,
  disconnectConsumer,
};
