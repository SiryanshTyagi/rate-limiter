-- KEYS[1] = bucket:<userId>
-- ARGV[1] = BUCKET_SIZE
-- ARGV[2] = REFILL_RATE (tokens per second)

local bucketKey = KEYS[1]
local bucketSize = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])

-- Get current Redis time (milliseconds)
local redisTime = redis.call("TIME")
local now =
    tonumber(redisTime[1]) * 1000 +
    math.floor(tonumber(redisTime[2]) / 1000)

-- Read bucket
local bucketData = redis.call("HGETALL", bucketKey)

local bucket = {}

-- Create bucket if it doesn't exist
if #bucketData == 0 then
    bucket.tokens = bucketSize
    bucket.lastRefill = now
else
    -- Convert Redis array into a Lua table
    for i = 1, #bucketData, 2 do
        bucket[bucketData[i]] = tonumber(bucketData[i + 1])
    end
end

-- Refill tokens
local elapsedTime = (now - bucket.lastRefill) / 1000
local tokensToAdd = elapsedTime * refillRate

bucket.tokens = math.min(
    bucketSize,
    bucket.tokens + tokensToAdd
)

-- Preserve fractional refill time
bucket.lastRefill =
    bucket.lastRefill +
    (tokensToAdd / refillRate) * 1000

-- Check if request is allowed
if bucket.tokens < 1 then
    redis.call(
        "HSET",
        bucketKey,
        "tokens", bucket.tokens,
        "lastRefill", bucket.lastRefill
    )

    return 0
end

-- Consume one token
bucket.tokens = bucket.tokens - 1

-- Save updated bucket
redis.call(
    "HSET",
    bucketKey,
    "tokens", bucket.tokens,
    "lastRefill", bucket.lastRefill
)

return 1