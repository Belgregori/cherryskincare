import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

// Mock del contexto de autenticación
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: () => false,
    loading: false,
    user: { role: 'USER' }
  })
}))

describe('ProtectedRoute', () => {
  it('debería renderizar el contenido cuando el usuario está autenticado', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Contenido protegido</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})
