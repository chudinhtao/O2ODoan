import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiChatService } from '../services/aiChatService'
import type { IChatMessage } from '../types'

const QUICK_ACTIONS = [
  'Gợi ý món hôm nay',
  'Xem khuyến mãi',
  'Tình trạng đơn',
  'Gọi nhân viên',
] as const

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function makeBotMsg(text: string, isError = false): IChatMessage {
  return { id: makeId(), role: 'bot', text, timestamp: new Date(), isError }
}

export function useAiChat(sessionToken: string | null) {
  const getStorageKey = useCallback(() => `customer_chat_messages_${sessionToken || 'guest'}`, [sessionToken])

  const [messages, setMessages] = useState<IChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem(`customer_chat_messages_${sessionToken || 'guest'}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }
    } catch (e) {
      console.error('Failed to parse chat history', e)
    }
    return [
      makeBotMsg('Xin chào! Em là Ami 🤖, trợ lý ẩm thực của nhà hàng. Anh/chị cần em tư vấn gì ạ?'),
    ]
  })

  // Lưu lịch sử mỗi khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(getStorageKey(), JSON.stringify(messages))
    }
  }, [messages, getStorageKey])

  // Cập nhật lại màn hình nếu đổi sessionToken (khách quét mã bàn khác)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(getStorageKey())
      if (stored) {
        const parsed = JSON.parse(stored)
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      } else {
        setMessages([makeBotMsg('Xin chào! Em là Ami 🤖, trợ lý ẩm thực của nhà hàng. Anh/chị cần em tư vấn gì ạ?')])
      }
    } catch (e) {
      // ignore
    }
  }, [sessionToken, getStorageKey])

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [])

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (text: string) => {
      if (!sessionToken) throw new Error('Không có session')
      return aiChatService.sendMessage(sessionToken, text)
    },
    onMutate: (text: string) => {
      // Thêm tin nhắn user vào chat ngay lập tức (optimistic)
      const userMsg: IChatMessage = { id: makeId(), role: 'user', text, timestamp: new Date() }
      setMessages(prev => [...prev, userMsg])
      scrollToBottom()
    },
    onSuccess: (res) => {
      // BE luôn trả HTTP 200 kể cả lỗi graceful → đọc res.data.data
      const replyText = res.data?.data ?? res.data?.message ?? 'Dạ, em chưa hiểu ý anh/chị. Anh/chị có thể nói rõ hơn không?'
      setMessages(prev => [...prev, makeBotMsg(replyText)])
      scrollToBottom()
    },
    onError: () => {
      // Network error / timeout → FE tự hiển thị lỗi
      const errMsg = 'Không thể kết nối trợ lý lúc này, anh/chị vui lòng thử lại sau nhé! 📶'
      setMessages(prev => [...prev, makeBotMsg(errMsg, true)])
      scrollToBottom()
    },
  })

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || isPending) return
    setInput('')
    sendMessage(msg)
  }, [input, isPending, sendMessage])

  return {
    messages,
    isOpen,
    setIsOpen,
    input,
    setInput,
    isPending,
    bottomRef,
    quickActions: QUICK_ACTIONS,
    handleSend,
  }
}
