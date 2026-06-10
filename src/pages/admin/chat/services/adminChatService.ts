import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { AdminChatApiData, ChatRequest, ChatResponse } from '../types/admin-chat.type'

import type { IApiResponse } from '@/shared/types/IApiResponse'

export const adminChatService = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await http.post<IApiResponse<AdminChatApiData>>(API_ROUTES.ai.adminChat, payload, {
      timeout: 60_000, // AI cần thời gian xử lý: LLM routing + nhiều SQL queries
    });
    const apiData = data.data;

    if (apiData && typeof apiData === 'object' && 'reply' in apiData) {
      return apiData;
    }

    return {
      reply: typeof apiData === 'string'
        ? apiData
        : data.message || 'Khong co noi dung phan hoi tu tro ly AI.',
      sessionId: payload.sessionId,
    };
  }
}
