import './dotenv.js'; // Ensure this is at the top of your server.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Now available from dotenv.js

// Middleware
app.use(cors());
app.use(express.json());

// Default route to check if the server is alive
app.get("/", (req, res) => {
  res.send("🚀 Server is live! Use the /generate route for cover letter generation.");
});

// Handle POST requests for generating cover letters
app.post("/generate", async (req, res) => {
  const { messages, model } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Listen on the port
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
