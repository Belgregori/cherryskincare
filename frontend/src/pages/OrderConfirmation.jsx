import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { getApiErrorMessage } from '../utils/apiError';
import { capitalizeFirst } from '../utils/formatUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderConfirmation.css';

const WHATSAPP_NUMBER = '5493515311969'; // Formato: código país (54) + 9 + número sin 0 inicial
const ALIAS = 'belencherry';
const NOMBRE_TRANSFERENCIA = 'Romina Belen Gregori';

function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadOrder();
  }, [id, isAuthenticated, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al cargar la orden'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hola! Tengo dudas sobre mi pedido #${order.id} o quiero coordinar el pago.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <Header />
        <div className="confirmation-container">
          <div className="loading">Cargando orden...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <Header />
        <div className="confirmation-container">
          <div className="error">{error || 'Orden no encontrada'}</div>
          <button onClick={() => navigate('/')} className="back-button">
            Volver al inicio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const getShippingMethodText = () => {
    if (order.shippingMethod === 'gratis') return 'Envío Gratis';
    if (order.shippingMethod === 'uber') return 'Envío por Uber';
    if (order.shippingMethod === 'sabado') return 'Punto de Encuentro (Sábados)';
    if (order.shippingMethod === 'retiro') return 'Retiro Personal';
    return 'A coordinar';
  };

  return (
    <div className="order-confirmation-page">
      <Header />
      <div className="confirmation-container">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>
          <h1>¡Pedido Confirmado!</h1>
          <p className="confirmation-message">
            Tu pedido ha sido recibido. Te contactaremos por WhatsApp para coordinar el pago.
          </p>

          <div className="order-details">
            <div className="detail-section">
              <h2>Número de Pedido</h2>
              <p className="order-number">#{order.id}</p>
            </div>

            <div className="detail-section">
              <h2>Dirección de Envío</h2>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}</p>
              {order.shippingPostalCode && <p>CP: {order.shippingPostalCode}</p>}
              {order.shippingPhone && <p>Tel: {order.shippingPhone}</p>}
            </div>

            <div className="detail-section">
              <h2>Método de Envío</h2>
              <p>{getShippingMethodText()}</p>
            </div>

            <div className="detail-section">
              <h2>Productos</h2>
              <div className="order-items-list">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.productName ? capitalizeFirst(item.productName) : `Producto #${item.productId}`}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">${parseFloat(item.price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section total-section">
              <div className="total-row">
                <span>Total:</span>
                <span className="total-amount">${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-instructions">
            <h2>Instrucciones de Pago</h2>
            <div className="payment-details">
              <p><strong>Alias:</strong> {ALIAS}</p>
              <p><strong>A nombre de:</strong> {NOMBRE_TRANSFERENCIA}</p>
              <p className="payment-note">
                Te contactaremos por WhatsApp al número {order.shippingPhone} para coordinar el pago y la entrega.
              </p>
            </div>
          </div>

          <div className="confirmation-actions">
            <button onClick={handleWhatsAppContact} className="whatsapp-button">
              💬 Contactar por WhatsApp
            </button>
            <button onClick={() => navigate('/')} className="continue-shopping-button">
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderConfirmation;

