import { MongoClient } from "mongodb";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
    console.log("Using DNS servers:", servers);
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

if (!dbName) {
  throw new Error("MONGODB_DB is missing in .env");
}

const client = new MongoClient(uri);

let database = null;

export async function connectDB() {
  if (database) {
    return database;
  }

  await client.connect();

  database = client.db(dbName);

  await database.command({ ping: 1 });

  console.log("MongoDB connected successfully!");
  console.log(`Database: ${dbName}`);

  return database;
}

export function getDB() {
  if (!database) {
    throw new Error("Database is not connected.");
  }

  return database;
}