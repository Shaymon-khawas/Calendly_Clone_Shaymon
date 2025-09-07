import "reflect-metadata";
import "dotenv/config";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/app.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middeware";
import { BadRequestException } from "./utils/app-error";
import { initializeDatabase, closeDatabase } from "./database/database";
import authRoutes from "./routes/auth.route";
import passport from "passport";
import eventRoutes from "./routes/event.route";
import availabilityRoutes from "./routes/availability.route";
import integrationRoutes from "./routes/integration.route";
import meetingRoutes from "./routes/meeting.route";

// Memory optimization: Set max old space size
if (process.env.NODE_ENV === "production") {
  process.env.NODE_OPTIONS = "--max-old-space-size=512";
}

const app = express();
const BASE_PATH = config.BASE_PATH;

// Memory optimization: Limit request body size
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(passport.initialize());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Meetly API is running successfully!",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/event`, eventRoutes);
app.use(`${BASE_PATH}/availability`, availabilityRoutes);
app.use(`${BASE_PATH}/integration`, integrationRoutes);
app.use(`${BASE_PATH}/meeting`, meetingRoutes);

app.use(errorHandler);

const port = parseInt(process.env.PORT || "10000", 10);

console.log("🚀 Starting server...");
console.log("Environment variables:");
console.log("PORT:", port);
console.log("NODE_ENV:", config.NODE_ENV);
console.log("DATABASE_URL:", config.DATABASE_URL ? "SET" : "NOT SET");

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`);
  try {
    await closeDatabase();
    console.log("Database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Memory monitoring
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log("Memory usage:", {
      rss: Math.round(memUsage.rss / 1024 / 1024) + " MB",
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
      external: Math.round(memUsage.external / 1024 / 1024) + " MB",
    });
  }, 30000); // Log every 30 seconds
}

app.listen(port, "0.0.0.0", async () => {
  console.log("📡 Server started, initializing database...");
  try {
    await initializeDatabase();
    console.log(`✅ Server listening on port ${port} in ${config.NODE_ENV}`);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
});
