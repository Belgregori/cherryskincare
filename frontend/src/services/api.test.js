import { describe, it, expect, vi, beforeEach } from 'vitest'
import api, { IMAGE_BASE_URL } from './api'

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería tener la URL base configurada', () => {
    expect(api.defaults.baseURL).toBeDefined()
  })

  it('debería tener IMAGE_BASE_URL exportado', () => {
    expect(IMAGE_BASE_URL).toBeDefined()
  })

  it('debería agregar token al header cuando existe en localStorage', () => {
    localStorageMock.getItem.mockReturnValue('test-token-123')
    
    // Simular una request
    const config = api.interceptors.request.handlers[0].fulfilled({
      headers: {}
    })

    expect(config.headers.Authorization).toBe('Bearer test-token-123')
  })

  it('no debería agregar token cuando no existe en localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const config = api.interceptors.request.handlers[0].fulfilled({
      headers: {}
    })

    expect(config.headers.Authorization).toBeUndefined()
  })
})
