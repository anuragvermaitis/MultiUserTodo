import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const selfPingUrl = process.env.SELF_PING_URL;
if (selfPingUrl) {
  const intervalMs = Number(process.env.SELF_PING_INTERVAL_MS) || 12 * 60 * 1000;
  setInterval(async () => {
    try {
      await fetch(selfPingUrl, { method: "GET" });
    } catch {
      // best-effort keepalive
    }
  }, intervalMs);
}
