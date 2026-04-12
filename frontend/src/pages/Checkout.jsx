import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { getApiErrorMessage } from '../utils/apiError';
import { capitalizeFirst } from '../utils/formatUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShippingCalculator from '../components/ShippingCalculator';
import './Checkout.css';

const WHATSAPP_NUMBER = '5493515311969'; // Formato: código país (54) + 9 + número sin 0 inicial
const ALIAS = 'belencherry';
const NOMBRE_TRANSFERENCIA = 'Romina Belen Gregori';
const MINIMO_ENVIO_GRATIS = 15000;

function getShippingMethodLabel(method) {
  switch (method) {
    case 'gratis':
      return 'Envío gratis (dentro del anillo)';
    case 'uber':
      return 'Envío por Uber (a coordinar)';
    case 'sabado':
      return 'Punto de encuentro los sábados';
    case 'retiro':
      return 'Retiro personal (Gral Paz / Centro)';
    default:
      return method || '-';
  }
}

function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  /** transferencia | coordinar */
  const [paymentPreference, setPaymentPreference] = useState('transferencia');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.telefone || '',
    address: '',
    city: '',
    postalCode: '',
    insideRing: null, // null = no seleccionado, true = sí, false = no
    shippingMethod: '' // 'gratis', 'uber', 'sabado', 'retiro'
  });

  const subtotal = getTotalPrice();
  const isEligibleForFreeShipping = subtotal >= MINIMO_ENVIO_GRATIS && formData.insideRing === true;
  const shippingCost = isEligibleForFreeShipping ? 0 : (formData.shippingMethod === 'gratis' ? 0 : (formData.shippingMethod === 'retiro' ? 0 : (formData.shippingMethod === 'sabado' ? 0 : 0)));
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.telefone || prev.phone
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInsideRingChange = (value) => {
    setFormData(prev => ({
      ...prev,
      insideRing: value,
      shippingMethod: '' // Reset shipping method when changing location
    }));
  };

  const handleShippingMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      shippingMethod: method
    }));
  };

  const buildCheckoutWhatsAppMessage = () => {
    const productsText = cartItems
      .map(
        (item) =>
          `• ${capitalizeFirst(item.name)} x${item.quantity} — $${((item.price || 0) * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const envioLabel = isEligibleForFreeShipping
      ? 'Gratis'
      : formData.shippingMethod === 'retiro' || formData.shippingMethod === 'sabado'
        ? 'Gratis'
        : 'A coordinar';

    const pagoLine =
      paymentPreference === 'transferencia'
        ? `Transferencia — alias *${ALIAS}* a nombre de ${NOMBRE_TRANSFERENCIA}`
        : 'Coordinar medio de pago por este chat';

    return [
      'Hola! Quiero confirmar este pedido:',
      '',
      '*Productos:*',
      productsText,
      '',
      `Subtotal: $${subtotal.toFixed(2)}`,
      `Envío: ${envioLabel}`,
      `Total estimado: $${total.toFixed(2)}`,
      '',
      '*Mis datos:*',
      `Nombre: ${formData.name}`,
      `Teléfono: ${formData.phone}`,
      `Dirección: ${formData.address}, ${formData.city}${formData.postalCode ? `, CP ${formData.postalCode}` : ''}`,
      `¿Dentro del anillo de Córdoba?: ${formData.insideRing ? 'Sí' : 'No'}`,
      `Método de envío: ${getShippingMethodLabel(formData.shippingMethod)}`,
      '',
      '*Medio de pago elegido:*',
      pagoLine
    ].join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.insideRing === null) {
      setError('Por favor indica si estás dentro del anillo de circunvalación');
      return;
    }

    if (!formData.shippingMethod) {
      setError('Por favor selecciona un método de envío');
      return;
    }

    setLoading(true);

    try {
      if (isAuthenticated && user?.id) {
        const orderData = {
          orderItems: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          })),
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingPostalCode: formData.postalCode,
          shippingPhone: formData.phone,
          customerName: formData.name,
          insideRing: formData.insideRing,
          shippingMethod: formData.shippingMethod,
          paymentMethod: paymentPreference === 'transferencia' ? 'TRANSFERENCIA' : 'WHATSAPP'
        };

        const order = await orderService.createOrder(user.id, orderData);
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
        return;
      }

      const waText = buildCheckoutWhatsAppMessage();
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`,
        '_blank'
      );
      clearCart();
      navigate('/payment-methods');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al crear la orden. Por favor intenta nuevamente.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (formData.shippingMethod && formData.insideRing !== null) {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildCheckoutWhatsAppMessage())}`,
        '_blank'
      );
      return;
    }

    const productsText = cartItems
      .map(
        (item) =>
          `• ${capitalizeFirst(item.name)} x${item.quantity} - $${((item.price || 0) * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const message = `Hola! Quiero realizar un pedido:\n\n${productsText}\n\nTotal: $${subtotal.toFixed(2)}\n\nDirección: ${formData.address || '(pendiente)'}, ${formData.city || ''}\nTeléfono: ${formData.phone || ''}\n\nTengo dudas o quiero coordinar el pago.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="checkout-container">
          <p className="checkout-redirect-msg">Tu carrito está vacío. Redirigiendo al inicio…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />
      <div className="checkout-container">
        <h1>Finalizar Compra</h1>
        {!isAuthenticated && (
          <p className="checkout-guest-hint">
            No hace falta iniciar sesión: al confirmar se abre WhatsApp con tu pedido y te llevamos a{' '}
            <strong>Medios de pago</strong> para ver alias y datos de transferencia.
          </p>
        )}

        <div className="checkout-content">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form" aria-label="Formulario de checkout">
              <h2 id="contact-heading">Datos de Contacto</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Nombre Completo <span className="required-asterisk" aria-label="requerido">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Teléfono de Contacto <span className="required-asterisk" aria-label="requerido">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  placeholder="3511234567"
                  autoComplete="tel"
                />
              </div>

              <h2 id="shipping-heading">Dirección de Envío</h2>

              <div className="form-group">
                <label htmlFor="address">
                  Dirección <span className="required-asterisk" aria-label="requerido">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  placeholder="Calle y número"
                  autoComplete="street-address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">
                    Ciudad <span className="required-asterisk" aria-label="requerido">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    placeholder="Córdoba"
                    autoComplete="address-level2"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode">Código Postal</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="X5000"
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              <fieldset>
                <legend id="inside-ring-question">
                  <h2>¿Estás dentro del anillo de circunvalación de Córdoba?</h2>
                </legend>
                <div className="radio-group" role="radiogroup" aria-labelledby="inside-ring-question">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="insideRing"
                      value="true"
                      checked={formData.insideRing === true}
                      onChange={() => handleInsideRingChange(true)}
                      required
                      aria-required="true"
                    />
                    <span>Sí</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="insideRing"
                      value="false"
                      checked={formData.insideRing === false}
                      onChange={() => handleInsideRingChange(false)}
                      required
                      aria-required="true"
                    />
                    <span>No</span>
                  </label>
                </div>
              </fieldset>

              {formData.insideRing !== null && (
                <>
                  {/* Calculadora de envío - solo si está dentro del anillo */}
                  {formData.insideRing && (
                    <ShippingCalculator insideRing={formData.insideRing} />
                  )}

                  <h2>Método de Envío</h2>
                  
                  {formData.insideRing ? (
                    // Dentro del anillo
                    <div className="shipping-options">
                      {isEligibleForFreeShipping ? (
                        <div className="shipping-option selected">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="gratis"
                            checked={formData.shippingMethod === 'gratis'}
                            onChange={() => handleShippingMethodChange('gratis')}
                            required
                          />
                          <div className="option-info">
                            <h3>Envío Gratis</h3>
                            <p>Tu compra supera los {MINIMO_ENVIO_GRATIS.toLocaleString()}. Envío gratis dentro del anillo.</p>
                            <span className="option-price">$0</span>
                          </div>
                        </div>
                      ) : (
                        <div className="shipping-option">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="uber"
                            checked={formData.shippingMethod === 'uber'}
                            onChange={() => handleShippingMethodChange('uber')}
                            required
                          />
                          <div className="option-info">
                            <h3>Envío por Uber</h3>
                            <p>Te contactaremos para coordinar el envío por Uber.</p>
                            <span className="option-price">A coordinar</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fuera del anillo
                    <div className="shipping-options">
                      <div className="shipping-option">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="uber"
                          checked={formData.shippingMethod === 'uber'}
                          onChange={() => handleShippingMethodChange('uber')}
                          required
                        />
                        <div className="option-info">
                          <h3>Envío por Uber</h3>
                          <p>Te contactaremos para coordinar el envío por Uber.</p>
                          <span className="option-price">A coordinar</span>
                        </div>
                      </div>
                      
                      <div className="shipping-option">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="sabado"
                          checked={formData.shippingMethod === 'sabado'}
                          onChange={() => handleShippingMethodChange('sabado')}
                          required
                        />
                        <div className="option-info">
                          <h3>Punto de Encuentro (Sábados)</h3>
                          <p>Coordinamos un punto de encuentro los sábados.</p>
                          <span className="option-price">$0</span>
                        </div>
                      </div>
                      
                      <div className="shipping-option">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="retiro"
                          checked={formData.shippingMethod === 'retiro'}
                          onChange={() => handleShippingMethodChange('retiro')}
                          required
                        />
                        <div className="option-info">
                          <h3>Retiro Personal</h3>
                          <p>Retirás en Barrio General Paz o Centro.</p>
                          <span className="option-price">$0</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {formData.shippingMethod ? (
                <>
                  <h2 id="payment-preference-heading">Medio de pago</h2>
                  <div
                    className="shipping-options payment-options-checkout"
                    role="radiogroup"
                    aria-labelledby="payment-preference-heading"
                  >
                    <label
                      className={`shipping-option ${paymentPreference === 'transferencia' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentPreference"
                        value="transferencia"
                        checked={paymentPreference === 'transferencia'}
                        onChange={() => setPaymentPreference('transferencia')}
                      />
                      <div className="option-info">
                        <h3>Transferencia bancaria</h3>
                        <p>
                          Pagás con alias <strong>{ALIAS}</strong>. En el resumen tenés los datos completos.
                        </p>
                      </div>
                    </label>
                    <label
                      className={`shipping-option ${paymentPreference === 'coordinar' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentPreference"
                        value="coordinar"
                        checked={paymentPreference === 'coordinar'}
                        onChange={() => setPaymentPreference('coordinar')}
                      />
                      <div className="option-info">
                        <h3>Coordinar por WhatsApp</h3>
                        <p>Prefiero acordar el pago por mensaje.</p>
                      </div>
                    </label>
                  </div>
                </>
              ) : null}

              {error && (
                <div className="error-message">{error}</div>
              )}

              <button
                type="submit"
                className="submit-order-button"
                disabled={loading || !formData.shippingMethod}
              >
                {loading
                  ? 'Procesando...'
                  : isAuthenticated
                    ? 'Confirmar pedido'
                    : 'Enviar pedido por WhatsApp'}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <div className="summary-card">
              <h2>Resumen del Pedido</h2>
              
              <div className="order-items-summary">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-info">
                      <span className="item-name">{capitalizeFirst(item.name)}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-subtotal">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío:</span>
                  <span>
                    {isEligibleForFreeShipping ? 'Gratis' : (formData.shippingMethod === 'retiro' || formData.shippingMethod === 'sabado' ? 'Gratis' : 'A coordinar')}
                  </span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total:</span>
                  <span className="total-amount">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-info">
                <h3>Datos para Transferencia</h3>
                <p><strong>Alias:</strong> {ALIAS}</p>
                <p><strong>A nombre de:</strong> {NOMBRE_TRANSFERENCIA}</p>
                <p className="payment-note">
                  Te contactaremos por WhatsApp para coordinar el pago.
                </p>
              </div>

              <button 
                className="whatsapp-button"
                onClick={handleWhatsAppContact}
                type="button"
              >
                💬 Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Checkout;

