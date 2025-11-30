require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');

const { getMySqlPool, connectMongo } = require('./config/database');
const redis = require('./utils/redis');
const { startConsumer, disconnectConsumer } = require('./services/kafkaConsumer');
const { disconnectProducer } = require('./services/kafkaProducer');
const { flightRoutes, bookingRoutes, reviewRoutes } = require('./routes');

const app = express();

const PORT = process.env.PORT || 3002;

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'flight-service OK' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  try {
    await getMySqlPool();
    logger.info('MySQL pool ready');

    await connectMongo();
    logger.info('MongoDB connected');

    // Redis connects on import; just log readiness
    redis.ping().then(() => logger.info('Redis ping OK')).catch(() => {});

    try {
      await startConsumer();
    } catch (kafkaErr) {
      logger.warn('Kafka consumer failed to start; continuing without Kafka', {
        error: kafkaErr.message,
      });
    }

    const server = app.listen(PORT, () => {
      logger.info(`Flight service listening on port ${PORT}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down flight-service...');
      server.close();
      await disconnectConsumer();
      await disconnectProducer();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error('Failed to start flight-service', { error: err.message });
    process.exit(1);
  }
}

start();
