import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import express from "express";
import { rateLimiter } from "./middleware/rateLimiter.js";
import redisClient from "./service/redis.js";
import { getMetrics, getUptime } from "./service/metrics.js";

const app = express();
const port = process.env.PORT || 3000;
app.set("trust proxy", true);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
  }),
);
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

async function startServer() {
  try {
    await redisClient.connect();
    console.log("Redis Connected");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
}

startServer();
