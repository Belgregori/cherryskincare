import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CherryLogo from './CherryLogo';
import ShoppingCart from './ShoppingCart';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
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
            <li className="menu-divider"></li>
            {isAuthenticated ? (
              <>
                <li className="user-info">
                  <span className="user-name">👤 {user?.name || user?.email}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-link">
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    Registrarse
                  </Link>
                </li>
              </>
            )}
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

