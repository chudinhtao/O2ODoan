export interface ChatMessage {
  id: string;
  sender: 'ADMIN' | 'AI';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}
