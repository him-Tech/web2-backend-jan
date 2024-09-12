import { getPool } from "../src/dbPool";
import { Migration } from "../src/db/migration";

async function main() {
  const pool = getPool();
  const migration = new Migration(pool);
  await migration.migrate();
}

main();
