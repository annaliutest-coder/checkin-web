
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMotivationalMessage = async (email: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-tech campus assistant. A student with email "${email}" has just checked into class. Give them a 1-sentence, cool, futuristic, and motivational welcome message in Traditional Chinese (Taiwan). Keep it encouraging and short.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text || "歡迎來到未來課堂！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "打卡成功！祝你有個充實的一天。";
  }
};
