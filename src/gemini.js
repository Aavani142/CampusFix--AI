export async function categorizeComplaint(promptText) {
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

  if (!API_KEY) {
    console.error('Gemini API key is missing.');
    return 'Other';
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
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
      console.error('Network response was not ok:', response.statusText);
      return 'Other';
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const category = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
      return category;
    } else {
      console.error('Gemini response error:', data);
      return 'Other';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return 'Other';
  }
}


