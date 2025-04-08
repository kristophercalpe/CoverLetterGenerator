const API_KEYS = [
    process.env.OPENROUTER_API_KEY_1,  // First account API Key
    process.env.OPENROUTER_API_KEY_2,  // Second account API Key
    process.env.OPENROUTER_API_KEY_3   // Third account API Key
];

let currentAPIKeyIndex = 0;  // Start with the first API key

// Function to switch to the next API key
function switchAPIKey() {
    currentAPIKeyIndex = (currentAPIKeyIndex + 1) % API_KEYS.length; // Switch keys in a round-robin manner
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
    const maxRetries = API_KEYS.length;  // Retry until all keys are used up

    while (attemptCount < maxRetries) {
        const currentAPIKey = API_KEYS[currentAPIKeyIndex];
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentAPIKey}`  // Use the current API key
                },
                body: JSON.stringify({
                    model: "mistralai/mistral-small-3.1-24b-instruct:free", // Use the same model
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
            // If an error occurs (like rate limit exceeded), switch to the next API key
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
