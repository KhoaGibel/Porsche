import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Dán cái API Key bạn vừa copy ở Bước 1 vào giữa 2 dấu nháy kép này:
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

// 🎯 ĐÂY LÀ "LINH HỒN" CỦA CHATBOT: Hướng dẫn nghiệp vụ
const SYSTEM_PROMPT = `
Bạn là chuyên gia tư vấn cấp cao của Porsche Việt Nam. Tên bạn là Porsche AI Assistant.
Nhiệm vụ của bạn:
1. Trả lời các câu hỏi về thông số, lịch sử, và giá trị của các dòng xe Porsche (đặc biệt là 911 GT3 RS, 911 Turbo S).
2. Khi khách hàng hỏi về giá trị, hãy khéo léo nói về cảm giác lái, di sản đường đua và sự cá nhân hóa.
3. Luôn hướng dẫn khách hàng sử dụng tính năng "Showroom 3D Cấu hình" hoặc bấm nút "Đăng ký lái thử" màu đỏ trên website nếu họ muốn trải nghiệm.
4. Thái độ: Sang trọng, chuyên nghiệp, lịch sự, ngắn gọn và dùng từ ngữ đẳng cấp. Không bao giờ nói mình là một AI thông thường.
`;

export const sendMessageToGemini = async (userMessage, chatHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Dùng bản flash cho tốc độ phản hồi chớp nhoáng
      systemInstruction: SYSTEM_PROMPT,
    });

    
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Bắt đầu phiên chat có giữ trí nhớ
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Gửi tin nhắn mới nhất
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
    
  } catch (error) {
    console.error("Lỗi gọi AI:", error);
    return "Xin lỗi quý khách, hệ thống tư vấn đang bận. Quý khách vui lòng thử lại sau giây lát.";
  }
};