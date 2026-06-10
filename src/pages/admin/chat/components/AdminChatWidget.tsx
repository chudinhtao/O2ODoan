import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAdminChat } from '../hooks/useAdminChat';

export const AdminChatWidget: React.FC = () => {
  const { t } = useTranslation();
  const { messages, isLoading, isOpen, toggleChat, sendMessage, clearHistory } = useAdminChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Listen to global toggle/open events
  useEffect(() => {
    const handleOpenChat = () => {
      if (!isOpen) {
        toggleChat();
      }
    };
    const handleToggleChat = () => {
      toggleChat();
    };

    window.addEventListener('open-admin-chat', handleOpenChat);
    window.addEventListener('toggle-admin-chat', handleToggleChat);
    return () => {
      window.removeEventListener('open-admin-chat', handleOpenChat);
      window.removeEventListener('toggle-admin-chat', handleToggleChat);
    };
  }, [isOpen, toggleChat]);

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
    { text: t('admin.chat.suggestions.today_revenue', 'Doanh thu hôm nay thế nào?') },
    { text: t('admin.chat.suggestions.kitchen_delay', 'Bếp đang chậm không?') },
    { text: t('admin.chat.suggestions.promo_roi', 'KM nào hiệu quả nhất tháng này?') },
    { text: t('admin.chat.suggestions.low_stock', 'Có món nào đang hết hàng không?') },
    { text: t('admin.chat.suggestions.aov_trend', 'AOV tuần này có ổn không?') },
    { text: t('admin.chat.suggestions.top_items', 'Top 5 món bán chạy nhất') },
  ];

  return (
    <>
      {/* Cửa sổ Chat (Floating Window) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[1000] w-[560px] h-[720px] max-h-[90vh] bg-surface rounded-2xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden sm:right-6 sm:bottom-6 right-0 bottom-0 sm:w-[560px] w-full sm:h-[720px] h-[100dvh] sm:rounded-2xl rounded-none"
          >
            {/* Override styles for Markdown Tables and Content to guarantee strict left-alignment and custom premium padding */}
            <style>{`
              .chat-prose-container {
                text-align: left !important;
              }
              .chat-prose-container th,
              .chat-prose-container td {
                text-align: center !important;
              }
              .chat-prose-container table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 8px 0 !important;
              }
              .chat-prose-container th {
                background-color: var(--color-surface-container) !important;
                color: var(--color-on-surface) !important;
                font-weight: 700 !important;
                padding: 6px 10px !important;
                border: 1px solid var(--color-outline-variant) !important;
              }
              .chat-prose-container td {
                padding: 6px 10px !important;
                border: 1px solid var(--color-outline-variant) !important;
              }
            `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-700 text-on-primary px-4 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-blue-800/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-on-primary/10 text-on-primary rounded-full flex items-center justify-center border border-on-primary/15 shadow-inner">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-primary">{t('admin.chat.copilot', 'Admin Copilot')}</h3>
                  <p className="text-[10px] text-on-primary/80 font-medium">{t('admin.chat.subtitle', 'Báo cáo · Tài chính · Vận hành')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearHistory}
                  className="p-2 hover:bg-on-primary/10 rounded-lg transition-colors text-on-primary/80 hover:text-on-primary"
                  title={t('admin.chat.clear_history', 'Xoá lịch sử')}
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={toggleChat}
                  className="p-2 hover:bg-on-primary/10 rounded-lg transition-colors text-on-primary/80 hover:text-on-primary"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-3 bg-surface-container/20 space-y-3">
              {messages.map((msg) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div key={msg.id} className={`flex gap-2 max-w-[90%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isAI ? 'bg-secondary/10 text-secondary border border-secondary/15' : 'bg-primary/10 text-primary border border-primary/15'}`}>
                      {isAI ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    <div className={`flex flex-col gap-0.5 ${isAI ? '' : 'items-end'}`}>
                      <span className="text-[10px] text-outline/80 font-medium px-1">
                        {isAI ? t('admin.chat.copilot', 'Admin Copilot') : t('admin.chat.you', 'Bạn')} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div className={`px-3 py-2 rounded-xl text-sm chat-prose-container text-left ${
                        isAI 
                          ? 'bg-surface-bright border border-outline-variant/30 text-on-surface rounded-tl-none prose prose-sm prose-p:my-1 prose-headings:my-2 max-w-none shadow-sm' 
                          : 'bg-primary text-on-primary border border-blue-700 rounded-tr-none shadow-sm'
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
                <div className="flex gap-2 max-w-[90%] self-start">
                  <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary border border-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-surface-bright border border-outline-variant/30 px-3 py-2 rounded-xl rounded-tl-none shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Loader2 size={12} className="animate-spin text-primary" />
                      <span className="text-xs font-semibold text-primary">{t('admin.chat.analyzing', 'Đang phân tích dữ liệu...')}</span>
                    </div>
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !isLoading && (
              <div className="px-3 py-1.5 shrink-0 border-t border-outline-variant/30 bg-surface-container/30">
                <p className="text-[8px] text-outline font-bold uppercase tracking-wider mb-1 px-1">{t('admin.chat.suggestions_title', 'Gợi ý')}</p>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      className="whitespace-nowrap px-2 py-1 bg-surface-bright text-on-surface-variant text-[11px] rounded-lg hover:bg-primary hover:text-on-primary transition-all border border-outline-variant hover:border-primary flex items-center shrink-0 shadow-sm"
                    >
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-2.5 bg-surface-bright border-t border-outline-variant/30 shrink-0">
              <form onSubmit={handleSend} className="relative flex items-end gap-1.5 bg-surface-variant/40 border border-outline-variant/50 rounded-xl p-1 pr-1.5 focus-within:border-primary focus-within:bg-surface-bright transition-all">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('admin.chat.placeholder', 'Hỏi về doanh thu, bếp, nhân sự, khuyến mãi...')}
                  className="w-full max-h-24 min-h-[36px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-sm py-2 px-3 text-on-surface placeholder:text-on-surface-variant/60"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="mb-0.5 p-2 bg-primary text-on-primary rounded-lg disabled:bg-surface-variant disabled:text-outline disabled:cursor-not-allowed hover:bg-primary/95 transition-colors shrink-0 shadow-sm"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-1.5">
                <span className="text-[9px] text-outline font-medium">{t('admin.chat.disclaimer', 'Admin Copilot có thể mắc lỗi. Vui lòng kiểm tra lại.')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
