import IORedis from 'ioredis';

let connection = null;

const TASK_QUEUE_NAME = 'task-queue';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

const getRedisConnection = () => {
  if (!connection) {
    connection = new IORedis({
      host: REDIS_HOST,
      port: REDIS_PORT
    });
  }

  return connection;
};

export const enqueueTask = async (payload) => {
  const redis = getRedisConnection();
  await redis.rpush(TASK_QUEUE_NAME, JSON.stringify(payload));
};

export const getRedisClient = () => getRedisConnection();
