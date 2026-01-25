import { GoogleGenAI, Type } from "@google/genai";
import { PostCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

export const analyzePostContent = async (text: string): Promise<{ category: PostCategory, suggestion: string }> => {
  try {
    const prompt = `
      Analyze the following text which describes a social or national issue in Bangladesh.
      1. Categorize it into one of these: Infrastructure, Education, Economy, Corruption, Health, Environment, Other.
      2. Provide a short, 1-sentence constructive suggestion or optimistic viewpoint on how to solve it.
      
      Text: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["category", "suggestion"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Validate category or fallback
    let category = PostCategory.OTHER;
    const catUpper = result.category?.toUpperCase();
    if (Object.values(PostCategory).some(c => c.toUpperCase() === catUpper)) {
       category = result.category as PostCategory;
    }

    return {
      category,
      suggestion: result.suggestion || "Let's work together to solve this."
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      category: PostCategory.OTHER,
      suggestion: "Community discussion is key to solving this."
    };
  }
};

export const suggestSolution = async (issueTitle: string, issueDesc: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Propose a practical, step-by-step solution (max 3 steps) for this problem in Bangladesh context:
      Title: ${issueTitle}
      Description: ${issueDesc}`,
    });
    return response.text || "No suggestion available.";
  } catch (error) {
    console.error("Gemini solution suggestion failed:", error);
    return "";
  }
};