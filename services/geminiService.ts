
import { GoogleGenAI } from "@google/genai";

export const getMotivationalMessage = async (email: string): Promise<string> => {
  // 優先嘗試從 window.process 讀取環境變數，這在 Zeabur 等平台上較穩定
  const apiKey = (window as any).process?.env?.API_KEY || '';
  
  if (!apiKey) {
    console.warn("Gemini API_KEY 未設定，切換至預設模式。");
    return "打卡成功！祝你在師大度過充實的一天。";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位師大的行政助教。現在有一位學生（Email: ${email}）剛剛完成打卡簽到。
      請給他一句非常簡短、充滿活力且優雅的歡迎詞（大約 15 字以內）。請使用台灣繁體中文。`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text || "歡迎來到師大，讓我們開始美好的一天！";
  } catch (error) {
    console.error("Gemini AI 服務異常:", error);
    return "打卡成功！歡迎開始今天的課程。";
  }
};
