import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandling, cleanupGlobalErrorHandling } from './utils/globalErrorHandler';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Background from './components/Background';
import { prefetchCommonRoutes, prefetchRelatedRoutes } from './utils/routePrefetch';
import './App.css';
import './styles/accessibility.css';

// Páginas críticas - carga inmediata (Home y Login)
import Home from './pages/Home';
import Login from './pages/Login';

// Páginas con lazy loading - carga diferida
const Register = lazy(() => import('./pages/Register'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const HowToUse = lazy(() => import('./pages/HowToUse'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Contact = lazy(() => import('./pages/Contact'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Componente interno para manejar prefetching basado en la ruta
function RoutePrefetcher() {
  const location = useLocation();

  useEffect(() => {
    // Prefetch rutas relacionadas cuando cambia la ruta
    prefetchRelatedRoutes(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  // Configurar manejo global de errores al montar la app
  useEffect(() => {
    setupGlobalErrorHandling();
    
    // Prefetch rutas comunes después de que la app haya cargado
    prefetchCommonRoutes();
    
    // Limpiar al desmontar
    return () => {
      cleanupGlobalErrorHandling();
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ErrorBoundary>
            <RoutePrefetcher />
            <Background />
            <div className="App">
              <Suspense fallback={<LoadingSpinner message="Cargando página..." />}>
                <Routes>
                  {/* Páginas críticas - carga inmediata */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Páginas públicas con lazy loading */}
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/how-to-use" element={<HowToUse />} />
                  <Route path="/payment-methods" element={<PaymentMethods />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/wholesale" element={<Wholesale />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  
                  {/* Páginas protegidas con lazy loading */}
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Páginas de administración con lazy loading */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </div>
          </ErrorBoundary>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

