import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../CartContext'
import { createMockProduct } from '../../test/utils/testUtils'

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage.clear()
    global.localStorage.setItem = vi.fn()
    global.localStorage.getItem = vi.fn(() => null)
  })

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

  it('debería inicializar con carrito vacío', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.cartItems).toEqual([])
    expect(result.current.getTotalItems()).toBe(0)
    expect(result.current.getTotalPrice()).toBe(0)
  })

  it('debería agregar un producto al carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product = createMockProduct({ id: 1, price: 29.99 })

    act(() => {
      result.current.addToCart(product, 2)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(1)
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.getTotalItems()).toBe(2)
    expect(result.current.getTotalPrice()).toBe(59.98)
  })

  it('debería incrementar la cantidad si el producto ya está en el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product = createMockProduct({ id: 1, price: 10 })

    act(() => {
      result.current.addToCart(product, 1)
    })

    act(() => {
      result.current.addToCart(product, 2)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(3)
    expect(result.current.getTotalItems()).toBe(3)
  })

  it('debería remover un producto del carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product1 = createMockProduct({ id: 1 })
    const product2 = createMockProduct({ id: 2 })

    act(() => {
      result.current.addToCart(product1, 1)
      result.current.addToCart(product2, 1)
    })

    expect(result.current.cartItems).toHaveLength(2)

    act(() => {
      result.current.removeFromCart(1)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(2)
  })

  it('debería actualizar la cantidad de un producto', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product = createMockProduct({ id: 1, price: 10 })

    act(() => {
      result.current.addToCart(product, 1)
    })

    act(() => {
      result.current.updateQuantity(1, 5)
    })

    expect(result.current.cartItems[0].quantity).toBe(5)
    expect(result.current.getTotalItems()).toBe(5)
    expect(result.current.getTotalPrice()).toBe(50)
  })

  it('debería limpiar el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product1 = createMockProduct({ id: 1 })
    const product2 = createMockProduct({ id: 2 })

    act(() => {
      result.current.addToCart(product1, 1)
      result.current.addToCart(product2, 1)
    })

    expect(result.current.cartItems).toHaveLength(2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.getTotalItems()).toBe(0)
  })

  it('debería calcular el total correctamente con múltiples productos', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product1 = createMockProduct({ id: 1, price: 10 })
    const product2 = createMockProduct({ id: 2, price: 20 })

    act(() => {
      result.current.addToCart(product1, 2)
      result.current.addToCart(product2, 3)
    })

    expect(result.current.getTotalPrice()).toBe(80) // (10 * 2) + (20 * 3)
  })

  it('debería cargar el carrito desde localStorage al inicializar', () => {
    const savedCart = [
      { id: 1, name: 'Product 1', price: 10, quantity: 2 }
    ]
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'cart') {
        return JSON.stringify(savedCart)
      }
      return null
    })

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(1)
  })

  it('debería guardar el carrito en localStorage cuando cambia', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product = createMockProduct({ id: 1 })

    act(() => {
      result.current.addToCart(product, 1)
    })

    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      expect.stringContaining('"id":1')
    )
  })
})
