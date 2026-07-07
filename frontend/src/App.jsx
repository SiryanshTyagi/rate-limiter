import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MetricCard from "./components/MetricCard";
import TestPanel from "./components/TestPanel";
import RecentRequests from "./components/RecentRequest";
import TokenBucket from "./components/TokenBucket";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [remainingTokens, setRemainingTokens] = useState(10);

  function formatUptime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }

    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }

    return `${secs}s`;
  }
  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
          throw new Error("Failed to fetch health");
        }

        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Error fetching health:", error);

        setHealth({
          status: "DOWN",
          redis: "DISCONNECTED",
        });
      }
    }

    async function fetchMetrics() {
      try {
        const response = await fetch(`${API_URL}/metrics`);

        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const data = await response.json();

        setMetrics(data);
        setRemainingTokens(data.remainingTokens);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }

    // Initial fetch
    fetchHealth();
    fetchMetrics();

    // Polling
    const healthInterval = setInterval(fetchHealth, 5000);
    const metricsInterval = setInterval(fetchMetrics, 2000);

    // Cleanup
    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  return (
    <div className="app">
      <Navbar health={health} />

      <div className="metrics-grid">
        <MetricCard
          title="Total Requests"
          value={metrics ? metrics.totalRequests : "--"}
        />

        <MetricCard
          title="Allowed Requests"
          value={metrics ? metrics.allowedRequests : "--"}
        />

        <MetricCard
          title="Blocked Requests"
          value={metrics ? metrics.blockedRequests : "--"}
        />

        <MetricCard
          title="Server Uptime"
          value={metrics ? formatUptime(metrics.uptime) : "--"}
        />
      </div>

      <TokenBucket tokens={remainingTokens} bucketSize={10} />

      <TestPanel
        setRecentRequests={setRecentRequests}
        setRemainingTokens={setRemainingTokens}
      />
      <RecentRequests requests={recentRequests} />
    </div>
  );
}

export default App;
