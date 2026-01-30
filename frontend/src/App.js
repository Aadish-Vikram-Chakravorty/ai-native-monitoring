import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function App() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>API Monitoring Dashboard</h1>

      <h3>Latency Over Time</h3>
      <LineChart width={600} height={300} data={metrics}>
        <XAxis dataKey="created_at" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
        <YAxis />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        <Line type="monotone" dataKey="latency" stroke="#8884d8" />
      </LineChart>

      <h3>Metrics Table</h3>
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
            <tr
              key={m.id}
              style={{
                backgroundColor: m.is_anomaly ? "#ffcccc" : "white"
              }}
            >
              <td>
                {m.api_name}
                {m.is_anomaly && <strong style={{ color: "red" }}> (ANOMALY)</strong>}
              </td>

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
