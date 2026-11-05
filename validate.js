export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Food Distribution",
  "Blood Drive",
  "Education",
  "Health Camp",
];

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// existingDate lets an owner edit other fields of an event without moving its date.
export function validateEvent(body = {}, { existingDate } = {}) {
  const errors = {};
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const eventType = String(body.eventType ?? "");
  const thumbnail = String(body.thumbnail ?? "").trim();
  const location = String(body.location ?? "").trim();
  const date = new Date(body.eventDate);
  const volunteersNeeded = Number.parseInt(body.volunteersNeeded ?? 20, 10);

  if (title.length < 5 || title.length > 80) errors.title = "Use 5 to 80 characters for the title.";
  if (description.length < 30 || description.length > 1000)
    errors.description = "Describe the event in 30 to 1000 characters.";
  if (!EVENT_TYPES.includes(eventType)) errors.eventType = "Pick an event type from the list.";
  if (!isHttpUrl(thumbnail)) errors.thumbnail = "Enter a full image link starting with http:// or https://.";
  if (location.length < 3 || location.length > 100) errors.location = "Enter the place where people should meet.";

  if (Number.isNaN(date.getTime())) {
    errors.eventDate = "Choose a valid date and time.";
  } else {
    const unchanged = existingDate && date.getTime() === new Date(existingDate).getTime();
    if (date <= new Date() && !unchanged) errors.eventDate = "The event date must be in the future.";
  }

  if (Number.isNaN(volunteersNeeded) || volunteersNeeded < 1 || volunteersNeeded > 1000)
    errors.volunteersNeeded = "Enter a number of volunteers between 1 and 1000.";

  return {
    errors,
    data: { title, description, eventType, thumbnail, location, eventDate: date, volunteersNeeded },
  };
}
