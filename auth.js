import { createRemoteJWKSet, jwtVerify } from "jose";

const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

// Better Auth publishes its public signing keys here (jwt plugin).
const jwks = createRemoteJWKSet(new URL(`${clientUrl}/api/auth/jwks`));

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Sign in to continue." });
  }

  try {
    const { payload } = await jwtVerify(token, jwks);
    if (!payload.email) throw new Error("Token has no email");
    req.user = {
      email: payload.email,
      name: payload.name || "Volunteer",
      image: payload.image || "",
    };
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}
