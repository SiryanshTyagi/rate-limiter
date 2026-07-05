import express from "express";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(express.json());
app.use(rateLimiter); // Apply the rate limiter middleware to all routes

app.get("/", (req, res) => {
  res.send("rate limmiter app");
});

const port = 3000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
