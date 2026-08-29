import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import bugsRouter from "./routes/bugs.js";
import submissionsRouter from "./routes/submissions.js";
import statsRouter from "./routes/stats.js";

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
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
  try {
    if (!MONGODB_URI) {
      console.warn("MONGODB_URI not set. Running without database.");
    } else {
      await mongoose.connect(MONGODB_URI, { dbName: "bugpilot" });
      console.log("Connected to MongoDB → database: bugpilot");
    }

    app.listen(PORT, () => {
      console.log(`BugPilot server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
