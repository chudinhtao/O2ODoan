import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { timeService } from './time.service'
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry'
import { toast } from 'sonner'
import { store } from '@/store'
import { setTokens, logout } from '@/store/slices/auth.slice'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { ROUTES } from '@/shared/constants/ROUTES'
import { ENV } from '@/config/env.config'
import { queryClient } from '@/providers/AppProviders'

const http = axios.create({
  baseURL: ENV.VITE_API_BASE_URL,
  timeout: ENV.VITE_API_TIMEOUT_MS,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})

// === CƠ CHẾ TÁI THỬ CHỈ DÀNH CHO GET (axios-retry) ===
axiosRetry(http, {
  retries: 2,
  retryDelay: (retryCount) => {
    return retryCount * 1000 // Exponential / linear backoff: 1s, 2s
  },
  retryCondition: (error: AxiosError) => {
    // Chỉ retry khi HTTP method là GET (chống nạn trùng dữ liệu POST/PUT/DELETE)
    if (error.config?.method !== 'get') {
      return false
    }
    // Và điều kiện phải là Lỗi Mạng rớt kết nối hoặc 5xx Server
    return isNetworkOrIdempotentRequestError(error)
  }
})

// === WHITELIST / DANH SÁCH MIỄN TRỪ KIỂM TOÁN TOKEN ===
const PUBLIC_URLS = [
  API_ROUTES.auth.login,
  API_ROUTES.auth.refresh
]

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken

  // KHI KHỞI TẠO REQUEST: Nếu là đường dẫn an toàn (Public), bỏ qua Bearer Token để giảm Request Size
  if (config.url && PUBLIC_URLS.some(u => config.url?.includes(u))) {
    return config
  }

  // Khác Public? Nhét thẻ Authorization Token vào
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// === HÀNG ĐỢI SILENT REFRESH (XỬ LÝ ĐỒNG THỜI NHIỀU API BỊ VĂNG TOKEN CÙNG LÚC) ====
let isRefreshing = false
let pendingQueue: Array<(token: string) => void> = []

const resolvePendingQueue = (token: string) => {
  pendingQueue.forEach(fn => fn(token));
  pendingQueue = []
}

http.interceptors.response.use(
  (res: AxiosResponse) => {
    // Tự động đồng bộ thời gian từ mọi ApiResponse
    const serverTime = res.data?.serverTime
    if (serverTime) {
      timeService.sync(serverTime)
    }
    return res
  },
  async (err: AxiosError) => {
    // Ngay cả khi lỗi, nếu server vẫn trả về serverTime thì vẫn sync
    const serverTime = (err.response?.data as any)?.serverTime
    if (serverTime) {
      timeService.sync(serverTime)
    }

    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = err.response?.status

    // === TRẠM TOAST BÁO LỖI TOÀN CỤC ====
    if (!original._retry) {
      const apiMessage = (err.response?.data as any)?.message

      if (status === 403) {
        toast.error(apiMessage || 'Bạn không có quyền thực hiện hành động này!')
      } else if (status === 404) {
        toast.error(apiMessage || 'Dữ liệu không tồn tại hoặc đã bị xóa!')
      } else if (status === 500) {
        // Ưu tiên hiển thị message cụ thể của BE nếu có (giúp debug rớt DB), fallback về chung chung
        toast.error(apiMessage || 'Máy chủ tạm thời bị lỗi, vui lòng thử lại sau.')
      } else if (status === 400) {
        // Lỗi 400 từ Backend có 2 loại: Business Exception (có message) hoặc Validation (có data object)
        const isValidationError = (err.response?.data as any)?.data != null && typeof (err.response?.data as any)?.data === 'object'
        if (isValidationError) {
          toast.error('Dữ liệu không hợp lệ, vui lòng kiểm tra lại!')
          // Để nguyên cho UI Form tự bắt
        } else {
          toast.error(apiMessage || 'Dữ liệu yêu cầu không thành công!')
        }
      } else if (!status && err.code === 'ECONNABORTED') {
        toast.error('Kết nối máy chủ bị ngắt. Vui lòng kiểm tra lại đường truyền mạng.')
      } else if (status && status !== 401) {
        // Fallback catch-all for other errors not handled above
        toast.error(apiMessage || 'Đã có lỗi xảy ra, vui lòng thử lại!')
      }
    }

    // === TÓM DÍNH LỖI 401 UNAUTHORIZED: CƠ CHẾ GỌI SILENT REFRESH ====
    if (status === 401 && !original._retry) {
      // Customer app (QR ordering) không có JWT — không cần refresh, không redirect login
      const isCustomerPage = window.location.search.includes('t=') || window.location.search.includes('qr=')
      if (isCustomerPage) {
        return Promise.reject(err)
      }

      original._retry = true

      // Kịch bản A: Lệnh Refresh đang chạy ở 1 API Thread khác (Nghĩa là đồng thời lúc đó máy gọi tới 5 API khác nhau). 
      // Ta nhồi Callback Pending API này vào mảng Chờ.
      if (isRefreshing) {
        return new Promise(resolve => {
          pendingQueue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(http(original))
          })
        })
      }

      isRefreshing = true

      try {
        const refreshToken = store.getState().auth.refreshToken
        if (!refreshToken) throw new Error('No refresh token available')

        // Kịch bản B: Ta là người đầu tiên phát hiện rớt 401. Ta gọi '/auth/refresh' chìm.
        const { data } = await axios.post(
          API_ROUTES.auth.refresh,
          { refreshToken },
          { baseURL: ENV.VITE_API_BASE_URL, headers: { 'Content-Type': 'application/json' } }
        )
        const newToken: string = data.data.accessToken
        const newRefreshToken: string = data.data.refreshToken

        // 1. Phân phát Token về Redux Store
        store.dispatch(setTokens({ accessToken: newToken, refreshToken: newRefreshToken }))
        // 2. Kêu gọi lũ Callback bị kẹt ở Kịch Bản A: "Cha có thẻ mới rồi, các con chạy lại tiếp đi!"
        resolvePendingQueue(newToken)

        // 3. Chạy lại chính API gây lỗi 401 của bản thân tôi ban nãy
        original.headers.Authorization = `Bearer ${newToken}`
        return http(original)
      } catch {
        // Thảm hoạ C: Cố tình Refresh gọi tới BE nhưng BE chối từ (Cookie cũng đã mốc khô hết hạn).
        // Phải dọn nhà cho sạch store redux và ép logout về thẳng nhà login.
        store.dispatch(logout())
        queryClient.clear()
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hệ thống.')
        window.location.href = ROUTES.login
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // Xả lỗi rác ngược về cho khối catch{} của Component.
    return Promise.reject(err)
  }
)

export default http
