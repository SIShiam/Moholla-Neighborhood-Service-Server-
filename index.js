
import "dotenv/config";
import express from "express";
import cors from "cors";
import { eventsRouter } from "./routes/events.js";
import { joinsRouter } from "./routes/joins.js";

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://moholla-client.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

// API Health Check
app.get("/", (req, res) =>
  res.json({
    name: "Mohollah API",
    status: "ok",
  })
);

// API Routes
app.use(eventsRouter);
app.use(joinsRouter);

// 404 Error Handler
app.use((req, res) =>
  res.status(404).json({
    message: "That route does not exist.",
  })
);

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Server Error]:", err);

  res.status(500).json({
    message: "The server hit a problem. Try again in a moment.",
    detail: err.message || String(err),
  });
});

// Start Local Server
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Mohollah API listening on port ${port}`);
  });
}

export default app;
