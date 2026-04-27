import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAdminChat } from '../hooks/useAdminChat';

export const AdminChatWidget: React.FC = () => {
  const { messages, isLoading, isOpen, toggleChat, sendMessage, clearHistory } = useAdminChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    { text: "Doanh thu hôm nay thế nào?",        icon: "📊" },
    { text: "Bếp đang chậm không?",               icon: "🍳" },
    { text: "KM nào hiệu quả nhất tháng này?",    icon: "💹" },
    { text: "Có món nào đang hết hàng không?",     icon: "🍽️" },
    { text: "AOV tuần này có ổn không?",           icon: "💳" },
    { text: "Top 5 món bán chạy nhất",             icon: "🏆" },
  ];

  return (
    <>
      {/* Nút nổi bật để mở Chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <MessageSquare size={24} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary border-2 border-primary"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cửa sổ Chat (Floating Window) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[1000] w-[400px] h-[600px] max-h-[85vh] bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden sm:right-6 sm:bottom-6 right-0 bottom-0 sm:w-[400px] w-full sm:h-[600px] h-[100dvh] sm:rounded-2xl rounded-none"
          >
            {/* Header */}
            <div className="bg-primary text-on-primary px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-on-primary/20 rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm">Admin Copilot</h3>
                  <p className="text-[10px] text-on-primary/80">Báo cáo · Tài chính · Vận hành</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearHistory}
                  className="p-2 hover:bg-on-primary/20 rounded-full transition-colors text-on-primary/80 hover:text-on-primary"
                  title="Xoá lịch sử"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={toggleChat}
                  className="p-2 hover:bg-on-primary/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 bg-surface space-y-4">
              {messages.map((msg) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isAI ? 'bg-secondary text-on-secondary' : 'bg-primary/10 text-primary'}`}>
                      {isAI ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className={`flex flex-col gap-1 ${isAI ? '' : 'items-end'}`}>
                      <span className="text-[10px] text-on-surface-variant px-1">
                        {isAI ? 'Admin Copilot' : 'Bạn'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div className={`p-3 rounded-2xl text-sm ${
                        isAI 
                          ? 'bg-surface-variant text-on-surface-variant rounded-tl-none prose prose-sm prose-p:my-1 prose-headings:my-2 max-w-none' 
                          : 'bg-primary text-on-primary rounded-tr-none'
                      }`}>
                        {isAI ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                  <div className="bg-surface-variant text-on-surface-variant p-4 rounded-2xl rounded-tl-none">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Loader2 size={14} className="animate-spin text-primary" />
                      <span className="text-xs font-semibold text-primary">Đang phân tích dữ liệu...</span>
                    </div>
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !isLoading && (
              <div className="px-3 py-2 shrink-0 border-t border-outline-variant/30">
                <p className="text-[9px] text-outline/70 font-semibold uppercase tracking-wider mb-1.5 px-1">Gợi ý</p>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      className="whitespace-nowrap px-2.5 py-1.5 bg-surface-variant text-on-surface-variant text-[11px] rounded-full hover:bg-primary/10 hover:text-primary transition-colors border border-outline-variant/50 flex items-center gap-1 shrink-0"
                    >
                      <span>{s.icon}</span>
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-surface shrink-0">
              <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-surface-variant/70 rounded-3xl p-1.5 pr-2 focus-within:bg-surface-variant transition-colors">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi về doanh thu, bếp, nhân sự, khuyến mãi..."
                  className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-sm py-3 px-4 text-on-surface placeholder:text-on-surface-variant/60"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="mb-1 p-2.5 bg-primary text-on-primary rounded-full disabled:bg-surface-variant disabled:text-outline disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[10px] text-outline font-medium">Admin Copilot có thể mắc lỗi. Vui lòng kiểm tra lại.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
