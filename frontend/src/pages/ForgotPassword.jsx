import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ForgotPassword.css';

function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { emailOrPhone });
      setSuccess('Si el email o teléfono está registrado, recibirás un correo con las instrucciones para recuperar tu contraseña');
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'No pudimos enviar el enlace de recuperación.', {
          byStatus: {
            404: 'No encontramos una cuenta con ese email.',
            429: 'Demasiados intentos. Esperá unos minutos antes de pedir otro enlace.',
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <Header />
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>Ingresa tu email o teléfono y te enviaremos las instrucciones para recuperarla</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

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

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
          </button>

          <div className="login-link">
            <p>¿Recordaste tu contraseña? <Link to="/login">Iniciar Sesión</Link></p>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPassword;
