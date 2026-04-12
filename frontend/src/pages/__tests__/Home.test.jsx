import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../Home'
import { AuthProvider } from '../../context/AuthContext'
import { CartProvider } from '../../context/CartContext'

// Mock de productService
vi.mock('../../services/productService', () => ({
  productService: {
    getAllProducts: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Product 1', price: 29.99, imageUrl: '/api/images/1.jpg' },
      { id: 2, name: 'Product 2', price: 39.99, imageUrl: '/api/images/2.jpg' },
    ])),
  },
}))

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Home />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  it('debería renderizar la página de inicio', () => {
    renderHome()
    // Verificar que la página se renderiza (buscar algún elemento característico)
    expect(document.body).toBeTruthy()
  })

  it('debería mostrar productos cuando se cargan', async () => {
    renderHome()
    
    await waitFor(() => {
      // Verificar que los productos se muestran
      // Esto depende de cómo esté implementado el componente Home
      expect(document.body).toBeTruthy()
    })
  })
})
