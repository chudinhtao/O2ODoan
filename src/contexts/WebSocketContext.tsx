import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Client, StompSubscription } from '@stomp/stompjs'
import { getWsClient, destroyWsClient } from '@/services/websocket'
import { useAppSelector } from '@/store/hooks'

interface IWebSocketContext {
  subscribe: (topic: string, cb: (msg: string) => void) => StompSubscription | null
  isConnected: boolean
}

const WebSocketContext = createContext<IWebSocketContext | null>(null)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const clientRef  = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // 1. JWT for Staff/Admin
  const accessToken = useAppSelector(s => s.auth.accessToken)
  // 2. UUID for Customers scanning QR
  const sessionToken = new URLSearchParams(window.location.search).get('t')

  const activeToken = accessToken || sessionToken

  useEffect(() => {
    clientRef.current = getWsClient(() => activeToken, setIsConnected)
    return () => { 
      // If we completely unmount the provider, we destroy.
      // Usually, keep it alive unless the app is unmounted. 
      // But we will reset state anyway.
      destroyWsClient();
      setIsConnected(false);
    }
  }, [activeToken])

  const subscribe = (topic: string, cb: (msg: string) => void): StompSubscription | null => {
    const client = clientRef.current
    if (!client?.connected) {
      return null
    }
    return client.subscribe(topic, frame => cb(frame.body))
  }

  return (
    <WebSocketContext.Provider value={{ subscribe, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocketCtx = (): IWebSocketContext => {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useWebSocketCtx must be inside WebSocketProvider')
  return ctx
}
