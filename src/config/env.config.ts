/// <reference types="vite/client" />

import { z } from 'zod'

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Suntime F&B O2O'),
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_WS_URL: z.string().default('/ws'),
  VITE_API_TIMEOUT_MS: z.coerce.number().default(10000),
  VITE_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type AppEnv = z.infer<typeof envSchema>

// Kiểm định tĩnh Zod ngay khi App Boot
const parsedValues = envSchema.safeParse(import.meta.env)

if (!parsedValues.success) {
  console.error('❌ Mất hoặc sai cấu trúc biến môi trường Vite (.env):')
  parsedValues.error.issues.forEach(issue => console.error(`  - Lỗi tại ${issue.path.join('.')}: ${issue.message}`))
  throw new Error('Application Boot Error: Missing or Invalid .env Config variables. Check Console!')
}

export const ENV = parsedValues.data
