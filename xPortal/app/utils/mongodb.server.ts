import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const uri = process.env.DATABASE_URL;
let client: MongoClient;

export async function getMongoClient() {
  try {
    if (!client) {
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