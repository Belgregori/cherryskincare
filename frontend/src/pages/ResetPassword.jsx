import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ResetPassword.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token de recuperación no válido');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess('Contraseña actualizada exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'No pudimos actualizar tu contraseña.', {
          byStatus: {
            400: 'El enlace de recuperación no es válido o expiró. Solicitá uno nuevo.',
            404: 'El enlace de recuperación ya no es válido.',
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <Header />
      <div className="reset-password-container">
        <div className="reset-password-header">
          <h1>Restablecer Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña *</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading || !token}>
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
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

export default ResetPassword;
