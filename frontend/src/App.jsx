import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Error fetching health data:", error);
        setHealth({ status: "DOWN", redis: "DISCONNECTED" });
      }
    }

    fetchHealth();
  });

  return (
    <div className="app">
      <Navbar />
    </div>
  );
}

export default App;
