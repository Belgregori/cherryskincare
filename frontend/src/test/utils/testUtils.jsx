import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../../context/AuthContext'
import { CartProvider } from '../../context/CartContext'

/**
 * Renderiza un componente con todos los providers necesarios.
 * 
 * @param {React.ReactElement} ui - El componente a renderizar
 * @param {object} options - Opciones de renderizado
 * @param {object} options.initialAuthState - Estado inicial para AuthContext (mockeado)
 * @param {object} options.initialCartState - Estado inicial para CartContext (mockeado)
 * @param {boolean} options.withRouter - Si incluir BrowserRouter (default: true)
 * @returns {object} - Objeto con utilidades de testing
 */
export function renderWithProviders(ui, options = {}) {
  const {
    initialAuthState = null, // Si es null, usa el provider real
    initialCartState = null, // Si es null, usa el provider real
    withRouter = true,
  } = options

  // Mock de servicios si se proporciona estado inicial
  if (initialAuthState) {
    vi.mock('../../services/authService', () => ({
      authService: {
        getToken: vi.fn(() => initialAuthState.token || null),
        getUser: vi.fn(() => initialAuthState.user || null),
        getRefreshToken: vi.fn(() => initialAuthState.refreshToken || null),
        verifyToken: vi.fn(() => Promise.resolve()),
        refreshToken: vi.fn(() => Promise.resolve({ token: 'new-token' })),
      },
    }))
  }

  if (initialCartState) {
    // Mock de localStorage para el carrito
    const mockCart = initialCartState.items || []
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'cart') {
        return JSON.stringify(mockCart)
      }
      return null
    })
  }

  const Wrapper = ({ children }) => {
    let content = children

    if (!initialAuthState) {
      content = <AuthProvider>{content}</AuthProvider>
    }

    if (!initialCartState) {
      content = <CartProvider>{content}</CartProvider>
    }

    if (withRouter) {
      content = <BrowserRouter>{content}</BrowserRouter>
    }

    return content
  }

  return render(ui, { wrapper: Wrapper })
}

/**
 * Crea un mock de usuario para pruebas.
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    ...overrides,
  }
}

/**
 * Crea un mock de producto para pruebas.
 */
export function createMockProduct(overrides = {}) {
  return {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    imageUrl: '/api/images/test.jpg',
    category: 'skincare',
    stockQuantity: 10,
    isActive: true,
    ...overrides,
  }
}

/**
 * Crea un mock de item de carrito para pruebas.
 */
export function createMockCartItem(product = null, quantity = 1) {
  const mockProduct = product || createMockProduct()
  return {
    product: mockProduct,
    quantity,
  }
}

/**
 * Espera a que un elemento aparezca (útil para componentes asíncronos).
 */
export async function waitForElement(condition, timeout = 5000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      if (await condition()) {
        return true
      }
    } catch {
      // Continuar esperando
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Elemento no apareció en el tiempo esperado')
}

/**
 * Mock de navegación de React Router.
 */
export function createMockNavigate() {
  return vi.fn()
}

/**
 * Mock de useNavigate hook.
 */
export function mockUseNavigate(navigate = null) {
  const mockNavigate = navigate || createMockNavigate()
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    }
  })
  return mockNavigate
}
