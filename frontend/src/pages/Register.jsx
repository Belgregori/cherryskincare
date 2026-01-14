import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.email && !formData.telefone) {
      setError('Debes ingresar un email o teléfono');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email || null, // Puede ser null si solo hay teléfono
        telefone: formData.telefone || null, // Puede ser null si solo hay email
        password: formData.password
      };

      await authService.register(registrationData);
      
      // Después del registro, hacer login automático
      // Usar email si existe, sino usar teléfono
      const loginIdentifier = formData.email || formData.telefone;
      await authService.login(loginIdentifier, formData.password);
      
      // Redirigir a home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Registrate para comenzar</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Nombre Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Teléfono</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div className="form-note">
            <p>* Debes ingresar al menos un email o teléfono</p>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Repite tu contraseña"
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="login-link">
            <p>¿Ya tenés cuenta? <Link to="/login">Iniciar Sesión</Link></p>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Register;

