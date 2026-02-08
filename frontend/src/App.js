import React, { useEffect, useState } from "react";
import "./App.css";
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
  const [selectedApi, setSelectedApi] = useState("ALL");
  const [alerts, setAlerts] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [latestInsight, setLatestInsight] = useState("");

  // Was system anomalous last time?
  const [wasAnomalous, setWasAnomalous] = useState(
    localStorage.getItem("wasAnomalous") === "true"
  );

  // Which anomaly has user acknowledged?
  const [acknowledgedAnomalyId, setAcknowledgedAnomalyId] = useState(
    localStorage.getItem("acknowledgedAnomalyId")
  );

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchMetrics = () => {
      fetch("http://localhost:5000/api/metrics")
        .then((res) => res.json())
        .then((data) => {
          setMetrics(data);

          const anomalyAlerts = data.filter((m) => m.is_anomaly);
          setAlerts(anomalyAlerts);

          if (data.length === 0) return;

          // Always find latest record by time
          const latestRecord = [...data].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )[0];

          const isCurrentlyAnomalous = latestRecord.is_anomaly;
          const latestAnomalyId = latestRecord.id;

          /*
            POPUP RULE:
            Show popup only when:
            1) Previously NORMAL
            2) Now ANOMALY
            3) This anomaly is NOT acknowledged yet
          */
          if (!wasAnomalous && isCurrentlyAnomalous && String(latestAnomalyId) !== String(acknowledgedAnomalyId)) {
            setShowPopup(true);

            const recent = sortedForGraph.slice(-5).map(m => m.latency);

            fetch("http://localhost:5000/api/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apiName: latestRecord.api_name,
                latency: latestRecord.latency,
                recentLatencies: recent,
              }),
            })
              .then(res => res.json())
              .then(data => {
                setAiInsight(data.summary);
                setLatestInsight(data.summary);
              })
              .catch(() => setAiInsight("AI could not analyze this anomaly."));
          }

          // Save current state
          setWasAnomalous(isCurrentlyAnomalous);
          localStorage.setItem("wasAnomalous", isCurrentlyAnomalous);
        })
        .catch((err) => console.error(err));
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [wasAnomalous, acknowledgedAnomalyId]);

  const apiNames = ["ALL", ...new Set(metrics.map((m) => m.api_name))];

  const filteredMetrics =
    selectedApi === "ALL"
      ? metrics
      : metrics.filter((m) => m.api_name === selectedApi);

  // Graph: old → new
  const sortedForGraph = [...filteredMetrics].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  // Table: new → old
  const sortedForTable = [...filteredMetrics].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const totalRequests = filteredMetrics.length;
  const anomalyCount = filteredMetrics.filter((m) => m.is_anomaly).length;
  const avgLatency =
    filteredMetrics.length > 0
      ? Math.round(
        filteredMetrics.reduce((a, b) => a + b.latency, 0) /
        filteredMetrics.length
      )
      : 0;

  return (
    <div className="container">
      <div className="header">API Monitoring Dashboard</div>

      <div style={{ marginBottom: "15px" }}>
        <label><strong>Select API: </strong></label>
        <select
          value={selectedApi}
          onChange={(e) => setSelectedApi(e.target.value)}
        >
          {apiNames.map((api) => (
            <option key={api} value={api}>{api}</option>
          ))}
        </select>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "20px 30px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)"
          }}>
            🚨 <strong>New anomaly detected!</strong>
            <p style={{ marginTop: "10px" }}>
              🧠 AI Insight: {aiInsight || "Analyzing..."}
            </p>
            <div style={{ textAlign: "right", marginTop: "15px" }}>
              <button
                onClick={() => {
                  setShowPopup(false);

                  // Acknowledge this anomaly
                  const latest = [...metrics].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )[0];

                  setAcknowledgedAnomalyId(latest.id);
                  localStorage.setItem("acknowledgedAnomalyId", latest.id);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cards">
        <div className="card">
          <h3>Total Records</h3>
          <p>{totalRequests}</p>
        </div>
        <div className="card">
          <h3>Anomalies</h3>
          <p>{anomalyCount}</p>
        </div>
        <div className="card">
          <h3>Avg Latency</h3>
          <p>{avgLatency} ms</p>
        </div>
      </div>

      {latestInsight && (
        <div className="chart-box">
          <h3>🧠 Latest AI Insight</h3>
          <p>{latestInsight}</p>
        </div>
      )}


      <div className="chart-box">
        <h3>Recent Alerts</h3>
        {alerts.length === 0 ? (
          <p>No active alerts</p>
        ) : (
          <ul>
            {[...alerts].reverse().slice(0, 5).map((a) => (
              <li key={a.id}>
                {a.api_name} - High latency ({a.latency} ms)
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chart-box">
        <h3>Latency Over Time</h3>
        <LineChart width={800} height={300} data={sortedForGraph}>
          <XAxis
            dataKey="created_at"
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
          />
          <YAxis />
          <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="latency" stroke="#007bff" />
        </LineChart>
      </div>

      <table>
        <thead>
          <tr>
            <th>API Name</th>
            <th>Latency (ms)</th>
            <th>Error Count</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedForTable.map((m) => (
            <tr key={m.id} className={m.is_anomaly ? "anomaly" : ""}>
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
