import React, { useEffect, useState } from "react";

function App() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error("Error fetching metrics:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>API Monitoring Dashboard</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>API Name</th>
            <th>Latency (ms)</th>
            <th>Error Count</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.id}>
              <td>{m.api_name}</td>
              <td>{m.latency}</td>
              <td>{m.error_count}</td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
