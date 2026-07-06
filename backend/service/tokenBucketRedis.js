import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import redisClient from "./redis.js";

// Resolve this module's directory so the Lua file can be loaded reliably.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the Lua script once so Redis can execute it by SHA.
const luaScript = fs.readFileSync(
  path.join(__dirname, "../scripts/tokenBucket.lua"),
  "utf8",
);

let luaScriptSha = null;

// Token bucket settings shared by the JS fallback path and Lua path.
const BUCKET_SIZE = 20; // Maximum number of tokens in the bucket
const REFILL_RATE = 1; // tokens per second

// Small utility: safely convert Redis string values into numbers.
function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Redis hash-based token bucket helpers used by the non-Lua path.
async function getBucket(userId) {
  const bucketKey = `bucket:${userId}`;

  const bucket = await redisClient.hGetAll(bucketKey);

  // Create bucket if it doesn't exist
  if (Object.keys(bucket).length === 0) {
    const now = Date.now();

    const newBucket = {
      tokens: BUCKET_SIZE,
      lastRefill: now,
    };

    await saveBucket(userId, newBucket);

    return newBucket;
  }

  const currentBucket = {
    tokens: toNumber(bucket.tokens, BUCKET_SIZE),
    lastRefill: toNumber(bucket.lastRefill, Date.now()),
  };

  const currentTime = Date.now();
  const elapsedTime = (currentTime - currentBucket.lastRefill) / 1000;

  const tokensToAdd = elapsedTime * REFILL_RATE;

  return {
    tokens: Math.floor(
      Math.min(BUCKET_SIZE, currentBucket.tokens + tokensToAdd),
    ),
    lastRefill: currentBucket.lastRefill + (tokensToAdd / REFILL_RATE) * 1000,
  };
}

async function saveBucket(userId, bucket) {
  const bucketKey = `bucket:${userId}`;

  await redisClient.hSet(bucketKey, {
    tokens: bucket.tokens,
    lastRefill: bucket.lastRefill,
  });
}

export async function allowRequestRedis(userId) {
  const bucket = await getBucket(userId);

  if (bucket.tokens < 1) {
    await saveBucket(userId, bucket);
    return false;
  }

  bucket.tokens -= 1;

  await saveBucket(userId, bucket);

  console.log(
    `Request allowed for user ${userId}. Remaining tokens: ${Math.max(
      0,
      Math.floor(bucket.tokens),
    )}`,
  );

  return true;
}

// Lua-based path: load the script once, then execute it by SHA.
async function loadLuaScript() {
  luaScriptSha = await redisClient.scriptLoad(luaScript);
}

async function ensureLuaScriptLoaded() {
  if (!luaScriptSha) {
    await loadLuaScript();
  }
}

async function executeLua(userId) {
  return redisClient.evalSha(luaScriptSha, {
    keys: [`bucket:${userId}`],
    arguments: [BUCKET_SIZE.toString(), REFILL_RATE.toString()],
  });
}

export async function allowRequestLua(userId) {
  try {
    await ensureLuaScriptLoaded();
    const allowed = await executeLua(userId);
    return allowed === 1;
  } catch (error) {
    if (!error.message.startsWith("NOSCRIPT")) {
      throw error;
    }

    console.log("Lua script missing in Redis. Reloading...");

    await loadLuaScript();

    const allowed = await executeLua(userId);

    return allowed === 1;
  }
}

// Quick helper for manually checking that the Redis-backed limiter is working.
export async function testRedisConnection(userId = "test-user") {
  const allowed = await allowRequestRedis(userId);

  console.log("Allowed:", allowed);

  const { tokens, lastRefill } = await redisClient.hGetAll(`bucket:${userId}`);

  console.log(
    `Tokens: ${Math.max(0, Math.floor(toNumber(tokens, 0)))} and Last Refill: ${toNumber(
      lastRefill,
      0,
    )} for user ${userId}`,
  );

  return allowed;
}
