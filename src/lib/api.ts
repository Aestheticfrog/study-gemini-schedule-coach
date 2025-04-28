
import { toast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';

// This function would typically use environment variables
// For demo purposes, we're hard-coding the API key as shown in the provided code
// In a production app, you should use environment variables
const API_KEY = "AIzaSyDbsVsml9AwYFyKAr4ntzjDALGgZiBFbSQ";

// Initialize Supabase client with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.placeholder-key-please-update';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// User authentication methods
export const user = {
  signInWithGoogle: async () => {
    try {
      // Check if we have valid Supabase credentials before attempting sign-in
      if (supabaseUrl === 'https://your-supabase-url.supabase.co') {
        toast({
          title: "Supabase Configuration Required",
          description: "Please set up your Supabase URL and keys in the project settings.",
          variant: "destructive",
        });
        throw new Error("Supabase not configured");
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  
  current: () => {
    try {
      return supabase.auth.getUser().then(({ data }) => {
        return data.user;
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};

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
