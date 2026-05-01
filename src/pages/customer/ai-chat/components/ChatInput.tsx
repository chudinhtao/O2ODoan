import { Send } from 'lucide-react'
import { useRef, type KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  isLoading: boolean
  quickActions: readonly string[]
  onQuickAction: (action: string) => void
  showQuickActions: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  quickActions,
  onQuickAction,
  showQuickActions,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    // Auto-resize textarea (max 4 dòng)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }

  return (
    <div className="border-t border-slate-100 bg-white/98 backdrop-blur-xl px-3 pt-2.5 pb-4 safe-area-bottom">
      {/* Quick Action Chips — chỉ hiện khi chưa có cuộc trò chuyện */}
      {showQuickActions && (
        <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              disabled={isLoading}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Nhắn tin với Ami..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 transition disabled:opacity-60 min-w-0 leading-relaxed"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          id="ai-chat-send-btn"
          aria-label="Gửi tin nhắn"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-300/40 active:scale-90 transition-all disabled:opacity-40 disabled:shadow-none shrink-0"
        >
          <Send size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
