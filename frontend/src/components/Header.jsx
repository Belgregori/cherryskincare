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
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      setIsMenuOpen(false);
      navigate('/');
    }
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
        <nav 
          className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}
          aria-label="Navegación principal"
          aria-hidden={!isMenuOpen}
          aria-expanded={isMenuOpen}
        >
          <ul className="menu-list" role="menubar">
            <li role="none">
              <Link to="/" onClick={() => setIsMenuOpen(false)} role="menuitem">
                Inicio
              </Link>
            </li>
            <li role="none">
              <Link to="/products" onClick={() => setIsMenuOpen(false)} role="menuitem">
                Productos
              </Link>
            </li>
            <li role="none">
              <Link to="/categories" onClick={() => setIsMenuOpen(false)} role="menuitem">
                Categorías
              </Link>
            </li>
            {!isAuthenticated && (
              <li>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Inicia Sesión
                </Link>
              </li>
            )}
            <li>
              <Link to="/about-us" onClick={() => setIsMenuOpen(false)}>
                Quiero una página como esta!
              </Link>
            </li>
            <li>
              <Link to="/payment-methods" onClick={() => setIsMenuOpen(false)}>
                Medios de Pago
              </Link>
            </li>
            <li>
              <Link to="/shipping" onClick={() => setIsMenuOpen(false)}>
                Envíos
              </Link>
            </li>
            <li className="menu-divider"></li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    👤 Mi Perfil
                  </Link>
                </li>
                <li className="user-info">
                  <span className="user-name">{user?.name || user?.email}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-link">
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  Registrarse
                </Link>
              </li>
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

