const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./db");

app.use(express.json());
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Save metrics in DB with anomaly detection
app.post("/api/metrics", async (req, res) => {
  const { apiName, latency, errorCount } = req.body;

  if (!apiName || latency === undefined || errorCount === undefined) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // Get last 10 latencies
    const result = await pool.query(
      "SELECT latency FROM metrics ORDER BY created_at DESC LIMIT 10"
    );

    let isAnomaly = false;

    if (result.rows.length > 0) {
      const latencies = result.rows.map(r => r.latency);
      const avg =
        latencies.reduce((a, b) => a + b, 0) / latencies.length;

      if (latency > avg * 1.5) {
        isAnomaly = true;
        console.log("🚨 ALERT: High latency detected for", apiName);
      }
    }

    await pool.query(
      "INSERT INTO metrics (api_name, latency, error_count, is_anomaly) VALUES ($1, $2, $3, $4)",
  [apiName, latency, errorCount, isAnomaly]
    );

    res.status(201).json({
      message: "Metric saved",
      anomaly: isAnomaly
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

// Fetch metrics from DB
app.get("/api/metrics", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM metrics ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
