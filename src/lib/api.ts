
import { toast } from "@/components/ui/use-toast";

// This function would typically use environment variables
// For demo purposes, we're hard-coding the API key as shown in the provided code
// In a production app, you should use environment variables
const API_KEY = "AIzaSyDbsVsml9AwYFyKAr4ntzjDALGgZiBFbSQ";

export async function callGeminiAPI(prompt: string) {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    toast({
      title: "API Error",
      description: `Failed to communicate with Gemini API: ${error instanceof Error ? error.message : "Unknown error"}`,
      variant: "destructive",
    });
    return "Error connecting to Gemini API. Please try again.";
  }
}
