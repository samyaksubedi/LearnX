import Redis from 'ioredis';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';

const redisClient = new Redis(envVariables.REDIS_URL, {
  maxRetriesPerRequest: 1,
});

redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

const testRedisConnection = async () => {
  try {
    await redisClient.ping();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection failed : ', error.message);
    process.exit(1); // Shutdown API process
  }
};

export { redisClient, testRedisConnection };
