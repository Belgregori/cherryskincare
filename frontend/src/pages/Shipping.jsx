import Header from '../components/Header';
import Footer from '../components/Footer';
import './Shipping.css';

const MINIMO_ENVIO_GRATIS = 15000;

function Shipping() {
  return (
    <div className="shipping-page">
      <Header />
      <div className="shipping-container">
        <div className="page-header">
          <h1>Envíos</h1>
          <p>Información sobre nuestros métodos de envío</p>
        </div>

        <div className="shipping-content">
          <div className="shipping-section">
            <h2>🚚 Envío Gratis</h2>
            <div className="free-shipping-info">
              <p className="highlight">
                Compras mayores a <strong>${MINIMO_ENVIO_GRATIS.toLocaleString('es-AR')}</strong> dentro del anillo de circunvalación de Córdoba tienen <strong>envío gratis</strong>.
              </p>
              <p>
                Si tu pedido supera este monto y estás dentro del anillo, el envío es completamente gratuito.
              </p>
            </div>
          </div>

          <div className="shipping-section">
            <h2>📍 Dentro del Anillo de Circunvalación</h2>
            <div className="shipping-options-list">
              <div className="option-item">
                <h3>Envío Gratis</h3>
                <p>Para compras mayores a ${MINIMO_ENVIO_GRATIS.toLocaleString('es-AR')}</p>
                <span className="option-price">$0</span>
              </div>
              <div className="option-item">
                <h3>Envío por Uber</h3>
                <p>Te contactamos para coordinar el envío por Uber</p>
                <span className="option-price">A coordinar</span>
              </div>
            </div>
          </div>

          <div className="shipping-section">
            <h2>📍 Fuera del Anillo de Circunvalación</h2>
            <div className="shipping-options-list">
              <div className="option-item">
                <h3>Envío por Uber</h3>
                <p>Te contactamos para coordinar el envío por Uber</p>
                <span className="option-price">A coordinar</span>
              </div>
              <div className="option-item">
                <h3>Punto de Encuentro (Sábados)</h3>
                <p>Coordinamos un punto de encuentro los sábados</p>
                <span className="option-price">$0</span>
              </div>
              <div className="option-item">
                <h3>Retiro Personal</h3>
                <p>Retirás en Barrio General Paz o Centro, Córdoba</p>
                <span className="option-price">$0</span>
              </div>
            </div>
          </div>

          <div className="shipping-info">
            <h3>ℹ️ Información Importante</h3>
            <ul>
              <li>Los tiempos de entrega se coordinan después de confirmar el pedido</li>
              <li>Te contactaremos por WhatsApp para coordinar la entrega</li>
              <li>El envío gratis aplica solo dentro del anillo de circunvalación</li>
              <li>Para consultas sobre envíos, contáctanos por WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Shipping;
