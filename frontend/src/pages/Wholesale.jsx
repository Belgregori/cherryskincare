import Header from '../components/Header';
import Footer from '../components/Footer';
import './Wholesale.css';

const WHATSAPP_NUMBER = '5493515311969';

function Wholesale() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola! Me interesa información sobre ventas mayoristas 🍒');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="wholesale-page">
      <Header />
      <div className="wholesale-container">
        <div className="page-header">
          <h1>Web Mayorista</h1>
          <p>Ventas al por mayor</p>
        </div>

        <div className="content-section">
          <div className="coming-soon">
            <div className="coming-soon-icon">🏢</div>
            <h2>Sección en Desarrollo</h2>
            <p>
              Estamos trabajando en una plataforma especial para clientes mayoristas.
              Próximamente podrás acceder a precios especiales, descuentos por volumen y gestión de pedidos mayoristas.
            </p>
            <p className="coming-soon-note">
              Si estás interesado en compras mayoristas, contáctanos directamente por WhatsApp.
            </p>
            <button onClick={handleWhatsApp} className="contact-wholesale-btn">
              💬 Consultar por WhatsApp
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Wholesale;


