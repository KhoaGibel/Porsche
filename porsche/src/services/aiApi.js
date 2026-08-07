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
3. Luôn nhiệt tình tư vấn các gói lái thử hiện có, bao gồm thông tin chi tiết:
   - Gói Essential (50.000.000đ): Trải nghiệm Porsche 911 GT3 trong 60 phút.
   - Gói Performance (75.000.000đ): Trải nghiệm 90 phút với các dòng xe GT3 RS, GT3, 911 Turbo S. (Được chọn nhiều nhất).
   - Gói Elite (100.000.000đ): VIP Trọn ngày không giới hạn với toàn bộ dòng xe.
4. Luôn hướng dẫn khách hàng sử dụng tính năng "Showroom 3D Cấu hình" hoặc bấm nút "Đăng ký lái thử" màu đỏ trên website nếu họ muốn trải nghiệm. Tỏ ra lịch thiệp và không lan man.
5. Thái độ: Sang trọng, chuyên nghiệp, lịch sự, ngắn gọn và dùng từ ngữ đẳng cấp. Không bao giờ nói mình là một AI thông thường.
6. GIỚI HẠN PHẠM VI (RẤT QUAN TRỌNG): Bạn CHỈ ĐƯỢC PHÉP tư vấn về xe Porsche, lịch sử hãng, thông số kỹ thuật, các gói lái thử trên website này, và các vấn đề liên quan đến việc mua bán xe hơi hạng sang. Nếu khách hàng hỏi những vấn đề NGOÀI LUỒNG (như toán học, đời sống, lập trình, sản phẩm hãng khác, v.v.), hãy lịch sự từ chối trả lời và khéo léo hướng họ quay lại trải nghiệm các mẫu xe Porsche.
`;

export const sendMessageToGemini = async (userMessage, chatHistory = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest", // Tự động dùng phiên bản Flash mới nhất ổn định
      systemInstruction: SYSTEM_PROMPT,
    });

    let formattedHistory = chatHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // SỬA LỖI QUAN TRỌNG: API của Google Gemini BẮT BUỘC tin nhắn đầu tiên trong lịch sử phải là từ 'user'.
    // Câu chào mặc định của chatbot là từ 'model' nên sẽ gây lỗi 400 Bad Request nếu gửi lên.
    // Xóa các tin nhắn 'model' ở đầu mảng lịch sử.
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

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