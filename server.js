require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

const API_KEYS = [
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3
];

let currentAPIKeyIndex = 0;

function switchAPIKey() {
    currentAPIKeyIndex = (currentAPIKeyIndex + 1) % API_KEYS.length;
    console.log(`Switching to API Key: ${API_KEYS[currentAPIKeyIndex]} (Index: ${currentAPIKeyIndex + 1})`);
}

app.post('/generate', async (req, res) => {
    const { messages } = req.body;
    if (!messages) {
        return res.status(400).json({ error: 'No messages provided' });
    }

    let attemptCount = 0;
    const maxRetries = API_KEYS.length;

    while (attemptCount < maxRetries) {
        const currentAPIKey = API_KEYS[currentAPIKeyIndex];
        console.log(`Using API Key: ${currentAPIKey} (Index: ${currentAPIKeyIndex + 1})`);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentAPIKey}`,
                },
                body: JSON.stringify({
                    model: "mistral-small-3.1-24b-instruct:free",
                    messages: [{ role: "system", content: "You are an expert career assistant helping users write professional cover letters." }, { role: "user", content: messages }]
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                return res.json(data.choices[0].message);
            } else {
                return res.status(500).json({ error: "Failed to generate letter" });
            }
        } catch (err) {
            console.error(`Attempt ${attemptCount + 1}: Error using API Key ${currentAPIKeyIndex + 1}: ${err.message}`);
            
            if (err.message.includes("Rate limit exceeded") || err.message.includes("Unauthorized")) {
                attemptCount++;
                switchAPIKey();  // Switch to the next key
                console.log(`Switching to next API key. Attempt ${attemptCount}`);
                if (attemptCount === maxRetries) {
                    return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
                }
            } else {
                return res.status(500).json({ error: err.message });
            }
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
