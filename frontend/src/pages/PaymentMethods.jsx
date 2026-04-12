import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';
import './PaymentMethods.css';

const ALIAS = 'belencherry';
const NOMBRE_TRANSFERENCIA = 'Romina Belen Gregori';
const WHATSAPP_NUMBER = '5493515311969';

function PaymentMethods() {
  const { showToast } = useToast();

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola! Quiero consultar sobre métodos de pago 🍒');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="payment-methods-page">
      <Header />
      <div className="payment-methods-container">
        <div className="page-header">
          <h1>Medios de Pago</h1>
          <p>Formas de pago disponibles</p>
        </div>

        <div className="payment-content">
          <div className="payment-section">
            <h2>💳 Transferencia Bancaria</h2>
            <div className="payment-details">
              <div className="detail-item">
                <span className="detail-label">Alias:</span>
                <span className="detail-value">{ALIAS}</span>
                <button 
                  className="copy-button"
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(ALIAS);
                      showToast('Alias copiado al portapapeles', { variant: 'success' });
                    } catch {
                      showToast('No se pudo copiar. Copiá el alias manualmente.', { variant: 'error' });
                    }
                  }}
                >
                  📋 Copiar
                </button>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{NOMBRE_TRANSFERENCIA}</span>
                <button 
                  className="copy-button"
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(NOMBRE_TRANSFERENCIA);
                      showToast('Nombre copiado al portapapeles', { variant: 'success' });
                    } catch {
                      showToast('No se pudo copiar. Copiá el nombre manualmente.', { variant: 'error' });
                    }
                  }}
                >
                  📋 Copiar
                </button>
              </div>
            </div>
            <p className="payment-note">
              Una vez realizada la transferencia, envía el comprobante por WhatsApp para confirmar tu pedido.
            </p>
          </div>

          <div className="payment-section">
            <h2>💵 Efectivo</h2>
            <p>
              También aceptamos pago en efectivo. Coordinamos el método de pago al momento de finalizar tu compra.
            </p>
          </div>

          <div className="payment-section">
            <h2>📱 Pago por WhatsApp</h2>
            <p>
              Puedes coordinar el pago directamente por WhatsApp. Te contactaremos después de realizar tu pedido.
            </p>
            <button onClick={handleWhatsApp} className="whatsapp-button">
              💬 Contactar por WhatsApp
            </button>
          </div>

          <div className="payment-info">
            <h3>ℹ️ Información Importante</h3>
            <ul>
              <li>El pago se coordina después de realizar el pedido</li>
              <li>Una vez confirmado el pago, procesaremos tu orden</li>
              <li>Para consultas sobre métodos de pago, contáctanos por WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PaymentMethods;


