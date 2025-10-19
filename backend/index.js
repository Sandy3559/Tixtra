import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import solutionRoutes from "./routes/solution.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-created.js";
import {
  onTicketStatusUpdated,
  onTicketReassigned,
} from "./inngest/functions/on-ticket-status-update.js";
import { onSolutionSubmitted } from "./inngest/functions/on-solution-submitted.js";

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      inngest: "active",
    },
  });
});

// API Routes
app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/solutions", solutionRoutes); 

// Inngest endpoint with all functions
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [
      onUserSignup,
      onTicketCreated,
      onTicketStatusUpdated,
      onTicketReassigned,
      onSolutionSubmitted,
    ],
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

  mongoose.connection.close(() => {
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log("🚀 Server running on http://localhost:" + PORT);
    console.log("📋 API available at http://localhost:" + PORT + "/api");
    console.log(
      "⚡ Inngest endpoint at http://localhost:" + PORT + "/api/inngest"
    );
    console.log("🏥 Health check at http://localhost:" + PORT + "/health");
    console.log(
      "🎯 Solution API at http://localhost:" + PORT + "/api/solutions"
    );

    if (process.env.NODE_ENV === "development") {
      console.log("\n🔧 Development mode features:");
      console.log("   - Detailed error messages");
      console.log("   - CORS enabled for localhost:5173");
      console.log("   - Enhanced logging");
      console.log("   - Solution management system");
    }
  });

  // Handle server errors
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", err);
    }
  });
});

export default app;