import { Migration } from "../db/migration";
import { afterAll, afterEach, beforeEach } from "@jest/globals";
import { getPool } from "../dbPool";

export const setupTestDB = () => {
  const pool = getPool();
  const migration = new Migration(pool);

  beforeEach(async () => {
    try {
      await migration.migrate();
      // console.log("Migration successful");
    } catch (error) {
      console.error("Error during migration in beforeAll: ", error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await migration.drop();
      // console.log("Migration drop successful after tests");
    } catch (error) {
      console.error("Error during migration drop in afterAll: ", error);
      throw error;
    }
  });

  afterAll(async () => {
    await pool.end();
  });
};
