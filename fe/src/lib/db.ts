import mongoose from "mongoose";

const DATABASE_URI = process.env.DATABASE_URI || "";

console.log("DATABASE_URI:", DATABASE_URI);

if (!DATABASE_URI) {
  throw new Error(
    "Please define the DATABASE_URI environment variable inside your .env file.",
  );
}

// Cache the connection across hot-reloads in development mode
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(DATABASE_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
