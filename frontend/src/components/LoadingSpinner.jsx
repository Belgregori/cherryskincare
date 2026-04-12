import './LoadingSpinner.css';

/**
 * Componente de loading para usar con Suspense en lazy loading
 */
export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="loading-spinner-container" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
