# 🌱 AgroSense AI
### An Event-Driven Intelligent Decision Support System for Small-Scale Farming

---

## 🐳 Local Dev Services (Postgres + Redis)

```bash
# Start Postgres 15 and Redis 7 in the background
docker compose -f docker-compose.dev.yml up -d

# Stop and remove containers (data volumes are preserved)
docker compose -f docker-compose.dev.yml down
```

---

## 📌 Overview
AgroSense AI is a smart farming assistant designed to help small-scale farmers make better decisions using data and Artificial Intelligence.  

The system provides actionable recommendations such as the best time to plant, irrigate, and respond to weather changes — without requiring expensive IoT hardware.

---

## 🚨 Problem Statement
Many farmers, especially in developing regions, rely on guesswork or outdated methods for farming decisions.  
This often leads to:
- Poor crop yields  
- Financial losses  
- Inefficient use of resources  

There is a need for an accessible and intelligent system that provides timely and accurate farming guidance.

---

## 💡 Solution
AgroSense AI combines:
- Real-time weather data  
- Simulated farm inputs (soil, crop type, moisture)  
- AI-based prediction  

To generate smart farming recommendations.

---

## 🧠 Key Features
- 🌦️ Weather-based farming recommendations  
- 🌱 Smart planting and irrigation suggestions  
- ⚠️ Risk alerts (e.g., drought, heavy rainfall)  
- 🤖 AI-powered decision engine  
- 📊 Farmer dashboard for interaction  
- 🔔 Event-driven real-time updates  

---

## 🏗️ System Architecture
The system is built using an **Event-Driven Architecture (EDA)** where actions trigger events that are processed asynchronously.

### 🔄 Event Flow
