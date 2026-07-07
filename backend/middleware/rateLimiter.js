import { allowRequest } from "../service/tokenBucket.js";
import { allowRequestRedis } from "../service/tokenBucketRedis.js";
import { allowRequestLua } from "../service/tokenBucketRedis.js";
import {
  incrementAllowed,
  incrementBlocked,
  incrementTotal,
} from "../service/metrics.js";

// Pick the limiter implementation you want to use here.
export async function rateLimiter(req, res, next) {
  incrementTotal();

  // Use a stable user key; fallback to IP when no custom header is sent.
  const userId = req.ip; // Use the IP address as the user identifier

  // const allowed = allowRequest(userId);
  const result = await allowRequestLua(userId);

  if (!result.allowed) {
    incrementBlocked();

    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      remainingTokens: result.remainingTokens,
    });
  }

  incrementAllowed();

  res.locals.remainingTokens = result.remainingTokens;

  next();
}
