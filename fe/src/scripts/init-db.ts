import mongoose from "mongoose";
import * as dotnenv from "dotenv";
import path from "path";

// 1. Load environment variables manually since this runs outside Next.js runtime
dotnenv.config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URI = process.env.DATABASE_URI || "";

if (!DATABASE_URI) {
  console.error("❌ Error: DATABASE_URI is not defined in your .env file.");
  process.exit(1);
}

async function runInitialization() {
  console.log("🚀 Starting Database Infrastructure Initialization...");

  try {
    await mongoose.connect(DATABASE_URI);
    console.log("📡 Connected to MongoDB successfully.");

    await import("../features/video/models/video");

    console.log("⚙️ Syncing database indexes...");
    await mongoose.syncIndexes();
    console.log("✅ Indexes synchronized successfully.");

    console.log("🎉 Database initialization completed successfully.");
    process.exit(0); // Exit clean
  } catch (error) {
    console.error("💥 Database initialization failed:", error);
    process.exit(1); // Exit with failure code to halt the app startup
  } finally {
    await mongoose.disconnect();
  }
}

runInitialization();
