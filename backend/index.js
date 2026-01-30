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

// Save metrics in DB
app.post("/api/metrics", async (req, res) => {
  const { apiName, latency, errorCount } = req.body;

  if (!apiName || latency === undefined || errorCount === undefined) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    await pool.query(
      "INSERT INTO metrics (api_name, latency, error_count) VALUES ($1, $2, $3)",
      [apiName, latency, errorCount]
    );

    res.status(201).json({ message: "Metric saved in DB" });
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
