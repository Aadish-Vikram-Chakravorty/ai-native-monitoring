const express = require("express");
const cors = require("cors");
const pool = require("./db");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Per-API acceptable latency limits (ms)
const API_LIMITS = {
  "login-api": 600,
  "payment-api": 800,
};

// Health check
app.get("/", (req, res) => {
  res.send("Server running");
});

// Save metrics with anomaly detection
app.post("/api/metrics", async (req, res) => {
  const { apiName, latency, errorCount } = req.body;

  if (!apiName || latency === undefined || errorCount === undefined) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // Get last 10 records for this API
    const result = await pool.query(
      "SELECT latency FROM metrics WHERE api_name = $1 ORDER BY created_at DESC LIMIT 10",
      [apiName]
    );

    let isAnomaly = false;
    let recentLatencies = [];

    if (result.rows.length > 0) {
      recentLatencies = result.rows.map(r => r.latency);
      const avg =
        recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length;

      const relativeAnomaly = latency > avg * 1.5;
      const absoluteAnomaly =
        API_LIMITS[apiName] && latency > API_LIMITS[apiName];

      if (relativeAnomaly || absoluteAnomaly) {
        isAnomaly = true;
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

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

// AI Analysis Route
app.post("/api/analyze", async (req, res) => {
  const { apiName, latency, recentLatencies } = req.body;

  if (!apiName || !latency || !recentLatencies || recentLatencies.length === 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const prompt = `
You are an SRE assistant.
An API called "${apiName}" suddenly showed high latency.

Recent latencies: ${recentLatencies.join(", ")}
Current latency: ${latency}

Explain:
1. Likely root cause
2. What engineer should check first
Keep it concise.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an expert DevOps engineer." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const analysis = completion.choices[0].message.content;

    res.json({ analysis });

  } catch (err) {
    console.error("AI error:", err.message);
    res.status(500).json({ message: "AI analysis failed" });
  }
});

// Get metrics
app.get("/api/metrics", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM metrics ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
