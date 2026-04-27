import type { IChatMessage } from '../types'

interface ChatMessageProps {
  message: IChatMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[78%] min-w-0">
          <p className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm shadow-orange-200/60 whitespace-pre-wrap break-words">
            {message.text}
          </p>
          <p className="text-[10px] text-slate-400 text-right mt-1 pr-1">
            {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 mb-3">
      {/* Avatar Ami */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
        A
      </div>

      <div className="max-w-[78%] min-w-0">
        <div
          className={`px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words
            ${message.isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-white border border-slate-100 text-slate-800'
            }`}
        >
          {message.text}
        </div>
        <p className="text-[10px] text-slate-400 mt-1 pl-1">
          Ami · {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
