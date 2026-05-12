import type { AxiosResponse } from 'axios'
import type { IApiResponse } from '@/shared/types/IApiResponse'

const GENERIC_SUCCESS_MESSAGES = new Set(['Success', 'success', 'OK', 'Ok', 'ok'])

export function unwrapApiData<T>(response: AxiosResponse<IApiResponse<T>>): T {
  return response.data.data
}

export function unwrapApiResponse<T>(response: AxiosResponse<IApiResponse<T>>): IApiResponse<T> {
  return response.data
}

export function getSuccessMessage(message: string | null | undefined, fallback: string): string {
  if (!message || GENERIC_SUCCESS_MESSAGES.has(message.trim())) {
    return fallback
  }
  return message
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return apiMessage || fallback
}

export function hasApiValidationData(error: unknown): boolean {
  const data = (error as { response?: { data?: { data?: unknown } } })?.response?.data?.data
  return data != null && typeof data === 'object'
}
