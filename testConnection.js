import { Client } from "pg";

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_ea58yXYnKHWd@ep-royal-firefly-amjq3h7v.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function main() {
  try {
    await client.connect();
    console.log("✅ Connection successful!");
    await client.end();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

main();