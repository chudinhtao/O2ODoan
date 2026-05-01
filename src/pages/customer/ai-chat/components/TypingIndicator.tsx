// Hiệu ứng "Ami đang gõ..." — 3 chấm nhảy
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      {/* Avatar bot */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
        A
      </div>

      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100">
        <div className="flex items-center gap-1" aria-label="Ami đang trả lời">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
