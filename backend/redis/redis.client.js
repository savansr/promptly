const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisUsername = process.env.REDIS_USERNAME || undefined;
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const  client=createClient({
      username: redisUsername,
      password: redisPassword,
      socket: { host: redisHost, port: redisPort }
    });

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

function isRedisReady() {
  return Boolean(client && client.isOpen);
}

async function getCache(key) {
  try {
    if (!isRedisReady()) return null;
    const value = await client.get(key);
    if (value == null) return null;
    try {
      return JSON.parse(value);
    } catch (_) {
      return value;
    }
  } catch (_) {
    return null;
  }
}

async function setCache(key, value, ttlSeconds) {
  try {
    if (!isRedisReady()) return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && Number(ttlSeconds) > 0) {
      await client.set(key, serialized, { EX: Number(ttlSeconds) });
    } else {
      await client.set(key, serialized);
    }
  } catch (_) {
    
  }
}

async function delCache(key) {
  try {
    if (!isRedisReady()) return;
    await client.del(key);
  } catch (_) {
  
  }
}

module.exports = {
  redisClient: client,
  connectRedis,
  isRedisReady,
  getCache,
  setCache,
  delCache
};



