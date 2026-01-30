const express = require("express");
const app = express();

app.use(express.json());

// Temporary in-memory storage for metrics
let metricsData = [];

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

// API to receive metrics
app.post("/api/metrics", (req, res) => {
  const { apiName, latency, errorCount } = req.body;

  // basic validation
  if (!apiName || latency === undefined || errorCount === undefined) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const metric = {
    apiName,
    latency,
    errorCount,
    time: new Date()
  };

  metricsData.push(metric);

  console.log("Received metric:", metric);

  res.status(201).json({ message: "Metric received" });
});

// API to view metrics
app.get("/api/metrics", (req, res) => {
  res.json(metricsData);
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
