import { ObjectId } from "mongodb";

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function toId(value) {
  return ObjectId.isValid(value) && String(new ObjectId(value)) === value ? new ObjectId(value) : null;
}

export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
