import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../types/admin-chat.type';
import { adminChatService } from '../services/adminChatService';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'admin_chat_messages';
const SESSION_KEY = 'admin_chat_session_id';

export const useAdminChat = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // Khôi phục lịch sử chat từ localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const savedSessionId = localStorage.getItem(SESSION_KEY);
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Tin nhắn chào mừng
      const welcomeMsg: ChatMessage = {
        id: uuidv4(),
        sender: 'AI',
        content: t('admin.chat.welcome_message', `Xin chào! Tôi là **Admin Copilot** — trợ lý chiến lược hỗ trợ bạn:

**Báo cáo**: Doanh thu, top món, chốt ca, theo giờ, nguồn đặt hàng
**Tài chính**: ROI khuyến mãi, xu hướng AOV, phân tích kênh bán
**Vận hành**: Hiệu suất bếp, nhân sự, món hết hàng, đơn hủy

Bạn muốn biết điều gì hôm nay?`),
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMsg]));
    }
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem(SESSION_KEY, newSessionId);
    }
  }, []);

  // Lưu lịch sử mỗi khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Cập nhật tin nhắn chào mừng khi đổi ngôn ngữ (nếu chưa có hội thoại thực tế)
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'AI' && !isLoading) {
      const updatedWelcomeMsg: ChatMessage = {
        id: messages[0].id,
        sender: 'AI',
        content: t('admin.chat.welcome_message', `Xin chào! Tôi là **Admin Copilot** — trợ lý chiến lược hỗ trợ bạn:

**Báo cáo**: Doanh thu, top món, chốt ca, theo giờ, nguồn đặt hàng
**Tài chính**: ROI khuyến mãi, xu hướng AOV, phân tích kênh bán
**Vận hành**: Hiệu suất bếp, nhân sự, món hết hàng, đơn hủy

Bạn muốn biết điều gì hôm nay?`),
        timestamp: messages[0].timestamp
      };
      setMessages([updatedWelcomeMsg]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'ADMIN',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await adminChatService.sendMessage({
        message: content.trim(),
        sessionId: sessionId
      });

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'AI',
        content: res.reply,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (res.sessionId && res.sessionId !== sessionId) {
        setSessionId(res.sessionId);
        localStorage.setItem(SESSION_KEY, res.sessionId);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        sender: 'AI',
        content: t('admin.chat.error_connection', 'Xin lỗi, đã xảy ra lỗi khi kết nối tới hệ thống. Vui lòng thử lại sau.'),
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem(SESSION_KEY, newSessionId);
    
    const welcomeMsg: ChatMessage = {
      id: uuidv4(),
      sender: 'AI',
      content: t('admin.chat.clear_history_message', 'Lịch sử đã được xoá. Tôi có thể giúp bạn về báo cáo, tài chính hay vận hành nhà hàng. Bạn muốn bắt đầu từ đâu?'),
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMsg]));
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return {
    messages,
    isLoading,
    isOpen,
    toggleChat,
    sendMessage,
    clearHistory
  };
};
