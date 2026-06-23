import { X, Bot } from 'lucide-react'
import { useAiChat } from '../hooks/useAiChat'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { TypingIndicator } from '../components/TypingIndicator'
import { usePaymentLock } from '../../shared/hooks/usePaymentLock'

interface AiChatPageProps {
  sessionToken: string | null
}

export function AiChatPage({ sessionToken }: AiChatPageProps) {
  usePaymentLock(sessionToken || '')

  const {
    messages,
    isOpen,
    setIsOpen,
    input,
    setInput,
    isPending,
    bottomRef,
    quickActions,
    handleSend,
  } = useAiChat(sessionToken)

  // Chỉ hiện quick actions khi chỉ có tin nhắn chào mừng ban đầu
  const showQuickActions = messages.length <= 1 && !isPending

  return (
    <>
      {/* ── FAB Button ──────────────────────────────────────────── */}
      {!isOpen && (
        <button
          id="ai-chat-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Mở trợ lý Ami"
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-400/40 flex items-center justify-center active:scale-90 transition-all"
        >
          <Bot size={26} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* ── Bottom Sheet Chat ────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col" aria-modal="true" aria-label="Chat với Ami">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="bg-slate-50 rounded-t-3xl flex flex-col h-[88dvh] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 bg-white rounded-t-3xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  A
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">Ami — Trợ lý nhà hàng</p>
                  <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                id="ai-chat-close-btn"
                aria-label="Đóng chat"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-0" role="log" aria-live="polite">
              {/* Empty state — không bao giờ trắng bệch */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                  <Bot size={36} className="text-orange-300" />
                  <p>Hãy hỏi Ami bất cứ điều gì về nhà hàng!</p>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Loading state: hiệu ứng typing khi đang chờ BE */}
              {isPending && <TypingIndicator />}

              {/* Scroll anchor */}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => handleSend()}
              isLoading={isPending}
              quickActions={quickActions}
              onQuickAction={(action) => handleSend(action)}
              showQuickActions={showQuickActions}
            />
          </div>
        </div>
      )}
    </>
  )
}
