import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';
import { capitalizeFirst } from '../utils/formatUtils';
import ShippingCalculator from './ShippingCalculator';
import './CartSidebar.css';

function CartSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const total = getTotalPrice();

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    updateQuantity(productId, quantity);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-sidebar-overlay" onClick={onClose}></div>
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-sidebar-header">
          <h2>Carrito de Compras</h2>
          <button onClick={onClose} className="close-button" aria-label="Cerrar carrito">
            ×
          </button>
        </div>

        <div className="cart-sidebar-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <p>Tu carrito está vacío</p>
              <p className="empty-cart-hint">Agrega productos para comenzar a comprar</p>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-sidebar-item">
                    <div className="cart-item-image-small">
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={capitalizeFirst(item.name)}
                          onError={(e) => {
                            console.error('Error loading image:', item.imageUrl, e);
                            e.target.src = 'https://via.placeholder.com/80x80?text=Sin+Imagen';
                          }}
                        />
                      ) : (
                        <div className="no-image-small">Sin imagen</div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <h4 onClick={() => { onClose(); navigate(`/product/${item.id}`); }} className="cart-item-name-link">
                        {capitalizeFirst(item.name)}
                      </h4>
                      <p className="cart-item-price-small">${item.price?.toFixed(2)} c/u</p>
                      
                      <div className="cart-item-quantity-controls">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="qty-button"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="qty-button"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      <p>${((item.price || 0) * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-item-btn"
                        aria-label="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <button onClick={clearCart} className="clear-cart-btn">
                  Vaciar Carrito
                </button>
              )}

              {/* Calculadora de envío - siempre visible para incentivar compra */}
              {cartItems.length > 0 && (
                <ShippingCalculator insideRing={true} />
              )}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-total">
              <span className="total-label">Total:</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="checkout-btn">
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;

