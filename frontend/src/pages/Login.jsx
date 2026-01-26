import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Login.css';

function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // El backend acepta email o podemos buscar por teléfono
      const response = await login(emailOrPhone, password);
      
      // Verificar el role (puede venir como 'ADMIN' o 'admin')
      const userRole = response.role?.toUpperCase();
      
      // Si es admin, redirigir al panel de administrador
      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        // Si es usuario normal, redirigir a home
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="emailOrPhone">Email o Teléfono</label>
            <input
              type="text"
              id="emailOrPhone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
              placeholder="tu@email.com o tu teléfono"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="register-link">
            <p>¿No tenés usuario? <Link to="/register">Registrate</Link></p>
            <p><Link to="/forgot-password">¿Olvidaste tu contraseña?</Link></p>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Login;

