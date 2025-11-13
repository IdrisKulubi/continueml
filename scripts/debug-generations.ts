import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { generations } from "../db/schema";
import { desc } from "drizzle-orm";

// Load environment variables
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

async function debugGenerations() {
  console.log("🔍 Debugging generations...\n");

  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    // Get last 10 generations
    const recentGenerations = await db
      .select()
      .from(generations)
      .orderBy(desc(generations.createdAt))
      .limit(10);

    console.log(`Found ${recentGenerations.length} recent generations:\n`);

    recentGenerations.forEach((gen, index) => {
      console.log(`${index + 1}. Generation ${gen.id.slice(0, 8)}...`);
      console.log(`   Status: ${gen.status}`);
      console.log(`   Tool: ${gen.tool}`);
      console.log(`   Result URL: ${gen.resultUrl || "null"}`);
      console.log(`   Error: ${gen.errorMessage || "none"}`);
      console.log(`   Created: ${gen.createdAt}`);
      console.log(`   Completed: ${gen.completedAt || "not completed"}`);
      console.log("");
    });

    await client.end();
  } catch (error) {
    console.error("❌ Error:", error);
    await client.end();
    process.exit(1);
  }
}

debugGenerations();
