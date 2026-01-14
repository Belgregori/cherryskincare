import './Footer.css';

function Footer() {
  const whatsappNumber = '5493515311969'; // Formato: código país (54) + 9 + número sin 0 inicial
  const instagramUrl = 'https://www.instagram.com/cherryskincare';

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola! Me interesa conocer más sobre Cherry Skincare 🍒');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleInstagram = () => {
    window.open(instagramUrl, '_blank');
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Instagram a la izquierda */}
        <div className="footer-left">
          <button 
            className="social-button instagram-button"
            onClick={handleInstagram}
            aria-label="Síguenos en Instagram"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </button>
        </div>

        {/* Nombre del emprendimiento en el centro */}
        <div className="footer-center">
          <h2 className="footer-brand">Cherry Skincare</h2>
        </div>

        {/* WhatsApp a la derecha */}
        <div className="footer-right">
          <button 
            className="social-button whatsapp-button"
            onClick={handleWhatsApp}
            aria-label="Contáctanos por WhatsApp"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

