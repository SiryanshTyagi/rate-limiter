import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
  }),
);
import express from "express";
import { rateLimiter } from "./middleware/rateLimiter.js";
import redisClient from "./service/redis.js";
import { getMetrics, getUptime } from "./service/metrics.js";

const app = express();
app.set("trust proxy", true);

app.use(express.json());

app.get("/health", (req, res) => {
  const redisStatus = redisClient.isReady ? "CONNECTED" : "DISCONNECTED";

  res.json({
    status: "UP",
    redis: redisStatus,
    uptime: getUptime(),
  });
});

app.get("/metrics", (req, res) => {
  const redisStatus = redisClient.isReady ? "CONNECTED" : "DISCONNECTED";

  res.json(getMetrics(redisStatus));
});

app.use(rateLimiter); // Apply the rate limiter middleware to the app routes below

app.get("/", (req, res) => {
  res.send("rate limmiter app");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
