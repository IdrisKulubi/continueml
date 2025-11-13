import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { generations } from "../db/schema";
import { sql } from "drizzle-orm";

// Load environment variables
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

async function cleanupInvalidUrls() {
  console.log("🔧 Cleaning up invalid generation URLs...\n");

  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    // Find generations with invalid URLs
    const invalidGenerations = await db
      .select()
      .from(generations)
      .where(sql`${generations.resultUrl} IS NOT NULL AND ${generations.resultUrl} NOT LIKE 'http%'`);

    console.log(`Found ${invalidGenerations.length} generations with invalid URLs\n`);

    if (invalidGenerations.length === 0) {
      console.log("✅ No invalid URLs found!");
      await client.end();
      return;
    }

    // Show what will be cleaned
    invalidGenerations.forEach((gen) => {
      console.log(`- Generation ${gen.id.slice(0, 8)}... has invalid URL: ${gen.resultUrl}`);
    });

    console.log("\n🧹 Setting invalid URLs to null...");

    // Update invalid URLs to null and reset status to queued
    const result = await db
      .update(generations)
      .set({ 
        resultUrl: null,
        status: 'queued',
        completedAt: null,
        errorMessage: null
      })
      .where(sql`${generations.resultUrl} IS NOT NULL AND ${generations.resultUrl} NOT LIKE 'http%'`)
      .returning();

    console.log(`✅ Cleaned up ${result.length} generation(s)\n`);

    await client.end();
    console.log("✨ Done!");
  } catch (error) {
    console.error("❌ Error cleaning up URLs:", error);
    await client.end();
    process.exit(1);
  }
}

cleanupInvalidUrls();
