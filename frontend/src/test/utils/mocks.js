import { vi } from 'vitest'

/**
 * Mocks comunes para pruebas.
 */

// Mock de axios
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
      handlers: [],
    },
    response: {
      use: vi.fn(),
      handlers: [],
    },
  },
  defaults: {
    baseURL: 'http://localhost:8080/api',
    headers: {},
  },
}

// Mock de authService
export const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  verifyToken: vi.fn(),
  refreshToken: vi.fn(),
  getToken: vi.fn(),
  getRefreshToken: vi.fn(),
  getUser: vi.fn(),
  isAuthenticated: vi.fn(),
}

// Mock de productService
export const mockProductService = {
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  searchProducts: vi.fn(),
  getProductsByCategory: vi.fn(),
}

// Mock de orderService
export const mockOrderService = {
  createOrder: vi.fn(),
  getOrderById: vi.fn(),
  getUserOrders: vi.fn(),
}

// Mock de localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Helper para resetear todos los mocks
export function resetAllMocks() {
  vi.clearAllMocks()
  Object.values(mockAxios).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear()
    }
  })
  Object.values(mockAuthService).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear()
    }
  })
}
