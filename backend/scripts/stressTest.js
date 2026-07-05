const TOTAL_REQUESTS = 100;
const URL = "http://localhost:3000/";

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

  console.log("===== Stress Test Result =====");
  console.log("Total Requests :", TOTAL_REQUESTS);
  console.log("Success        :", success);
  console.log("Rate Limited   :", rateLimited);
  console.log("Errors         :", errors);
  console.log("Time Taken     :", `${duration} ms`);
}

runStressTest();
