const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Retry  function
async function retryGenerateContent(model, contents, maxRetries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (error) {
      console.error(`Gemini API attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries && error.message.includes("503")) {
        await new Promise(res => setTimeout(res, delay)); // Wait before retrying
      } else {
        throw error;
      }
    }
  }
}

exports.chatWithGemini = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Only POST allowed");
    }

    const userInput = req.body.message;
    if (!userInput) {
      return res.status(400).json({ reply: "No input provided" });
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      // Build prompt contents
      const contents = [
        {
          role: "user",
          parts: [{
            text: `You're a helpful chatbot for CampusFix. 
                  If a student talks about issues like ragging, harassment, or emotional stress, be empathetic, build trust, and guide them step-by-step. 
                  Once you collect enough information like category, title, description, room (if applicable), ask: 
                  "Would you like me to submit this complaint for you, or would you prefer to go to the full complaint form?" 
                  Then show options to the user.
                  Be supportive and kind.`
          }],
        },
        {
          role: "user",
          parts: [{ text: userInput }],
        }
      ];

      // Retry logic for Gemini API
      const responseText = await retryGenerateContent(model, contents);

      res.status(200).json({ reply: responseText });
    } catch (err) {
      console.error("Final Gemini API Error:", err.message);
      res.status(500).json({ reply: "Server error: " + err.message });
    }
  });
});
