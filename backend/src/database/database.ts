import "reflect-metadata";
import { AppDataSource } from "../config/database.config";

export const initializeDatabase = async () => {
  try {
    // Check if already initialized
    if (AppDataSource.isInitialized) {
      console.log("Database already connected");
      return;
    }

    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Handle connection errors
    AppDataSource.driver.connection.on("error", (error) => {
      console.error("Database connection error:", error);
    });

    AppDataSource.driver.connection.on("disconnect", () => {
      console.warn("Database disconnected, attempting to reconnect...");
    });
  } catch (error) {
    console.error("Database connection error:", error);
    // Don't exit immediately, try to reconnect
    setTimeout(() => {
      console.log("Attempting to reconnect to database...");
      initializeDatabase();
    }, 5000);
  }
};

export const closeDatabase = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};
