import { MongoClient } from "mongodb";

let pending;

// One shared connection. On serverless hosts the promise is reused between calls.
export function getDb() {
  if (!pending) {
    pending = (async () => {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(process.env.DB_NAME || "mohollah");
      await db.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
      await db.collection("events").createIndex({ eventDate: 1 });
      return db;
    })().catch((err) => {
      pending = undefined;
      throw err;
    });
  }
  return pending;
}
