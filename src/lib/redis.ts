import { Redis } from 'ioredis';

const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not defined');
  }

  return new Redis(process.env.REDIS_URL);
};

export const redis = getRedisClient(); 