import { MongoClient } from "mongodb";

let pending;

// One shared connection. On serverless hosts the promise is reused between calls.
export function getDb() {
  if (!pending) {
    pending = (async () => {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error("MONGODB_URI environment variable is missing in server environment variables!");
      }
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      const db = client.db(process.env.DB_NAME || "mohollah");
      try {
        await db.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
        await db.collection("events").createIndex({ eventDate: 1 });
      } catch (idxErr) {
        console.warn("[MongoDB Index Notice]:", idxErr.message);
      }
      return db;
    })().catch((err) => {
      console.error("[MongoDB connection error]:", err);
      pending = undefined;
      throw err;
    });
  }
  return pending;
}
