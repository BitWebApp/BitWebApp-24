import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * Global cache across serverless warm invocations (Vercel)
 * and hot-reloads in development.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Ensures the MongoDB URI includes the DB name properly without breaking
 * query parameters (e.g. ?retryWrites=true&w=majority).
 */
const formatMongoUri = (rawUri, dbName) => {
  if (!rawUri) return "";
  try {
    const parsed = new URL(rawUri);
    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = `/${dbName}`;
    }
    return parsed.toString();
  } catch {
    if (!rawUri.includes(dbName) && !rawUri.includes("?")) {
      return rawUri.endsWith("/") ? `${rawUri}${dbName}` : `${rawUri}/${dbName}`;
    }
    return rawUri;
  }
};

const connectDB = async () => {
  // If already connected, return cached connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection is in-flight, await the existing promise
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  // MongoDB Atlas M0 has a hard limit of 500 connections.
  // Default maxPoolSize is 100 in mongoose/mongodb driver, which quickly exhausts
  // the cluster limit when Vercel scales out serverless functions.
  // Limiting maxPoolSize (default 10) prevents connection exhaustion on serverless.
  const maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE) || 10;
  const minPoolSize = Number(process.env.MONGODB_MIN_POOL_SIZE) || 0;
  const maxIdleTimeMS = Number(process.env.MONGODB_MAX_IDLE_TIME_MS) || 10000;

  const opts = {
    dbName: DB_NAME,
    bufferCommands: false,
    maxPoolSize,
    minPoolSize,
    maxIdleTimeMS,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  const uri = formatMongoUri(rawUri, DB_NAME);

  cached.promise = mongoose
    .connect(uri, opts)
    .then((mongooseInstance) => {
      console.log(
        `\n Mongodb connected !! DB HOST:${mongooseInstance.connection.host}`
      );
      return mongooseInstance;
    })
    .catch((error) => {
      console.error("MONGODB connection failed:", error);
      cached.promise = null;
      cached.conn = null;
      throw error;
    });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;

