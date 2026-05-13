import { useState, useEffect, useRef } from 'react';
import api, { IMAGE_BASE_URL } from '../../services/api';
import { capitalizeFirst } from '../../utils/formatUtils';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import './ProductList.css';

function ProductList({ onEditProduct, refreshKey }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancelar cualquier petición pendiente anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para esta petición
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/products', {
          signal: abortController.signal
        });
        
        // Verificar si fue cancelado antes de actualizar estado
        if (!cancelled && !abortController.signal.aborted) {
          setProducts(response.data);
          setError(null);
        }
      } catch (err) {
        // Ignorar errores de cancelación
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }
        
        if (!cancelled && !abortController.signal.aborted) {
          setError(
            getApiErrorMessage(err, 'No pudimos cargar el listado de productos.', {
              byStatus: {
                403: 'No tenés permiso para ver el catálogo de administración.',
                503: 'El listado no está disponible temporalmente.',
              },
            })
          );
          console.error(err);
        }
      } finally {
        if (!cancelled && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    // Cleanup: cancelar petición y marcar como cancelado
    return () => {
      cancelled = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [refreshKey]);

  // Limpiar estado al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setProducts([]);
      setLoading(false);
      setError(null);
    };
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${capitalizeFirst(name)}"?`)) {
      return;
    }

    const abortController = new AbortController();
    try {
      await api.delete(`/admin/products/${id}`, {
        signal: abortController.signal
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      showToast(
        getApiErrorMessage(err, 'No pudimos eliminar el producto.', {
          byStatus: {
            404: 'Ese producto ya no existe.',
            409: 'No se puede eliminar porque está asociado a pedidos u otros datos.',
          },
        }),
        { variant: 'error' }
      );
      console.error(err);
    }
  };

  const toggleActiveStatus = async (product) => {
    const abortController = new AbortController();
    try {
      const updatedProduct = {
        ...product,
        isActive: !product.isActive
      };
      await api.put(`/admin/products/${product.id}`, updatedProduct, {
        signal: abortController.signal
      });
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      showToast(
        getApiErrorMessage(err, 'No pudimos actualizar el estado del producto.', {
          byStatus: { 404: 'El producto ya no existe.', 409: 'Conflicto al guardar el estado.' },
        }),
        { variant: 'error' }
      );
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>Gestión de Productos</h2>
        <p className="product-count">Total: {products.length} productos</p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No hay productos registrados</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.imageUrl ? (
                      <img 
                        src={`${IMAGE_BASE_URL}${product.imageUrl}`} 
                        alt={capitalizeFirst(product.name)}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=Sin+Imagen';
                        }}
                      />
                    ) : (
                      <div className="no-image">Sin imagen</div>
                    )}
                  </td>
                  <td>
                    <div className="product-name">{capitalizeFirst(product.name)}</div>
                    {product.description && (
                      <div className="product-description">
                        {product.description.length > 50 
                          ? `${product.description.substring(0, 50)}...`
                          : product.description}
                      </div>
                    )}
                  </td>
                  <td>{product.category || '-'}</td>
                  <td className="price">${product.price?.toFixed(2) || '0.00'}</td>
                  <td>{product.stockQuantity || 0}</td>
                  <td>
                    <button
                      className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleActiveStatus(product)}
                      title={product.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {product.isActive ? '✓ Activo' : '✗ Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => onEditProduct(product)}
                        title="Editar"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Eliminar"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductList;
