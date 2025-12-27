import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddProduct from '../components/admin/AddProduct';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('add-product');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Panel Admin</h2>
          <p className="admin-email">{user?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'add-product' ? 'active' : ''}`}
            onClick={() => setActiveSection('add-product')}
          >
            ➕ Agregar Producto
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSection('products')}
          >
            📦 Productos
          </button>
          <button
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            📋 Órdenes
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            👥 Usuarios
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          {activeSection === 'add-product' && <AddProduct />}
          {activeSection === 'products' && <div>Gestión de Productos (próximamente)</div>}
          {activeSection === 'orders' && <div>Gestión de Órdenes (próximamente)</div>}
          {activeSection === 'users' && <div>Gestión de Usuarios (próximamente)</div>}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

