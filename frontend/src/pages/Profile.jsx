import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { getApiErrorMessage } from '../utils/apiError';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Profile.css';

function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    telefone: ''
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoadError, setUserLoadError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [profileFeedback, setProfileFeedback] = useState({ type: '', text: '' });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const goTab = (tab) => {
    setActiveTab(tab);
    setOrdersError('');
    setProfileFeedback({ type: '', text: '' });
    setPasswordFeedback({ type: '', text: '' });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserData();
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUserData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        telefone: currentUser.telefone || ''
      });
      setUserLoadError('');
    } catch (err) {
      setUserLoadError(
        getApiErrorMessage(err, 'No pudimos cargar tu perfil.', {
          byStatus: { 401: 'Tu sesión expiró. Volvé a iniciar sesión.', 503: 'Servicio no disponible temporalmente.' },
        })
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
      setOrdersError('');
    } catch (err) {
      setOrdersError(
        getApiErrorMessage(err, 'No pudimos cargar tus pedidos.', {
          byStatus: { 503: 'Servicio no disponible temporalmente.' },
        })
      );
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileFeedback({ type: '', text: '' });
    setLoadingUpdate(true);

    try {
      const updatedUser = await authService.updateUser(user.id, userData);
      setProfileFeedback({ type: 'success', text: 'Perfil actualizado correctamente.' });
      
      // Actualizar el usuario en el contexto de autenticación
      const updatedUserData = {
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        telefone: updatedUser.telefone
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (err) {
      setProfileFeedback({
        type: 'error',
        text: getApiErrorMessage(err, 'No pudimos guardar los cambios del perfil.', {
          byStatus: { 400: 'Revisá los datos; algún campo no es válido.', 409: 'El email o teléfono ya está en uso.' },
        }),
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoadingPassword(true);

    try {
      await authService.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordFeedback({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        text: getApiErrorMessage(err, 'No pudimos cambiar la contraseña.', {
          byStatus: { 400: 'La contraseña actual no es correcta o la nueva no cumple las reglas.' },
        }),
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'SIN_CONFIRMAR':
        return 'Sin Confirmar';
      case 'PAGADO':
        return 'Pagado';
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return status || '-';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'SIN_CONFIRMAR':
        return 'status-pending';
      case 'PAGADO':
        return 'status-paid';
      case 'ENTREGADO':
        return 'status-delivered';
      default:
        return 'status-unknown';
    }
  };

  if (loading && !userData.name) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="loading">Cargando perfil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y pedidos</p>
        </div>

        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => goTab('profile')}
          >
            👤 Información Personal
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => goTab('orders')}
          >
            📦 Mis Pedidos
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => goTab('password')}
          >
            🔒 Cambiar Contraseña
          </button>
        </div>

        {userLoadError ? (
          <div className="error-message profile-load-error" role="alert">
            <p>{userLoadError}</p>
            <button
              type="button"
              className="shop-button"
              onClick={() => {
                setUserLoadError('');
                loadUserData();
              }}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Información Personal</h2>
              {profileFeedback.text ? (
                <div
                  className={profileFeedback.type === 'success' ? 'success-message' : 'error-message'}
                  role={profileFeedback.type === 'success' ? 'status' : 'alert'}
                >
                  {profileFeedback.text}
                </div>
              ) : null}
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userData.name}
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
                    value={userData.email}
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
                    value={userData.telefone}
                    onChange={handleInputChange}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div className="form-note">
                  <p>* Debes ingresar al menos un email o teléfono</p>
                </div>

                <button type="submit" className="submit-button" disabled={loadingUpdate}>
                  {loadingUpdate ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Mis Pedidos</h2>
              {ordersError ? <div className="error-message" role="alert">{ordersError}</div> : null}
              {loadingOrders ? (
                <div className="loading">Cargando pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <p>No tienes pedidos aún</p>
                  <button onClick={() => navigate('/')} className="shop-button">
                    Ir a Comprar
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3>Pedido #{order.id}</h3>
                          <span className={`order-status ${getStatusClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="order-meta">
                          <p className="order-date">{formatDate(order.createdAt)}</p>
                          <p className="order-total">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                      <div className="order-items">
                        <p className="items-count">
                          {order.orderItems?.length || 0} producto(s)
                        </p>
                        <button
                          className="view-order-button"
                          onClick={() => navigate(`/order-confirmation/${order.id}`)}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="password-section">
              <h2>Cambiar Contraseña</h2>
              {passwordFeedback.text ? (
                <div
                  className={passwordFeedback.type === 'success' ? 'success-message' : 'error-message'}
                  role={passwordFeedback.type === 'success' ? 'status' : 'alert'}
                >
                  {passwordFeedback.text}
                </div>
              ) : null}
              <form onSubmit={handleChangePassword} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Contraseña Actual *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nueva Contraseña *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
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
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loadingPassword}>
                  {loadingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;

