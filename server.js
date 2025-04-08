require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const app = express();

// Your server setup here
const PORT = process.env.PORT || 3000;  // Fallback to 3000 if PORT is not defined

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const API_KEYS = [
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3
];

let currentAPIKeyIndex = 0; // Start with the first API key

// Function to switch to the next API key in a round-robin manner
function switchAPIKey() {
    currentAPIKeyIndex = (currentAPIKeyIndex + 1) % API_KEYS.length;
    console.log(`Switching to API Key ${currentAPIKeyIndex + 1}`);
}

async function generateLetter() {
    const jobTitle = document.getElementById("jobTitle").value;
    const jobDesc = document.getElementById("jobDesc").value;
    const yourInfo = document.getElementById("yourInfo").value;
    const tone = document.getElementById("tone").value;
    const outputDiv = document.getElementById("result");

    if (!jobTitle || !jobDesc || !yourInfo) {
        outputDiv.innerText = "⚠️ Please fill out all fields.";
        return;
    }

    outputDiv.innerText = "Generating... please wait ⏳";

    const messages = [
        {
            role: "system",
            content: "You are an expert career assistant helping users write professional cover letters."
        },
        {
            role: "user",
            content: `Write a ${tone} tone professional cover letter for a ${jobTitle} position.\n
                Job Description: ${jobDesc}\n
                Candidate Background: ${yourInfo}`
        }
    ];

    let attemptCount = 0;
    const maxRetries = API_KEYS.length; // Retry until all keys are used up

    while (attemptCount < maxRetries) {
        const currentAPIKey = API_KEYS[currentAPIKeyIndex];
        console.log(`Using API Key: ${currentAPIKey}`); // Log the API key being used
        
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentAPIKey}`  // Ensure correct Authorization header
                },
                body: JSON.stringify({
                    model: "mistralai/mistral-small-3.1-24b-instruct:free",
                    messages: messages
                }),
            });

            const data = await response.json();
            console.log(data); // Log the response for debugging

            if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                outputDiv.innerText = data.choices[0].message.content.trim();
                return;  // Successfully generated the letter, exit the function
            } else {
                outputDiv.innerText = "⚠️ Something went wrong. Try again or check the model name.";
                return;
            }
        } catch (err) {
            if (err.message.includes("Rate limit exceeded")) {
                attemptCount++;
                switchAPIKey();  // Switch to the next API key
                outputDiv.innerText = `❌ Rate limit exceeded. Trying with another key... (${attemptCount} out of ${maxRetries} tries).`;
                if (attemptCount === maxRetries) {
                    outputDiv.innerText = "❌ All API keys are exhausted. Please try again later.";
                }
            } else {
                outputDiv.innerText = "❌ Error: " + err.message;
                return;
            }
        }
    }
}
