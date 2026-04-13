import { Client, type StompSubscription } from '@stomp/stompjs'
import { ENV } from '@/config/env.config'

const RECONNECT_DELAY_MS = [1_000, 2_000, 5_000, 10_000, 30_000]

let client: Client | null = null
let retryCount = 0

export function getWsClient(
  getToken: () => string | null,
  onStateChange?: (connected: boolean) => void
): Client {
  if (client) {
    if (client.active) {
      if (client.connected) onStateChange?.(true)
      return client
    }
  }

  // Use raw WebSocket over the Gateway
  let baseURL = ENV.VITE_WS_URL || '/ws'
  // Đảm bảo là ws:// hoặc wss://
  if (baseURL.startsWith('http://')) baseURL = baseURL.replace('http://', 'ws://')
  if (baseURL.startsWith('https://')) baseURL = baseURL.replace('https://', 'wss://')
  
  const brokerURL = baseURL.startsWith('ws') 
    ? baseURL 
    : `ws://${location.host}${baseURL}`

  client = new Client({
    brokerURL:        brokerURL,
    reconnectDelay:   RECONNECT_DELAY_MS[Math.min(retryCount, RECONNECT_DELAY_MS.length - 1)],
    onStompError:     frame => console.error('[WS] STOMP error:', frame.headers['message']),
    onConnect:        () => { retryCount = 0; console.debug('[WS] Connected successfully'); onStateChange?.(true) },
    onDisconnect:     () => { retryCount++; console.debug('[WS] Disconnected'); onStateChange?.(false) },
  })

  client.beforeConnect = () => {
    const token = getToken()
    if (token) {
      // JWT tokens typically start with 'eyJ', SessionTokens are UUIDs
      if (token.startsWith('eyJ')) {
        client!.connectHeaders = { Authorization: `Bearer ${token}` }
      } else {
        client!.connectHeaders = { 'X-Session-Token': token }
      }
    } else {
      client!.connectHeaders = {}
    }
  }

  client.activate()
  return client
}

export function destroyWsClient() {
  client?.deactivate()
  client = null
  retryCount = 0
}

export type { StompSubscription }
