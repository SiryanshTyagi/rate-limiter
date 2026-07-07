import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function TestPanel({ setRecentRequests, setRemainingTokens }) {
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState({
    sent: 0,
    allowed: 0,
    blocked: 0,
    totalTime: 0,
    successRate: 0,
  });

  async function runTest(count) {
    setLoading(true);

    const startTime = performance.now();

    const requests = Array.from({ length: count }, async () => {
      const requestStart = performance.now();

      try {
        const response = await fetch(`${API_URL}/`);

        const data = await response.json();

        setRemainingTokens(data.remainingTokens);

        return {
          status: response.status,
          latency: (performance.now() - requestStart).toFixed(2),
          time: new Date().toLocaleTimeString(),
        };
      } catch {
        return {
          status: "ERROR",
          latency: "-",
          time: new Date().toLocaleTimeString(),
        };
      }
    });

    const responses = await Promise.allSettled(requests);

    const endTime = performance.now();

    const requestHistory = responses
      .filter((response) => response.status === "fulfilled")
      .map((response) => response.value);

    setRecentRequests((prev) => [...requestHistory, ...prev].slice(0, 20));

    const allowed = requestHistory.filter(
      (request) => request.status === 200,
    ).length;

    const blocked = requestHistory.filter(
      (request) => request.status === 429,
    ).length;

    setResult({
      sent: count,
      allowed,
      blocked,
      totalTime: (endTime - startTime).toFixed(2),
      successRate: ((allowed / count) * 100).toFixed(1),
    });

    setLoading(false);
  }

  return (
    <div className="test-panel">
      <h2>API Tester</h2>

      <div className="button-group">
        <button disabled={loading} onClick={() => runTest(1)}>
          Send 1 Request
        </button>

        <button disabled={loading} onClick={() => runTest(10)}>
          Send 10 Requests
        </button>

        <button disabled={loading} onClick={() => runTest(100)}>
          Send 100 Requests
        </button>
      </div>

      {loading && <p>Running test...</p>}

      {!loading && result.sent > 0 && (
        <div className="test-result">
          <h3>Last Test</h3>

          <div className="result-grid">
            <div className="result-item">
              <span>Requests Sent</span>
              <strong>{result.sent}</strong>
            </div>

            <div className="result-item">
              <span>Allowed</span>
              <strong>{result.allowed}</strong>
            </div>

            <div className="result-item">
              <span>Blocked</span>
              <strong>{result.blocked}</strong>
            </div>

            {/* <div className="result-item">
              <span>Total Time</span>
              <strong>{result.totalTime} ms</strong>
            </div> */}

            <div className="result-item">
              <span>Success Rate</span>
              <strong>{result.successRate}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestPanel;
