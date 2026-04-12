import Header from '../components/Header';
import Footer from '../components/Footer';
import './Contact.css';

const WHATSAPP_NUMBER = '5493515311969';
const INSTAGRAM_URL = 'https://www.instagram.com/cherryskincare';
const MINIMO_ENVIO_GRATIS = 15000;

function Contact() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola! Me interesa conocer más sobre Cherry Skincare 🍒');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleInstagram = () => {
    window.open(INSTAGRAM_URL, '_blank');
  };

  return (
    <div className="contact-page">
      <Header />
      <div className="contact-container">
        <div className="page-header">
          <h1>Contacto</h1>
          <p>Estamos aquí para ayudarte</p>
        </div>

        <div className="contact-content">
          <div className="contact-section">
            <h2>📱 Contáctanos</h2>
            <p>
              Estamos disponibles para responder tus consultas, ayudarte con tus pedidos o cualquier duda que tengas.
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="method-icon">💬</div>
                <h3>WhatsApp</h3>
                <p>Escríbenos directamente por WhatsApp</p>
                <button onClick={handleWhatsApp} className="contact-button whatsapp-btn">
                  Abrir WhatsApp
                </button>
              </div>

              <div className="contact-method">
                <div className="method-icon">📷</div>
                <h3>Instagram</h3>
                <p>Síguenos en Instagram</p>
                <button onClick={handleInstagram} className="contact-button instagram-btn">
                  Ver Instagram
                </button>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <h2>📍 Ubicación</h2>
            <div className="location-info">
              <p><strong>Ciudad:</strong> Córdoba, Argentina</p>
              <p><strong>Zonas de entrega:</strong></p>
              <ul>
                <li>Dentro del anillo de circunvalación (envío gratis en compras mayores a {MINIMO_ENVIO_GRATIS.toLocaleString('es-AR')})</li>
                <li>Barrio General Paz (retiro personal)</li>
                <li>Centro de Córdoba (retiro personal)</li>
                <li>Punto de encuentro los sábados</li>
              </ul>
            </div>
          </div>

          <div className="contact-section">
            <h2>⏰ Horarios de Atención</h2>
            <div className="hours-info">
              <p>Atendemos consultas por WhatsApp durante los siguientes horarios:</p>
              <div className="hours-list">
                <div className="hour-item">
                  <span className="day">Lunes a Viernes:</span>
                  <span className="time">9:00 - 20:00</span>
                </div>
                <div className="hour-item">
                  <span className="day">Sábados:</span>
                  <span className="time">10:00 - 18:00</span>
                </div>
                <div className="hour-item">
                  <span className="day">Domingos:</span>
                  <span className="time">Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Contact;

