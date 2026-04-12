import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import { AuthProvider } from '../../context/AuthContext'

// Mock de servicios
vi.mock('../../services/authService', () => ({
  authService: {
    getToken: vi.fn(() => null),
    getUser: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    verifyToken: vi.fn(() => Promise.resolve()),
    logout: vi.fn(),
  },
}))

vi.mock('../../services/errorLoggingService', () => ({
  errorLoggingService: {
    setUser: vi.fn(),
    clearUser: vi.fn(),
  },
}))

vi.mock('../../utils/jwtUtils', () => ({
  isTokenExpired: vi.fn(() => false),
  getRoleFromToken: vi.fn(() => 'USER'),
  hasRole: vi.fn(() => false),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage.clear()
  })

  const renderWithRouter = (isAuthenticated = false, isAdmin = false) => {
    // Mock de localStorage para simular autenticación
    if (isAuthenticated) {
      global.localStorage.getItem = vi.fn((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ id: 1, role: isAdmin ? 'ADMIN' : 'USER' })
        return null
      })
    } else {
      global.localStorage.getItem = vi.fn(() => null)
    }

    return render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Contenido protegido</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <div>Contenido de admin</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login</div>} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('debería redirigir al login cuando no está autenticado', async () => {
    renderWithRouter(false)
    
    // Navegar a la ruta protegida
    window.history.pushState({}, '', '/protected')
    
    // Esperar a que se procese la redirección
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verificar que se muestra el login (o que no se muestra el contenido protegido)
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('debería mostrar el contenido cuando está autenticado', async () => {
    renderWithRouter(true)
    
    window.history.pushState({}, '', '/protected')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // El contenido protegido debería estar visible
    const content = screen.queryByText('Contenido protegido')
    expect(content).toBeTruthy()
  })

  it('debería redirigir cuando requiere admin y el usuario no es admin', async () => {
    renderWithRouter(true, false)
    
    window.history.pushState({}, '', '/admin')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    expect(screen.queryByText('Contenido de admin')).not.toBeInTheDocument()
  })

  it('debería mostrar contenido de admin cuando el usuario es admin', async () => {
    const { hasRole } = await import('../../utils/jwtUtils')
    hasRole.mockReturnValue(true)
    
    renderWithRouter(true, true)
    
    window.history.pushState({}, '', '/admin')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const content = screen.queryByText('Contenido de admin')
    expect(content).toBeTruthy()
  })
})
