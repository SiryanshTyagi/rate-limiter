import dotenv from "dotenv";
dotenv.config();

const TOTAL_REQUESTS = 100;
const URL = process.env.BACKEND_URL;

async function sendRequest() {
  try {
    const response = await fetch(URL, {
      headers: {
        "x-user-id": "john",
      },
    });

    return response.status;
  } catch (err) {
    console.error(err);
    return "ERROR";
  }
}

async function runStressTest() {
  console.log(`Sending ${TOTAL_REQUESTS} concurrent requests...\n`);

  const start = Date.now();

  const promises = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    promises.push(sendRequest());
  }

  const results = await Promise.all(promises);

  const duration = Date.now() - start;

  const success = results.filter((r) => r === 200).length;
  const rateLimited = results.filter((r) => r === 429).length;
  const errors = results.filter((r) => r === "ERROR").length;

  const others = results.filter((r) => r !== 200 && r !== 429 && r !== "ERROR");

  console.log("===== Stress Test Result =====");
  console.log("Total Requests :", TOTAL_REQUESTS);
  console.log("Success        :", success);
  console.log("Rate Limited   :", rateLimited);
  console.log("Other Status Codes:", others);
  console.log("Time Taken     :", `${duration} ms`);
}

runStressTest();
