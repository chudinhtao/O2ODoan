import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { IAiChatResponse } from '../types'

export const aiChatService = {
  sendMessage: (sessionToken: string, message: string) =>
    http.post<IAiChatResponse>(API_ROUTES.ai.customerChat, message, {
      headers: {
        'X-Session-Token': sessionToken,
        'Content-Type': 'text/plain; charset=utf-8',
      },
      timeout: 120_000, // AI cần thời gian xử lý: gọi LLM / fallback
    }),
}
