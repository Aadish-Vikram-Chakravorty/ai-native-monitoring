# AI-Native API Monitoring System

This project is an AI-assisted API monitoring system designed to explore how modern applications can combine traditional observability metrics with Large Language Models (LLMs) to improve incident understanding and debugging workflows.

The focus is not on replacing monitoring tools, but on **augmenting observability data with AI-generated summaries** to make incidents easier to interpret.

---

## Motivation

API monitoring tools often generate large volumes of metrics and alerts, which can be difficult to interpret quickly during failures.

This project was built to learn:
- How monitoring data flows through a system
- How anomalies can be detected from basic time-series metrics
- How LLMs can help summarize incidents in a human-readable way

---

## Core Features

- Collection of API latency and error metrics
- Visualization of metrics through a web dashboard
- Basic anomaly detection on latency trends
- AI-generated incident summaries using LLMs
- Configurable alert thresholds for monitored APIs
- Synthetic traffic generation to simulate real API behavior

---

## System Architecture

- **Monitoring Agent**: Lightweight service that captures API metrics
- **Backend API**: Node.js service for storing, processing, and analyzing metrics
- **Database**: PostgreSQL for persistent storage of monitoring data
- **AI Layer**: LLM integration to generate concise incident summaries
- **Frontend Dashboard**: React-based UI for visualizing metrics and alerts

The system is designed in a modular way, separating metric ingestion, analysis, and AI summarization.

---

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **AI**: OpenAI / local LLM (Ollama)
- **Data Processing**: Python (for anomaly detection experiments)
- **Dev Tools**: Docker, Git, Postman

---

## Current Status

🚧 **Actively under development**

---

## Example Workflow

1. APIs emit latency and error metrics through the monitoring agent  
2. Metrics are stored and analyzed for abnormal patterns  
3. When anomalies are detected, an LLM generates a short incident summary  
4. Engineers view metrics and summaries through the dashboard  

This workflow simulates how AI can assist engineers in understanding system behavior.

---

## Future Improvements

- Support for additional metrics (CPU, memory, throughput)
- Advanced anomaly detection techniques
- Correlation of multiple metrics during incidents
- Exportable incident reports
- Integration with external alerting systems

---

## Why This Project?

This project was built to gain hands-on experience with:
- Observability and monitoring fundamentals
- Time-series data analysis
- Practical usage of LLMs in engineering systems
- Designing AI-assisted developer tooling

---

## Getting Started (Local)

```bash
# Clone the repository
git clone https://github.com/Aadish-Vikram-Chakravorty/ai-native-monitoring.git

# Start services
docker-compose up
