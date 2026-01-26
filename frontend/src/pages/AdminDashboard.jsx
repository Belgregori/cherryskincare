import { useState, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

// Lazy load de componentes admin para reducir el bundle inicial
const AddProduct = lazy(() => import('../components/admin/AddProduct'));
const ProductList = lazy(() => import('../components/admin/ProductList'));
const EditProduct = lazy(() => import('../components/admin/EditProduct'));
const OrderList = lazy(() => import('../components/admin/OrderList'));
const UserList = lazy(() => import('../components/admin/UserList'));

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('products');
  const [editingProductId, setEditingProductId] = useState(null);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setActiveSection('edit-product');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setActiveSection('products');
  };

  const handleEditSuccess = () => {
    setEditingProductId(null);
    setActiveSection('products');
    setProductsRefreshKey(prev => prev + 1); // Forzar recarga de la lista
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
            onClick={() => {
              setActiveSection('add-product');
              setEditingProductId(null);
            }}
          >
            ➕ Agregar Producto
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('products');
              setEditingProductId(null);
            }}
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
          <Suspense fallback={<LoadingSpinner message="Cargando sección..." />}>
            {activeSection === 'add-product' && (
              <AddProduct onSuccess={() => {
                setActiveSection('products');
                setProductsRefreshKey(prev => prev + 1); // Forzar recarga de la lista
              }} />
            )}
            {activeSection === 'products' && (
              <ProductList 
                onEditProduct={handleEditProduct}
                refreshKey={productsRefreshKey}
              />
            )}
            {activeSection === 'edit-product' && editingProductId && (
              <EditProduct 
                productId={editingProductId}
                onCancel={handleCancelEdit}
                onSuccess={handleEditSuccess}
              />
            )}
            {activeSection === 'orders' && <OrderList />}
            {activeSection === 'users' && <UserList />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

