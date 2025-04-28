
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";

// Use environment variables to securely store sensitive keys
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// User authentication methods
export const user = {
  signInWithGoogle: async () => {
    try {
      // Validate Supabase configuration before proceeding
      if (!supabaseUrl || !supabaseKey) {
        toast({
          title: "Supabase Configuration Required",
          description:
            "Please set up your Supabase URL and keys in the project settings.",
          variant: "destructive",
        });
        throw new Error("Supabase not configured");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Google sign-in error:", error.message || error);
      toast({
        title: "Authentication Error",
        description:
          error.message || "An unknown error occurred during sign-in.",
        variant: "destructive",
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign out error:", error.message || error);
      toast({
        title: "Sign Out Error",
        description:
          error.message || "An unknown error occurred during sign-out.",
        variant: "destructive",
      });
      throw error;
    }
  },

  current: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data?.user || null;
    } catch (error: any) {
      console.error("Error getting current user:", error.message || error);
      return null;
    }
  },
};

// Gemini API integration
export async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    if (!API_KEY) {
      toast({
        title: "API Key Missing",
        description:
          "Please configure the Gemini API key in your environment variables.",
        variant: "destructive",
      });
      throw new Error("Gemini API key not configured");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
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
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || "No content generated.";
  } catch (error: any) {
    console.error("Gemini API error:", error.message || error);
    toast({
      title: "API Error",
      description:
        error.message ||
        "Failed to communicate with Gemini API. Please try again later.",
      variant: "destructive",
    });
    return "Error connecting to Gemini API. Please try again.";
  }
}

