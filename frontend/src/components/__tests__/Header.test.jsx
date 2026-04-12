import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'
import { AuthProvider } from '../../context/AuthContext'

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock de window.confirm
global.window.confirm = vi.fn(() => true)

// Mock de authService
vi.mock('../../services/authService', () => ({
  authService: {
    getToken: vi.fn(() => null),
    getUser: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    verifyToken: vi.fn(() => Promise.resolve()),
    logout: vi.fn(() => Promise.resolve()),
  },
}))

// Mock de errorLoggingService
vi.mock('../../services/errorLoggingService', () => ({
  errorLoggingService: {
    setUser: vi.fn(),
    clearUser: vi.fn(),
    logError: vi.fn(),
  },
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  const renderHeader = (user = null) => {
    // Mock de localStorage para el usuario
    if (user) {
      global.localStorage.getItem = vi.fn((key) => {
        if (key === 'user') {
          return JSON.stringify(user)
        }
        return null
      })
    } else {
      global.localStorage.getItem = vi.fn(() => null)
    }

    return render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('debería renderizar el logo', () => {
    renderHeader()
    const logo = screen.getByRole('link', { name: /cherry/i })
    expect(logo).toBeInTheDocument()
  })

  it('debería mostrar enlace de login cuando no está autenticado', () => {
    renderHeader()
    const loginLink = screen.getByRole('link', { name: /inicia sesión/i })
    expect(loginLink).toBeInTheDocument()
  })

  it('debería mostrar enlace de registro cuando no está autenticado', () => {
    renderHeader()
    const registerLink = screen.getByRole('link', { name: /registrarse/i })
    expect(registerLink).toBeInTheDocument()
  })

  it('debería mostrar nombre del usuario cuando está autenticado', async () => {
    const user = { id: 1, name: 'Test User', email: 'test@example.com' }
    renderHeader(user)
    
    // Esperar a que el componente se actualice
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // El nombre del usuario debería aparecer
    const userName = screen.queryByText('Test User')
    expect(userName || screen.queryByText('test@example.com')).toBeTruthy()
  })

  it('debería mostrar botón de cerrar sesión cuando está autenticado', async () => {
    const user = { id: 1, name: 'Test User', email: 'test@example.com' }
    renderHeader(user)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const logoutButton = screen.queryByRole('button', { name: /cerrar sesión/i })
    expect(logoutButton).toBeTruthy()
  })

  it('debería abrir/cerrar el menú al hacer clic en el botón de menú', () => {
    renderHeader()
    const menuToggle = screen.getByRole('button', { name: /toggle menu/i })
    
    fireEvent.click(menuToggle)
    
    const menu = document.querySelector('.dropdown-menu')
    expect(menu).toHaveClass('open')
    
    fireEvent.click(menuToggle)
    expect(menu).not.toHaveClass('open')
  })

  it('debería navegar al inicio al hacer clic en el logo', () => {
    renderHeader()
    const logo = screen.getByRole('link', { name: /cherry/i })
    
    fireEvent.click(logo)
    
    expect(logo).toHaveAttribute('href', '/')
  })

  it('debería mostrar enlaces de navegación', () => {
    renderHeader()
    
    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /productos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /categorías/i })).toBeInTheDocument()
  })
})
