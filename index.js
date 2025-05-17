require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const useragent = require("useragent");
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define schema
const visitorSchema = new mongoose.Schema({
  ip: String,
  browser: String,
  os: String,
  device: String,
  urlAccessed: String,
  timestamp: { type: Date, default: Date.now },
});

const Visitor = mongoose.model("Visitor", visitorSchema);

// Middleware to log visitor info
app.use(async (req, res, next) => {
  const agent = useragent.parse(req.headers["user-agent"]);
  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;

  const visitorData = {
    ip,
    browser: agent.toAgent(),
    os: agent.os.toString(),
    device: agent.device.toString(),
    urlAccessed: req.originalUrl,
  };

  try {
    await Visitor.create(visitorData);
    console.log("👤 Visitor logged:", visitorData);
  } catch (error) {
    console.error("❌ Error saving visitor data:", error);
  }

  next();
});

// Simple routes
app.get("/", (req, res) => {
  res.send("Welcome to Home Page");
});

app.get("/about", (req, res) => {
  res.send("About Page");
});

app.get("/contact", (req, res) => {
  res.send("Contact Page");
});

// View all logs (for testing)
app.get("/logs", async (req, res) => {
  const logs = await Visitor.find().sort({ timestamp: -1 });
  res.json(logs);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
