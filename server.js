const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Loaded from .env

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

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`  // Ensure correct Authorization header
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
        } else {
            outputDiv.innerText = "⚠️ Something went wrong. Try again or check the model name.";
        }
    } catch (err) {
        outputDiv.innerText = "❌ Error: " + err.message;
    }
}
