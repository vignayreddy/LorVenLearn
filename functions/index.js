/* eslint-disable max-len */
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

// ── App ──────────────────────────────────────────────────────────
const app = express();

// Allow all origins from the LorvenLearn Firebase Hosting domain
// and localhost for local emulator testing
app.use(cors({
  origin: [
    "https://gen-lang-client-0193065118.web.app",
    "https://gen-lang-client-0193065118.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "LorvenLearn API is running on Firebase Functions",
    timestamp: new Date().toISOString(),
    region: process.env.FUNCTION_REGION || "us-central1",
  });
});

// ── Platform Info ────────────────────────────────────────────────
app.get("/api/info", (req, res) => {
  res.json({
    platform: "LorvenLearn",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    firestoreDb: "ai-studio-371bd5a3-f7f5-47f8-b691-2c68455fa731",
  });
});

// ── AI Chatbot ───────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      console.warn("Gemini AI integration disabled or blocked. Defaulting to Simulated AI.");
      const lower = userMessage.toLowerCase();
      reply = "That's an excellent question! In LorvenLearn, our architecture teaches you how to leverage advanced technologies to build this exact type of logic. Keep exploring the courses!";
      if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) reply = "Welcome back! I'm Lorven AI. Are we diving into React or Cloud Architectures today?";
      else if (lower.includes("price") || lower.includes("cost") || lower.includes("pay")) reply = "Our premium discovery passes are strictly curated to guarantee a high return on investment. Visit the enrollment page for exact figures.";
      else if (lower.includes("react") || lower.includes("js") || lower.includes("javascript")) reply = "React forms the foundational layer of modern web development. Ensure your state management is clean and your components modular!";
      else if (lower.includes("firebase") || lower.includes("database")) reply = "Firebase powers our entire realtime backend architecture. It handles authentication, data syncing, and even cloud functions seamlessly.";
      else if (lower.includes("course") || lower.includes("learn")) reply = "We have over a dozen premium courses available. Head over to the Dashboard to track your progress or the Library to find something new.";
    }

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error (Caught Defaulting to Mock):", error);
    const lower = (req.body.message || "").toLowerCase();
    let reply = "That's an excellent question! In LorvenLearn, our architecture teaches you how to leverage advanced technologies to build this exact type of logic.";
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) reply = "Welcome back! I'm Lorven AI. Are we diving into React or Cloud architectures today?";
    res.json({ reply });
  }
});

// ── Fallback for unmatched /api routes ────────────────────────────
app.use("/api/*", (req, res) => {
  res.status(404).json({error: "API route not found", path: req.path});
});

// ── Export as Firebase Function ───────────────────────────────────
// Do NOT call app.listen() — Firebase manages the HTTP server.
exports.api = functions.https.onRequest(app);
