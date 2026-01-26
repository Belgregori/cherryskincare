# Guía de Pruebas

Este documento describe cómo ejecutar y escribir pruebas para la aplicación.

## Configuración

Las pruebas están configuradas con:
- **Vitest**: Framework de pruebas
- **React Testing Library**: Para probar componentes React
- **jsdom**: Entorno DOM simulado
- **@testing-library/user-event**: Para simular interacciones del usuario

## Ejecutar Pruebas

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas en modo watch

```bash
npm test -- --watch
```

### Ejecutar pruebas con UI

```bash
npm run test:ui
```

### Ejecutar pruebas con cobertura

```bash
npm run test:coverage
```

### Ejecutar pruebas específicas

```bash
npm test -- Header.test.jsx
```

## Estructura de Pruebas

Las pruebas están organizadas en la misma estructura que el código fuente:

```
src/
  components/
    __tests__/
      Header.test.jsx
      ProtectedRoute.test.jsx
  context/
    __tests__/
      AuthContext.test.jsx
      CartContext.test.jsx
  pages/
    __tests__/
      Home.test.jsx
  services/
    api.test.js
  test/
    utils/
      testUtils.jsx
      mocks.js
    setup.js
```

## Utilidades de Testing

### testUtils.jsx

Proporciona funciones helper para pruebas:

- `renderWithProviders()`: Renderiza componentes con todos los providers
- `createMockUser()`: Crea un usuario mock para pruebas
- `createMockProduct()`: Crea un producto mock para pruebas
- `createMockCartItem()`: Crea un item de carrito mock

### mocks.js

Contiene mocks comunes:
- `mockAxios`: Mock de axios
- `mockAuthService`: Mock de authService
- `mockProductService`: Mock de productService
- `resetAllMocks()`: Resetea todos los mocks

## Escribir Pruebas

### Ejemplo: Probar un Componente

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('debería renderizar correctamente', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Ejemplo: Probar con Providers

```jsx
import { renderWithProviders } from '../../test/utils/testUtils'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('debería funcionar con AuthProvider', () => {
    const { getByText } = renderWithProviders(
      <MyComponent />,
      {
        initialAuthState: {
          user: { id: 1, name: 'Test User' },
          token: 'test-token',
        },
      }
    )
    
    expect(getByText('Test User')).toBeInTheDocument()
  })
})
```

### Ejemplo: Probar Hooks

```jsx
import { renderHook, act } from '@testing-library/react'
import { useCart } from '../CartContext'
import { CartProvider } from '../CartContext'

describe('useCart', () => {
  it('debería agregar items al carrito', () => {
    const wrapper = ({ children }) => (
      <CartProvider>{children}</CartProvider>
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart({ id: 1, name: 'Product', price: 10 }, 2)
    })
    
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.getTotalItems()).toBe(2)
  })
})
```

### Ejemplo: Probar Navegación

```jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navigation', () => {
  it('debería navegar al hacer clic', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    )
    
    fireEvent.click(screen.getByRole('button', { name: /go to home/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
```

## Cobertura de Pruebas

### Componentes Probados

- ✅ **Header**: Renderizado, navegación, autenticación
- ✅ **ProtectedRoute**: Protección de rutas, roles

### Contextos Probados

- ✅ **AuthContext**: Login, logout, verificación de tokens, roles
- ✅ **CartContext**: Agregar, remover, actualizar items, calcular totales

### Páginas Probadas

- ✅ **Home**: Renderizado básico

### Servicios Probados

- ✅ **api**: Interceptores, headers, tokens

## Mejores Prácticas

### ✅ Hacer

- Probar comportamiento, no implementación
- Usar queries accesibles (getByRole, getByLabelText)
- Probar casos de éxito y error
- Limpiar mocks después de cada prueba
- Usar nombres descriptivos para las pruebas
- Agrupar pruebas relacionadas con `describe`

### ❌ Evitar

- No probar detalles de implementación
- No usar `getByTestId` a menos que sea necesario
- No hacer pruebas que dependan de otras pruebas
- No olvidar limpiar mocks y estado
- No hacer pruebas demasiado complejas

## Mocking

### Mock de Servicios

```jsx
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(() => 'mock-token'),
  },
}))
```

### Mock de Hooks

```jsx
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})
```

### Mock de localStorage

```jsx
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock
```

## Troubleshooting

### Error: "useCart must be used within CartProvider"

Asegúrate de envolver el componente con el provider:

```jsx
const wrapper = ({ children }) => (
  <CartProvider>{children}</CartProvider>
)
const { result } = renderHook(() => useCart(), { wrapper })
```

### Error: "Cannot read property 'querySelector' of null"

Asegúrate de que el componente esté renderizado antes de buscar elementos:

```jsx
const { container } = render(<MyComponent />)
await waitFor(() => {
  expect(container.querySelector('.my-class')).toBeInTheDocument()
})
```

### Las pruebas son lentas

- Usa `vi.useFakeTimers()` para pruebas con timers
- Mockea llamadas a APIs
- Usa `waitFor` con timeouts apropiados

## Próximos Pasos

### Pruebas Pendientes

- [ ] Más pruebas de páginas (Products, ProductDetail, Checkout)
- [ ] Pruebas de integración de flujos completos
- [ ] Pruebas de accesibilidad
- [ ] Pruebas de performance
- [ ] Pruebas E2E con Playwright o Cypress

### Mejoras

- [ ] Aumentar cobertura de código
- [ ] Agregar pruebas de snapshot
- [ ] Agregar pruebas visuales
- [ ] Configurar CI/CD para ejecutar pruebas automáticamente

## Referencias

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
