import { useState, Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

// Lazy load de componentes admin para reducir el bundle inicial
const AddProduct = lazy(() => import('../components/admin/AddProduct'));
const ProductList = lazy(() => import('../components/admin/ProductList'));
const EditProduct = lazy(() => import('../components/admin/EditProduct'));
const OrderList = lazy(() => import('../components/admin/OrderList'));
const UserList = lazy(() => import('../components/admin/UserList'));

// Secciones válidas del admin
const VALID_SECTIONS = [
  'add-product',
  'products',
  'edit-product',
  'orders',
  'users'
];

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const previousSectionRef = useRef(null);
  const isInitialMountRef = useRef(true);

  // Inicializar sección desde URL o establecer por defecto después del primer render
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      
      // Leer sección de query params
      const sectionFromUrl = searchParams.get('section');
      
      // Validar que la sección de la URL sea válida
      if (sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl)) {
        setActiveSection(sectionFromUrl);
        previousSectionRef.current = sectionFromUrl;
      } else {
        // Si no hay sección válida en la URL, establecer 'products' por defecto
        const defaultSection = 'products';
        setActiveSection(defaultSection);
        previousSectionRef.current = defaultSection;
        setSearchParams({ section: defaultSection }, { replace: true });
      }
      
      setIsInitialized(true);
    }
  }, [searchParams, setSearchParams]);

  // Sincronizar cambios de activeSection con la URL
  useEffect(() => {
    if (isInitialized && activeSection !== null) {
      const currentSectionInUrl = searchParams.get('section');
      
      if (currentSectionInUrl !== activeSection) {
        setSearchParams({ section: activeSection }, { replace: true });
      }
    }
  }, [activeSection, isInitialized, searchParams, setSearchParams]);

  // Limpiar estado de productos cuando se sale de esa sección
  useEffect(() => {
    if (!isInitialized || activeSection === null) return;
    
    const prevSection = previousSectionRef.current;
    
    if (prevSection === 'products' || prevSection === 'add-product' || prevSection === 'edit-product') {
      if (activeSection !== 'products' && activeSection !== 'add-product' && activeSection !== 'edit-product') {
        setProductsRefreshKey(0);
        setEditingProductId(null);
      }
    }
    
    previousSectionRef.current = activeSection;
  }, [activeSection, isInitialized]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const setActiveSectionSafe = useCallback((section) => {
    if (VALID_SECTIONS.includes(section)) {
      setActiveSection(section);
    }
  }, []);

  const handleEditProduct = useCallback((product) => {
    setEditingProductId(product.id);
    setActiveSectionSafe('edit-product');
  }, [setActiveSectionSafe]);

  const handleCancelEdit = useCallback(() => {
    setEditingProductId(null);
    setActiveSectionSafe('products');
  }, [setActiveSectionSafe]);

  const handleEditSuccess = useCallback(() => {
    setEditingProductId(null);
    setActiveSectionSafe('products');
    setProductsRefreshKey(prev => prev + 1);
  }, [setActiveSectionSafe]);

  const renderContent = () => {
    if (!isInitialized || activeSection === null) {
      return (
        <div className="admin-welcome">
          <LoadingSpinner message="Cargando panel de administración..." />
        </div>
      );
    }

    switch (activeSection) {
      case 'add-product':
        return (
          <AddProduct onSuccess={() => {
            setActiveSectionSafe('products');
            setProductsRefreshKey(prev => prev + 1);
          }} />
        );

      case 'products':
        return (
          <ProductList 
            onEditProduct={handleEditProduct}
            refreshKey={productsRefreshKey}
          />
        );

      case 'edit-product':
        if (editingProductId !== null) {
          return (
            <EditProduct 
              productId={editingProductId}
              onCancel={handleCancelEdit}
              onSuccess={handleEditSuccess}
            />
          );
        }
        return null;

      case 'orders':
        return <OrderList />;

      case 'users':
        return <UserList />;

      default:
        return (
          <div className="admin-welcome">
            <h2>Bienvenido al Panel de Administración</h2>
            <p>Selecciona una sección del menú lateral para comenzar.</p>
          </div>
        );
    }
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
              setActiveSectionSafe('add-product');
              setEditingProductId(null);
            }}
          >
            ➕ Agregar Producto
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveSectionSafe('products');
              setEditingProductId(null);
            }}
          >
            📦 Productos
          </button>
          <button
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSectionSafe('orders')}
          >
            📋 Órdenes
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSectionSafe('users')}
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
            {renderContent()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
