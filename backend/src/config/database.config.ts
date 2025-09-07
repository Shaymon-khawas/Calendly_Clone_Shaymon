import "dotenv/config";
import path from "path";
import { DataSource } from "typeorm";

import { config } from "./app.config";

export const getDatabaseConfig = () => {
  const isProduction = config.NODE_ENV === "production";
  let databaseUrl = config.DATABASE_URL;

  // Add SSL parameters to the database URL for production
  if (isProduction && databaseUrl) {
    const url = new URL(databaseUrl);
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("sslcert", "");
    url.searchParams.set("sslkey", "");
    url.searchParams.set("sslrootcert", "");
    databaseUrl = url.toString();
  }

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [path.join(__dirname, "../database/entities/*{.ts,.js}")],
    migrations: [path.join(__dirname, "../database/migrations/*{.ts,.js}")],
    synchronize: !isProduction,
    logging: isProduction ? false : ["error"],
    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,
    // Connection pooling and memory optimizations
    extra: {
      max: isProduction ? 10 : 5, // Maximum number of connections in the pool
      min: isProduction ? 2 : 1, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time to wait for a connection
      idle: 10000, // Maximum time a connection can be idle
      evict: 1000, // Time interval to check for idle connections
      handleDisconnects: true, // Automatically reconnect on connection loss
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
            require: true,
          }
        : false,
    },
    // Memory optimizations
    cache: {
      type: "database",
      tableName: "query_result_cache",
      duration: 30000, // 30 seconds cache
    },
  });
};

export const AppDataSource = getDatabaseConfig();
