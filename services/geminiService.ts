import { GoogleGenAI } from "@google/genai";

/**
 * Generates content using Gemini API following the official SDK guidelines.
 */
export async function generateScriptWithGemini(prompt: string): Promise<string> {
  // Use process.env.API_KEY directly as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Fixed: Using simplified contents string as per Google GenAI SDK guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    // Fixed: Correctly accessing text property from GenerateContentResponse
    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}