import { MongoClient } from 'mongodb';

function getDatabaseUrl(env: any): string {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }
  return env.DATABASE_URL;
}

let client: MongoClient;

export async function getMongoClient(env: any) {
  try {
    if (!client) {
      const uri = getDatabaseUrl(env);
      client = new MongoClient(uri);
      await client.connect();
    }
    return client;
  } catch (error) {
    throw new Error('Failed to connect to MongoDB');
  }
}

// Function to close the MongoDB connection
export async function closeMongoClient() {
  if (client) {
    await client.close();
  }
} 