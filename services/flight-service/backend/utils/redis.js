const Redis = require('ioredis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
});

const {
  REDIS_HOST = 'localhost',
  REDIS_PORT = 6379,
} = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { error: err.message }));

module.exports = redis;
