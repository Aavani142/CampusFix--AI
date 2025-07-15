const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();


app.use(cors({
  origin: "http://localhost:5173",  
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
app.options("*", cors()); 

app.use(express.json());


const geminiApiKey = functions.config()?.gemini?.apikey;
if (!geminiApiKey) {
  throw new Error("Gemini API key not found. Use:\nfirebase functions:config:set gemini.apikey=\"YOUR_API_KEY\"");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);


async function retryGenerateContent(model, contents, maxRetries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries && error.message.includes("503")) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}


app.post("/", async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) return res.status(400).json({ reply: "No input provided" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const contents = [
      {
        role: "user",
        parts: [
          { text: `You're a helpful chatbot for CampusFix.\n\nComplaint:\n${userInput}` }
        ]
      }
    ];
    const reply = await retryGenerateContent(model, contents);
    return res.status(200).json({ reply: reply.trim() });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return res.status(500).json({ reply: "Server error: " + err.message });
  }
});

exports.chatWithGemini = functions.https.onRequest(app);






