const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Import routes
const botRoutes = require("./src/routes/bot_routes");

// Routes
app.use("/api/bot", botRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "PAAIS Junior",
    timestamp: new Date().toISOString(),
  });
});

// Welcome endpoint
app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to PanAI Sage API - Your intelligent guide to PanAfrican AI Summit",
    endpoints: {
      bot: "/api/bot/chat",
      health: "/health",
      info: "/api/bot/info",
    },
    documentation: "https://github.com/Evans-Junior/chat_bot",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: "The requested endpoint does not exist.",
  });
});

app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 PanAI Sage Bot Server Started!
  
  🌍 Environment: ${process.env.NODE_ENV || "development"}
  📡 Port: ${PORT}
  🤖 Bot Name: PAAIS Junior
  🎯 Service: PAAIS Junior
  
  📊 Health Check: http://localhost:${PORT}/health
  💬 Chat Endpoint: http://localhost:${PORT}/api/bot/chat
  ========================================
  `);
});

module.exports = app;
