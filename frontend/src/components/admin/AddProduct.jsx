import { useState, useEffect } from 'react';
import api from '../../services/api';
import { productService } from '../../services/productService';
import './AddProduct.css';

function AddProduct({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setMessage({ 
          type: 'error', 
          text: 'Error al cargar las categorías. Por favor, recarga la página.' 
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      setFormData(prev => ({ ...prev, image: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      // Primero crear el producto
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        isActive: true
      };

      const productResponse = await api.post('/admin/products', productData);
      const productId = productResponse.data.id;

      // Si hay imagen, subirla
      if (formData.image) {
        const formDataImage = new FormData();
        formDataImage.append('file', formData.image);

        await api.post(`/admin/products/${productId}/image`, formDataImage, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setMessage({ type: 'success', text: 'Producto agregado exitosamente!' });
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        image: null
      });
      setPreview(null);
      e.target.reset();

      // Si hay callback onSuccess, llamarlo después de un breve delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error al agregar el producto'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Agregar Nuevo Producto</h2>

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
            {loadingCategories ? (
              <select
                id="category"
                name="category"
                disabled
                className="form-select"
              >
                <option value="">Cargando categorías...</option>
              </select>
            ) : (
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
            {categories.length > 0 && (
              <small className="category-info">
                Categorías disponibles: {categories.join(', ')}
              </small>
            )}
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
            <label htmlFor="stockQuantity">Stock Inicial</label>
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
          <label htmlFor="image">Imagen del Producto</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;

