import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';
import { createBroadcastChannel } from '../utils/broadcastChannel';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Cargar carrito del localStorage al inicializar el estado
  const [cartItems, setCartItems] = useState(() => {
    return safeGetLocalStorage('cart', []);
  });

  // Referencia para evitar sincronización circular
  const isUpdatingFromSync = useRef(false);
  const channelRef = useRef(null);

  // Sincronización entre pestañas
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const channel = createBroadcastChannel('cart-sync');
    if (!channel) {
      return;
    }

    channelRef.current = channel;

    const handleMessage = (event) => {
      const data = event.data;
      if (data.type === 'CART_UPDATED' && !isUpdatingFromSync.current) {
        isUpdatingFromSync.current = true;
        setCartItems(data.cart);
        // Resetear flag después de un breve delay
        setTimeout(() => {
          isUpdatingFromSync.current = false;
        }, 100);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isUpdatingFromSync.current) {
      return; // No guardar si viene de sincronización
    }

    const saved = safeSetLocalStorage('cart', cartItems);
    if (saved && channelRef.current && !isUpdatingFromSync.current) {
      // Notificar a otras pestañas
      try {
        channelRef.current.postMessage({
          type: 'CART_UPDATED',
          cart: cartItems,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error sending broadcast message:', error);
      }
    }
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || !product.id) {
      console.error('Invalid product provided to addToCart');
      return;
    }

    if (quantity <= 0) {
      console.warn('Quantity must be greater than 0');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo al carrito
        return [...prevItems, { ...product, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    if (!productId) {
      console.error('Product ID is required to remove from cart');
      return;
    }

    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (!productId) {
      console.error('Product ID is required to update quantity');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Memoizar cálculos para evitar recalcular en cada render
  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.price ? parseFloat(item.price) : 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems]);

  // Funciones de acceso (mantener compatibilidad con código existente)
  const getTotalItems = useCallback(() => totalItems, [totalItems]);
  const getTotalPrice = useCallback(() => totalPrice, [totalPrice]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    totalItems, // Valores calculados directamente disponibles
    totalPrice
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

