import { Router } from "express";
import { getDb } from "../db.js";
import { requireAuth } from "../auth.js";
import { toId, wrap } from "../utils.js";

export const joinsRouter = Router();

// Join an event. One person can join an event once.
joinsRouter.post(
  "/events/:id/join",
  requireAuth,
  wrap(async (req, res) => {
    const db = await getDb();
    const eventId = toId(req.params.id);
    const event = eventId && (await db.collection("events").findOne({ _id: eventId }));

    if (!event) return res.status(404).json({ message: "We could not find that event." });
    if (event.eventDate <= new Date()) {
      return res.status(400).json({ message: "This event has already taken place." });
    }
    if (event.participants >= event.volunteersNeeded) {
      return res.status(409).json({ message: "This event already has all the volunteers it needs." });
    }

    try {
      await db.collection("joins").insertOne({
        eventId,
        eventTitle: event.title,
        userEmail: req.user.email,
        userName: req.user.name,
        userImage: req.user.image,
        joinedAt: new Date(),
      });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: "You have already joined this event." });
      throw err;
    }

    await db.collection("events").updateOne({ _id: eventId }, { $inc: { participants: 1 } });
    res.status(201).json({ message: "You have joined this event." });
  })
);

// Leave an event you joined earlier.
joinsRouter.delete(
  "/events/:id/join",
  requireAuth,
  wrap(async (req, res) => {
    const db = await getDb();
    const eventId = toId(req.params.id);
    if (!eventId) return res.status(404).json({ message: "We could not find that event." });

    const removed = await db.collection("joins").deleteOne({ eventId, userEmail: req.user.email });
    if (!removed.deletedCount) return res.status(404).json({ message: "You have not joined this event." });

    await db.collection("events").updateOne({ _id: eventId }, { $inc: { participants: -1 } });
    res.json({ message: "You have left this event." });
  })
);

// Has the signed-in user joined this event?
joinsRouter.get(
  "/events/:id/membership",
  requireAuth,
  wrap(async (req, res) => {
    const eventId = toId(req.params.id);
    const found = eventId && (await (await getDb()).collection("joins").findOne({ eventId, userEmail: req.user.email }));
    res.json({ joined: Boolean(found) });
  })
);

// Events the signed-in user joined, sorted by event date.
joinsRouter.get(
  "/joined",
  requireAuth,
  wrap(async (req, res) => {
    const db = await getDb();
    const list = await db
      .collection("joins")
      .aggregate([
        { $match: { userEmail: req.user.email } },
        { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
        { $unwind: "$event" },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$event", { joinedAt: "$joinedAt" }] } } },
        { $sort: { eventDate: 1 } },
      ])
      .toArray();
    res.json(list);
  })
);
