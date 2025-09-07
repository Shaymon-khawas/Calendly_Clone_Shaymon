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
import { initializeDatabase } from "./database/database";
import authRoutes from "./routes/auth.route";
import passport from "passport";
import eventRoutes from "./routes/event.route";
import availabilityRoutes from "./routes/availability.route";
import integrationRoutes from "./routes/integration.route";
import meetingRoutes from "./routes/meeting.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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

const port = process.env.PORT || 10000;

console.log('🚀 Starting server...');
console.log('Environment variables:');
console.log('PORT:', port);
console.log('NODE_ENV:', config.NODE_ENV);
console.log('DATABASE_URL:', config.DATABASE_URL ? 'SET' : 'NOT SET');

app.listen(port, '0.0.0.0', async () => {
  console.log('📡 Server started, initializing database...');
  try {
    await initializeDatabase();
    console.log(`✅ Server listening on port ${port} in ${config.NODE_ENV}`);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
});
