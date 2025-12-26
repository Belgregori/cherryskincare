import { useState } from 'react';
import { Link } from 'react-router-dom';
import CherryLogo from './CherryLogo';
import ShoppingCart from './ShoppingCart';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Menú desplegable a la izquierda */}
        <button 
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Menú desplegable */}
        <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul className="menu-list">
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                Productos
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contacto
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logo de cereza en el centro */}
        <Link to="/" className="logo-container">
          <CherryLogo />
        </Link>

        {/* Carrito de compras a la derecha */}
        <div className="cart-container">
          <ShoppingCart />
        </div>
      </div>
    </header>
  );
}

export default Header;

