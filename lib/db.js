import { MongoClient } from 'mongodb';

let client;
let db;
let dbInitialized = false;

export async function getDb() {
  if (!db) {
    if (!client) {
      const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('Please define the DATABASE_URL or MONGODB_URI environment variable');
      }
      client = new MongoClient(uri);
      await client.connect();
    }
    const dbName = process.env.MONGODB_DB || 'tinylink';
    db = client.db(dbName);
  }
  return db;
}

export async function getCollection(name = 'links') {
  const database = await getDb();
  return database.collection(name);
}

export async function initDatabase() {
  if (dbInitialized) return;
  
  try {
    const collection = await getCollection('links');
    
    // Create unique index on code field
    await collection.createIndex({ code: 1 }, { unique: true });
    
    // Create index on created_at for faster sorting
    await collection.createIndex({ created_at: -1 });
    
    dbInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
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
    await client.close();
    client = null;
    db = null;
    dbInitialized = false;
  }
}
