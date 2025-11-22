import { MongoClient } from 'mongodb';

// Cache connection for serverless environments
let client;
let clientPromise;
let db;
let dbInitialized = false;

// MongoDB connection options optimized for serverless
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

function getClient() {
  if (!clientPromise) {
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Please define the DATABASE_URL or MONGODB_URI environment variable');
    }

    // In development, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    // In production, this will be a new connection each time
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      // In production, create a new client each time (serverless)
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
  }
  return clientPromise;
}

export async function getDb() {
  if (!db) {
    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'tinylink';
    db = client.db(dbName);
  }
  return db;
}

export async function getCollection(name = 'links') {
  try {
    const database = await getDb();
    return database.collection(name);
  } catch (error) {
    console.error('Error getting collection:', error);
    // Reset connection on error
    if (typeof global !== 'undefined' && global._mongoClientPromise) {
      global._mongoClientPromise = null;
    }
    client = null;
    clientPromise = null;
    db = null;
    throw error;
  }
}

export async function initDatabase() {
  if (dbInitialized) return;
  
  try {
    const collection = await getCollection('links');
    
    // Create unique index on code field
    try {
      await collection.createIndex({ code: 1 }, { unique: true });
    } catch (error) {
      // Index might already exist, that's okay
      if (error.code !== 85) { // 85 is index already exists error
        console.error('Error creating code index:', error);
      }
    }
    
    // Create index on created_at for faster sorting
    try {
      await collection.createIndex({ created_at: -1 });
    } catch (error) {
      // Index might already exist, that's okay
      if (error.code !== 85) {
        console.error('Error creating created_at index:', error);
      }
    }
    
    dbInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw, allow retry on next call
    dbInitialized = false;
  }
}

// Auto-initialize on first API call (for serverless environments)
export async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase();
  }
}

// Close connection (useful for cleanup)
export async function closeConnection() {
  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
    client = null;
    clientPromise = null;
    db = null;
    dbInitialized = false;
  }
}
