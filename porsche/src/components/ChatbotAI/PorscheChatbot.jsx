import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './PorscheChatbot.css';
import { sendMessageToGemini } from '../../services/aiApi';

export default function PorscheChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null); // Dùng để cuộn xuống cuối đoạn chat

  // 1. KHỞI TẠO TIN NHẮN CHÀO HỎI
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user) {
        // [TODO: Lắp API Firebase kéo dữ liệu chat cũ ở đây]
        setMessages([{ 
          sender: 'ai', 
          text: `Kính chào anh/chị ${user.displayName || 'Quý khách'}. Tôi là chuyên viên tư vấn AI của Porsche. Anh/chị cần hỗ trợ thông tin gì ạ?` 
        }]);
      } else {
        // Khách vãng lai
        setMessages([{ 
          sender: 'ai', 
          text: 'Chào mừng quý khách đến với Porsche. Tôi có thể giúp gì cho quý khách hôm nay?' 
        }]);
      }
    };
    loadChatHistory();
  }, [user]);

  // Cuộn xuống tin nhắn mới nhất (chỉ cuộn khi cửa sổ chat đang mở)
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isOpen]);

  // 2. HÀM XỬ LÝ KHI NGƯỜI DÙNG BẤM GỬI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText(''); // Xóa ô nhập
    
    // Lấy lịch sử hiện tại (để truyền cho Gemini hiểu ngữ cảnh)
    const currentHistory = [...messages];
    
    // Thêm tin nhắn user vào UI
    const newMessages = [...currentHistory, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 🚀 GỌI AI THẬT: Truyền câu hỏi của khách và lịch sử chat vào bộ não Gemini
      const aiResponse = await sendMessageToGemini(userMessage, currentHistory);

      const finalMessages = [...newMessages, { sender: 'ai', text: aiResponse }];
      setMessages(finalMessages);

      // Phân luồng lưu trữ
      if (user) {
        // 🚀 [TODO: Lưu finalMessages lên Firebase Firestore]
        console.log("Đã lưu lịch sử chat cho user:", user.uid);
      }
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: 'Xin lỗi, kết nối đang bị gián đoạn. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* NÚT BẤM LƠ LỬNG */}
      <button className="chatbot-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" /></svg>
        )}
      </button>

      {/* CỬA SỔ CHAT */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div>
            <h3>Porsche AI Assistant</h3>
            <span className="chatbot-status">● Đang trực tuyến</span>
          </div>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message ai" style={{ opacity: 0.6 }}>
              AI đang soạn tin...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Nhập câu hỏi của bạn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="chatbot-send-btn" disabled={isLoading || !inputText.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </>
  );
}