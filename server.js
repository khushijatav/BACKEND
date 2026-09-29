const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("./config/db");

const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const counselorRoutes = require("./routes/counselorRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();

// Initialize DB connection eagerly
connectDB().catch((err) => {
  console.warn("[MongoDB] Initial connection pending or failed:", err.message);
});

// Permissive CORS configuration supporting Vercel, localhost, and mobile apps
const corsOptions = {
  origin: (origin, callback) => {
    // Reflect request origin so all domains (Vercel, localhost, mobile) are allowed
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection middleware - non-blocking to prevent 503 outages
app.use(async (req, res, next) => {
  // Allow health checks to run without blocking on DB
  if (req.path === "/" || req.path === "/api/health") {
    return next();
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  } catch (err) {
    console.warn("[Database Connection Warning on Request]", err.message);
  }
  next();
});

// Root route
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.status(200).json({
    status: "ok",
    service: "MindCare Counseling Backend API",
    database: dbState === 1 ? "Connected" : dbState === 2 ? "Connecting" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };
  res.status(200).json({
    uptime: process.uptime(),
    status: "Healthy",
    database: dbStatusMap[dbState] || "Unknown",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/services", serviceRoutes);

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack || err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MindCare Server] Running on http://localhost:${PORT} and http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;