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
      console.log('Connected to MongoDB');
    }
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

// Function to close the MongoDB connection
export async function closeMongoClient() {
  if (client) {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
} 