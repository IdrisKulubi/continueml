import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

// Get pool configuration from environment variables
// Using DATABASE_URL as per the .env.example configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL!,
  min: Number(process.env.POSTGRES_POOL_MIN || 2),
  max: Number(process.env.POSTGRES_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: 5000, // 5 seconds
  maxUses: 10000, // Number of times a connection can be used before being destroyed
};

// Create connection pool optimized for serverless environment
const pool = new Pool(poolConfig);

// Create drizzle instance with the pool and schema
const db = drizzle(pool, { schema });

// Export the db instance and pool for potential direct usage
export { pool };
export default db;
