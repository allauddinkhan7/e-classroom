import Redis from 'ioredis';

export function createBullMqConnection() {
  return new Redis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null, // required by BullMQ specifically
  });
}