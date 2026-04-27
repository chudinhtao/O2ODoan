import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { ChatRequest, ChatResponse } from '../types/admin-chat.type'

import { IApiResponse } from '@/shared/types/IApiResponse'

export const adminChatService = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await http.post<IApiResponse<ChatResponse>>(API_ROUTES.ai.adminChat, payload);
    return data.data; // Unwrap the ApiResponse wrapper to get ChatResponse
  }
}
