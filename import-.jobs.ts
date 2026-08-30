import 'dotenv/config';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing in .env');
}

const jobsPath = path.join(process.cwd(), 'jobs.json');

const jobs = JSON.parse(
  readFileSync(jobsPath, 'utf-8'),
);

async function importJobs() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected');

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not available');
    }

    const collection = db.collection('jobs');

    console.log('Clearing old jobs...');

    await collection.deleteMany({});

    console.log(`Inserting ${jobs.length} jobs...`);

    await collection.insertMany(jobs);

    console.log(`✅ ${jobs.length} jobs imported successfully!`);
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

importJobs();