// Adds sample events so the home page is not empty. Run once: npm run seed
import "dotenv/config";
import { getDb } from "../db.js";

const day = 24 * 60 * 60 * 1000;
const at = (days, hour, minute = 0) => {
  const d = new Date(Date.now() + days * day);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const sample = [
  ["Winter Clothes Distribution", "Donation", "Mirpur 10, Dhaka", at(6, 10), 60, 24,
    "We are handing out warm jackets, sweaters and socks to families who sleep outside near the Mirpur 10 roundabout. Bring clean clothes you no longer wear, or come to help sort and hand them out.",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80"],
  ["Blanket Distribution for the Needy", "Donation", "Mohammadpur, Dhaka", at(9, 17), 40, 11,
    "Volunteers will walk through the Mohammadpur Town Hall area after Asr to give blankets to rickshaw pullers and street families. We meet at the gate at 5 pm and finish by 8 pm.",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80"],
  ["Hatirjheel Lakeside Cleanup", "Cleanup", "Hatirjheel, Dhaka", at(12, 7, 30), 50, 19,
    "Gloves and sacks are provided. We will clear plastic and packaging from the walkway and the water edge, then separate what can be recycled. Wear closed shoes.",
    "/events/hatirjheel-cleanup.jpg"],
  ["Tree Planting Morning", "Plantation", "Uttara Sector 10, Dhaka", at(15, 8), 35, 8,
    "Fifty saplings of neem, krishnochura and jackfruit are ready. We will plant them along the lake road and tag each one so neighbours can look after it.",
    "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=900&q=80"],
  ["Community Blood Donation Camp", "Blood Drive", "Dhanmondi 27, Dhaka", at(18, 9), 80, 33,
    "A registered blood bank will run the camp. Please eat before you come and carry a photo ID. Volunteers are also needed at the registration and refreshment tables.",
    "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=900&q=80"],
  ["Free Eye Check-up Camp", "Health Camp", "Tejgaon, Dhaka", at(21, 9, 30), 25, 6,
    "Two eye doctors and a team of nurses will test vision and give free reading glasses to people over 40. We need volunteers for queues, forms and guiding elderly visitors.",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80"],
  ["Weekend Reading Class for Children", "Education", "Korail, Dhaka", at(24, 15), 15, 5,
    "Help children from the neighbourhood practise Bangla and English reading in small groups. Storybooks are provided. Come for an hour or stay for the whole afternoon.",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80"],
  ["Hot Meals for Day Labourers", "Food Distribution", "Jatrabari, Dhaka", at(27, 12), 30, 14,
    "We will cook khichuri and serve 300 plates near the Jatrabari crossing. Volunteers are needed to chop, cook, pack and serve.",
    "https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=900&q=80"],
];

const db = await getDb();
const events = db.collection("events");
await events.deleteMany({ creatorEmail: "team@mohollah.org" });
await events.insertMany(
  sample.map(([title, eventType, location, eventDate, volunteersNeeded, participants, description, thumbnail]) => ({
    title, eventType, location, eventDate, volunteersNeeded, participants, description,
    thumbnail: thumbnail || "",
    creatorEmail: "team@mohollah.org",
    creatorName: "Mohollah Team",
    creatorImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date(),
  }))
);
console.log(`Added ${sample.length} sample events.`);
process.exit(0);
