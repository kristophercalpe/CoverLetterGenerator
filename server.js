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
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_4
];

app.post('/generate', async (req, res) => {
    const { messages, apiKeyIndex } = req.body;
    if (!messages || apiKeyIndex === undefined) {
        return res.status(400).json({ error: 'No messages or API key index provided' });
    }

    const currentAPIKey = API_KEYS[apiKeyIndex]; // Use the selected API key
    console.log(`Using API Key: ${currentAPIKey} (Index: ${apiKeyIndex + 1})`);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentAPIKey}`,
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-maverick:free",
                messages: messages // Send the messages array directly
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            return res.json({ content: data.choices[0].message.content });
        } else {
            return res.status(500).json({ error: "Failed to generate letter" });
        }
    } catch (err) {
        console.error(`Error using API Key ${apiKeyIndex + 1}: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
