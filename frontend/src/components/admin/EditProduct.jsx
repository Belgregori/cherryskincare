import { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import './AddProduct.css';

function EditProduct({ productId, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    isActive: true
  });
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const response = await api.get(`/admin/products/${productId}`);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stockQuantity: product.stockQuantity || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
      
      if (product.imageUrl) {
        setCurrentImageUrl(product.imageUrl);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar el producto' });
      console.error(err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen' });
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'La imagen no debe superar los 5MB' });
        return;
      }

      setNewImage(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewImage(null);
    setPreview(null);
    setCurrentImageUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      // Determinar qué imagen usar:
      // - Si hay nueva imagen, la subiremos después y la URL se actualizará
      // - Si se eliminó la imagen (currentImageUrl es null), enviamos null
      // - Si no hay cambios en la imagen, mantenemos la URL actual
      let finalImageUrl = currentImageUrl;
      if (!currentImageUrl && !newImage) {
        // Si se eliminó la imagen, enviamos null
        finalImageUrl = null;
      }

      // Actualizar los datos del producto
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        isActive: formData.isActive,
        imageUrl: finalImageUrl
      };

      // Si hay una nueva imagen, subirla primero
      if (newImage) {
        const formDataImage = new FormData();
        formDataImage.append('file', newImage);

        const imageResponse = await api.post(`/admin/products/${productId}/image`, formDataImage, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        // Actualizar la URL de la imagen en productData
        productData.imageUrl = imageResponse.data.imageUrl;
      }

      // Actualizar el producto con todos los datos (incluyendo la nueva imagen si se subió)
      await api.put(`/admin/products/${productId}`, productData);

      setMessage({ type: 'success', text: 'Producto actualizado exitosamente!' });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'Error al actualizar el producto')
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return <div className="loading">Cargando producto...</div>;
  }

  return (
    <div className="add-product-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Editar Producto</h2>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="cancel-button"
            type="button"
          >
            ← Volver a la lista
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre del Producto *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Ej: Crema Hidratante"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría *</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              placeholder="Ej: Cremas, Serums, Limpieza"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            placeholder="Describe el producto..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Precio *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stockQuantity">Stock</label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
            Producto activo (visible para clientes)
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="image">Imagen del Producto</label>
          
          {/* Mostrar imagen actual si existe */}
          {currentImageUrl && !preview && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Imagen actual:</p>
              <div className="image-preview">
                <img 
                  src={`${IMAGE_BASE_URL}${currentImageUrl}`} 
                  alt="Imagen actual"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image-button"
              >
                🗑️ Eliminar imagen actual
              </button>
            </div>
          )}

          {/* Mostrar preview de nueva imagen si existe */}
          {preview && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Nueva imagen:</p>
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            </div>
          )}

          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
            {currentImageUrl && !newImage ? 'Selecciona una nueva imagen para reemplazar la actual' : 'Selecciona una imagen para el producto'}
          </small>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProduct;

