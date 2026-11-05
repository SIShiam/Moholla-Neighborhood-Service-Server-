import { Router } from "express";
import { getDb } from "../db.js";
import { requireAuth } from "../auth.js";
import { validateEvent } from "../validate.js";
import { escapeRegex, toId, wrap } from "../utils.js";

export const eventsRouter = Router();

const events = async () => (await getDb()).collection("events");

// Public: upcoming events only, soonest first. ?limit=6&search=mirpur&type=Cleanup
eventsRouter.get(
  "/events",
  wrap(async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const type = String(req.query.type ?? "");
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 0, 50);

    const filter = { eventDate: { $gte: new Date() } };
    if (type) filter.eventType = type;
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ title: pattern }, { location: pattern }];
    }

    const cursor = (await events()).find(filter).sort({ eventDate: 1 });
    if (limit > 0) cursor.limit(limit);
    res.json(await cursor.toArray());
  })
);

// Private: events created by the signed-in user.
eventsRouter.get(
  "/my-events",
  requireAuth,
  wrap(async (req, res) => {
    const list = await (await events()).find({ creatorEmail: req.user.email }).sort({ eventDate: 1 }).toArray();
    res.json(list);
  })
);

eventsRouter.get(
  "/events/:id",
  wrap(async (req, res) => {
    const _id = toId(req.params.id);
    const event = _id && (await (await events()).findOne({ _id }));
    if (!event) return res.status(404).json({ message: "We could not find that event. It may have been removed." });
    res.json(event);
  })
);

eventsRouter.post(
  "/events",
  requireAuth,
  wrap(async (req, res) => {
    const { errors, data } = validateEvent(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Please fix the highlighted fields.", errors });
    }

    const doc = {
      ...data,
      creatorEmail: req.user.email,
      creatorName: req.user.name,
      creatorImage: req.user.image,
      participants: 0,
      createdAt: new Date(),
    };
    const result = await (await events()).insertOne(doc);
    res.status(201).json({ _id: result.insertedId });
  })
);

eventsRouter.put(
  "/events/:id",
  requireAuth,
  wrap(async (req, res) => {
    const _id = toId(req.params.id);
    const col = await events();
    const existing = _id && (await col.findOne({ _id }));

    if (!existing) return res.status(404).json({ message: "We could not find that event." });
    if (existing.creatorEmail !== req.user.email) {
      return res.status(403).json({ message: "Only the person who created this event can edit it." });
    }

    const { errors, data } = validateEvent(req.body, { existingDate: existing.eventDate });
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Please fix the highlighted fields.", errors });
    }

    await col.updateOne({ _id }, { $set: { ...data, updatedAt: new Date() } });
    res.json({ message: "Event updated." });
  })
);

eventsRouter.delete(
  "/events/:id",
  requireAuth,
  wrap(async (req, res) => {
    const _id = toId(req.params.id);
    const db = await getDb();
    const existing = _id && (await db.collection("events").findOne({ _id }));

    if (!existing) return res.status(404).json({ message: "We could not find that event." });
    if (existing.creatorEmail !== req.user.email) {
      return res.status(403).json({ message: "Only the person who created this event can delete it." });
    }

    await db.collection("events").deleteOne({ _id });
    await db.collection("joins").deleteMany({ eventId: _id });
    res.json({ message: "Event deleted." });
  })
);
