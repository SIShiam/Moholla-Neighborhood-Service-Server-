import "dotenv/config";
import express from "express";
import cors from "cors";
import { eventsRouter } from "./routes/events.js";
import { joinsRouter } from "./routes/joins.js";

const app = express();

app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "") }));
app.use(express.json({ limit: "100kb" }));


app.get("/", (req, res) => res.json({ name: "Mohollah API", status: "ok" }));
app.use(eventsRouter);
app.use(joinsRouter);

app.use((req, res) => res.status(404).json({ message: "That route does not exist." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "The server hit a problem. Try again in a moment." });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Mohollah API listening on port ${port}`));
}

export default app;
