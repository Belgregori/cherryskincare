import { useLocation } from 'react-router-dom';
import './Background.css';

function Background() {
  const location = useLocation();
  
  // No mostrar el fondo solo en el dashboard de admin, pero sí en admin/login
  const isAdminDashboard = location.pathname === '/admin/dashboard';
  
  if (isAdminDashboard) {
    return null;
  }
  
  // Usar la ruta como key para que se re-renderice solo cuando cambia la ruta
  // No depende del estado de autenticación para evitar re-renders innecesarios
  return (
    <div className="cherry-background" key={location.pathname} />
  );
}

export default Background;
