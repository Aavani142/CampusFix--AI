export async function categorizeComplaint(promptText) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("Gemini API key is missing.");
    return "Other";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Categorize this complaint into one of the following categories: Electrical, Plumbing, Network, Cleanliness, Furniture, Other. Respond with only the category.\n\nComplaint:\n${promptText}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return "Other";
    }

    const data = await response.json();
    const category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return category || "Other";
  } catch (error) {
    console.error("Fetch error:", error);
    return "Other";
  }
}
