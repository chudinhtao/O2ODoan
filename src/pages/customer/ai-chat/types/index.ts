export interface IChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
  isError?: boolean
}

export interface IAiChatState {
  messages: IChatMessage[]
  isOpen: boolean
}

export interface IAiChatResponse {
  success: boolean
  message: string
  data: string // câu trả lời AI
  timestamp: string
  serverTime: number
}
