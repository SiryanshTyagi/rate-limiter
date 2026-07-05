const BUCKET_SIZE = 1; // Maximum number of tokens in the bucket
const BUCKET_REFILL_RATE = 1; // Number of tokens added to the bucket per second

const buckets = new Map(); // Map to store token buckets for each user

export function allowRequest(userId) {
  if (!buckets.has(userId)) {
    buckets.set(userId, {
      tokens: BUCKET_SIZE,
      lastRefill: Date.now(),
    });
  }

  const bucket = buckets.get(userId);

  const currentTime = Date.now();

  const timeSinceLastFill = (currentTime - bucket.lastRefill) / 1000; // Convert to seconds

  const tokensToAdd = Math.floor(timeSinceLastFill * BUCKET_REFILL_RATE);

  // Refill bucket only if at least one token should be added
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(BUCKET_SIZE, bucket.tokens + tokensToAdd);

    bucket.lastRefill += (tokensToAdd / BUCKET_REFILL_RATE) * 1000;
  }

  if (bucket.tokens >= 1) {
    buckets.get(userId).tokens--;
    console.log(
      `Request allowed for user ${userId}. Remaining tokens: ${bucket.tokens}`,
    );
    return true;
  }
  return false;
}
