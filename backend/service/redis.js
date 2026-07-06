import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

redisClient.connect().then(() => {
  console.log("Redis Connected");
}).catch((err) => {
  console.log("Redis Connection Failed:", err.message);
});

export default redisClient;
