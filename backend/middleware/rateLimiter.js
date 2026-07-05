import { allowRequest } from "../service/tokenBucket.js";
import { allowRequestRedis } from "../service/tokenBucketRedis.js";
import { allowRequestLua } from "../service/tokenBucketRedis.js";

// Pick the limiter implementation you want to use here.
export async function rateLimiter(req, res, next) {
  // Use a stable user key; fallback to IP when no custom header is sent.
  const userId = req.headers["x-user-id"] || req.ip; // Use the IP address as the user identifier

  // const allowed = allowRequest(userId);
  const allowed = await allowRequestLua(userId);

  if (!allowed) {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  }
  next();
}
