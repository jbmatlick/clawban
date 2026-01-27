/**
 * Storage service for JSON file-based persistence
 * Easy to migrate to a database later
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lockfile from 'proper-lockfile';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable or fallback to relative path
// In production (Railway), DATA_DIR should be /app/backend/data (mounted volume)
// In development, it's relative to the compiled code location
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

/**
 * Ensure data directory and file exist
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks: [] }, null, 2));
  }
}

/**
 * Read data from JSON file
 */
export async function readData<T>(): Promise<T> {
  await ensureDataFile();
  const data = await fs.readFile(TASKS_FILE, 'utf-8');
  return JSON.parse(data) as T;
}

/**
 * Write data to JSON file
 */
export async function writeData<T>(data: T): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Execute a function with file locking to prevent race conditions
 * This ensures read-modify-write operations are atomic
 */
export async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDataFile();
  const release = await lockfile.lock(TASKS_FILE, { 
    retries: { retries: 5, minTimeout: 100, maxTimeout: 1000 } 
  });
  try {
    return await fn();
  } finally {
    await release();
  }
}
