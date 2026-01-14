import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';
import './ShoppingCart.css';

function ShoppingCart() {
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = getTotalItems();

  return (
    <>
      <div className="shopping-cart">
        <button 
          className="cart-button" 
          aria-label="Shopping cart"
          onClick={() => setIsCartOpen(true)}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {itemCount > 0 && (
            <span className="cart-badge">{itemCount}</span>
          )}
        </button>
      </div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default ShoppingCart;

