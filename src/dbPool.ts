import { Pool } from "pg";

import * as dotenv from "dotenv";

dotenv.config();

export function getPool(): Pool {
  const {
    POSTGRES_DB_HOST,
    POSTGRES_DB_PORT,
    POSTGRES_DB_displayName,
    POSTGRES_DB_PASSWORD,
    POSTGRES_DB_DATABASE,
    NODE_ENV,
  } = process.env;

  if (
    !POSTGRES_DB_HOST ||
    !POSTGRES_DB_PORT ||
    !POSTGRES_DB_displayName ||
    !POSTGRES_DB_PASSWORD ||
    !POSTGRES_DB_DATABASE
  ) {
    throw new Error("Missing database configuration");
  }

  return new Pool({
    user: POSTGRES_DB_displayName,
    password: POSTGRES_DB_PASSWORD,
    host: POSTGRES_DB_HOST,
    port: Number(POSTGRES_DB_PORT), // Ensure port is converted to a number
    database: POSTGRES_DB_DATABASE,
    max: 10, // Pool max size
    idleTimeoutMillis: 1000, // Close idle clients after 1 second
  });
}
