import "dotenv/config";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import bugsRouter from "./routes/bugs.js";
import submissionsRouter from "./routes/submissions.js";
import statsRouter from "./routes/stats.js";

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/bugs", bugsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/stats", statsRouter);

app.use("/api/feedback/:formId", (req, res, next) => {
  req.params.formId;
  next();
});

async function start() {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set. Starting server without database.");
  } else {
    try {
      await mongoose.connect(MONGODB_URI, { dbName: "bugpilot" });
      console.log("Connected to MongoDB → database: bugpilot");
    } catch (err) {
      console.warn(
        "MongoDB connection failed. Starting server without database. " +
          err.message
      );
    }
  }

  app.listen(PORT, () => {
    console.log(`BugPilot server running on http://localhost:${PORT}`);
  });
}

start();
