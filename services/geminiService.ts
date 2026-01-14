
import { GoogleGenAI } from "@google/genai";

export const getMotivationalMessage = async (email: string): Promise<string> => {
  // 安全讀取環境變數
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.warn("API_KEY 尚未設定，將顯示預設訊息。");
    return "打卡成功！祝你在師大的學習旅程順利。";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位師大的行政助教。現在有一位學生（Email: ${email}）剛剛完成打卡簽到。
      請給他一句非常簡短、充滿活力且優雅的歡迎詞。請使用台灣繁體中文。`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text || "歡迎來到師大，讓我們開始美好的一天！";
  } catch (error) {
    console.error("Gemini AI 服務異常:", error);
    return "打卡成功！歡迎開始今天的課程。";
  }
};
