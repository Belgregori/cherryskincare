import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '../../services/authService'
import { errorLoggingService } from '../../services/errorLoggingService'

// Mock de servicios
vi.mock('../../services/authService', () => ({
  authService: {
    getToken: vi.fn(),
    getUser: vi.fn(),
    getRefreshToken: vi.fn(),
    verifyToken: vi.fn(),
    refreshToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('../../services/errorLoggingService', () => ({
  errorLoggingService: {
    setUser: vi.fn(),
    clearUser: vi.fn(),
    logError: vi.fn(),
  },
}))

vi.mock('../../utils/jwtUtils', () => ({
  isTokenExpired: vi.fn(() => false),
  getRoleFromToken: vi.fn(() => 'USER'),
  getTokenClaims: vi.fn(() => ({ sub: 'test@example.com', role: 'USER' })),
  hasRole: vi.fn(() => false),
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage.clear()
  })

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

  it('debería inicializar sin usuario cuando no hay token', async () => {
    authService.getToken.mockReturnValue(null)
    authService.getUser.mockReturnValue(null)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  it('debería cargar usuario cuando hay token válido', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
    const mockToken = 'valid-token'

    authService.getToken.mockReturnValue(mockToken)
    authService.getUser.mockReturnValue(mockUser)
    authService.verifyToken.mockResolvedValue({})

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('debería hacer login correctamente', async () => {
    const mockResponse = {
      token: 'new-token',
      refreshToken: 'refresh-token',
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    }

    authService.login.mockResolvedValue(mockResponse)
    authService.getToken.mockReturnValue('new-token')

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(result.current.user).toBeTruthy()
  })

  it('debería hacer logout correctamente', async () => {
    authService.logout.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(authService.logout).toHaveBeenCalled()
    expect(errorLoggingService.clearUser).toHaveBeenCalled()
  })

  it('debería verificar si es admin correctamente', async () => {
    const { hasRole } = await import('../../utils/jwtUtils')
    hasRole.mockReturnValue(true)

    const mockUser = { id: 1, role: 'ADMIN' }
    authService.getToken.mockReturnValue('admin-token')
    authService.getUser.mockReturnValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAdmin()).toBe(true)
    })
  })
})
