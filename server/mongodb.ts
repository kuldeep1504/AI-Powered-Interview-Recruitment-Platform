import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'talentpulse_db';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnected = false;
let connectionAttempted = false;

/**
 * Initializes and connects to MongoDB instance if MONGODB_URI is provided.
 * Gracefully falls back if MONGODB_URI is absent or unreachable.
 */
export async function connectToMongoDB(): Promise<Db | null> {
  if (dbInstance && isConnected) return dbInstance;
  if (!MONGODB_URI) {
    if (!connectionAttempted) {
      console.log('ℹ️ [MongoDB Driver] No MONGODB_URI provided in environment. Operating with primary local document store.');
      connectionAttempted = true;
    }
    return null;
  }

  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });
    }

    await client.connect();
    dbInstance = client.db(MONGODB_DB_NAME);
    isConnected = true;
    console.log(`✅ [MongoDB Driver] Connected to MongoDB database: "${MONGODB_DB_NAME}"`);
    return dbInstance;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Driver] Could not connect to MongoDB cluster (${MONGODB_URI}):`, (error as any).message);
    isConnected = false;
    dbInstance = null;
    return null;
  }
}

export function getMongoDb(): Db | null {
  return isConnected ? dbInstance : null;
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export async function closeMongoConnection() {
  if (client) {
    await client.close();
    isConnected = false;
    dbInstance = null;
  }
}
