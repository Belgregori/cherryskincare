import React from 'react';
import { useNavigate } from 'react-router-dom';
import { errorLoggingService } from '../services/errorLoggingService';
import './ErrorBoundary.css';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, errorId: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente render muestre la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generar ID único para este error
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Enviar error al servicio de logging
    errorLoggingService.logError(error, errorInfo, {
      level: 'error',
      tags: {
        errorBoundary: true,
        errorId: errorId,
        component: errorInfo?.componentStack?.split('\n')[0] || 'Unknown',
      },
      extra: {
        errorBoundaryProps: this.props,
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // UI personalizada de error
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onReset={this.handleReset}
          onGoHome={() => {
            this.handleReset();
            if (this.props.navigate) {
              this.props.navigate('/');
            }
          }}
        />
      );
    }

    return this.props.children;
  }
}

// Componente funcional para el fallback UI
function ErrorFallback({ error, errorInfo, errorId, onReset, onGoHome }) {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <div className="error-boundary-icon">⚠️</div>
        <h1 className="error-boundary-title">¡Oops! Algo salió mal</h1>
        <p className="error-boundary-message">
          Lo sentimos, ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>
        
        {errorId && (
          <p className="error-boundary-id">
            ID del error: <code>{errorId}</code>
          </p>
        )}
        
        {isDevelopment && error && (
          <details className="error-boundary-details">
            <summary>Detalles del error (solo en desarrollo)</summary>
            <pre className="error-boundary-stack">
              {error.toString()}
              {errorInfo && errorInfo.componentStack}
            </pre>
          </details>
        )}

        <div className="error-boundary-actions">
          <button onClick={onReset} className="error-boundary-button primary">
            Intentar de nuevo
          </button>
          <button onClick={onGoHome} className="error-boundary-button secondary">
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

// Wrapper funcional con hook de navegación
export default function ErrorBoundary({ children, onReset }) {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundaryClass navigate={navigate} onReset={onReset}>
      {children}
    </ErrorBoundaryClass>
  );
}
