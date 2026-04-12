import { useCart } from '../context/CartContext';
import './ShippingCalculator.css';

const MINIMUM_FREE_SHIPPING = 15000; // $15,000 pesos argentinos

function ShippingCalculator({ insideRing = false }) {
  const { getTotalPrice } = useCart();
  const total = getTotalPrice();
  const isEligibleForFreeShipping = insideRing && total >= MINIMUM_FREE_SHIPPING;
  const remainingAmount = Math.max(0, MINIMUM_FREE_SHIPPING - total);
  const progressPercentage = Math.min(100, (total / MINIMUM_FREE_SHIPPING) * 100);

  // Si ya es elegible, no mostrar la calculadora
  if (isEligibleForFreeShipping) {
    return (
      <div className="shipping-calculator free-shipping-achieved">
        <div className="success-message">
          🎉 ¡Felicitaciones! Tu pedido tiene envío gratis
        </div>
      </div>
    );
  }

  // Si no está dentro del anillo, no mostrar la calculadora
  if (!insideRing) {
    return null;
  }

  return (
    <div className="shipping-calculator">
      <div className="calculator-header">
        <h4>Envío Gratis</h4>
        <p className="minimum-amount">Compras mayores a ${MINIMUM_FREE_SHIPPING.toLocaleString('es-AR')}</p>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          >
            <span className="progress-text">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
        
        <div className="progress-info">
          {remainingAmount > 0 ? (
            <p className="remaining-amount">
              Te faltan <strong>${remainingAmount.toLocaleString('es-AR')}</strong> para el envío gratis
            </p>
          ) : (
            <p className="achieved-message">
              ¡Has alcanzado el envío gratis! 🎉
            </p>
          )}
        </div>
      </div>

      <div className="current-total">
        <span>Total actual: </span>
        <strong>${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>
    </div>
  );
}

export default ShippingCalculator;


