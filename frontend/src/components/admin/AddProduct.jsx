import { useState, useEffect, useMemo } from 'react';
import api, { IMAGE_BASE_URL } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
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
  
  // Estados para gestión de categorías
  const [showCategorySection, setShowCategorySection] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    displayOrder: 0
  });
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryPreview, setCategoryPreview] = useState(null);
  const [categoryCurrentImageUrl, setCategoryCurrentImageUrl] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Cargar categorías al montar - EXACTAMENTE como OrderList
  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-ocultar mensajes después de 4 segundos
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/admin/categories');
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategories([]);
      setMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'No pudimos cargar las categorías para el formulario.', {
          byStatus: { 403: 'No tenés permiso para cargar categorías.', 503: 'Servicio no disponible temporalmente.' },
        }),
      });
    } finally {
      setLoadingCategories(false);
    }
  };

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
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'La imagen no debe superar los 5MB' });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /** Primera letra mayúscula, resto minúsculas (ej. Skincare) */
  const formatCategoryName = (name) => {
    const t = (name || '').trim();
    if (!t) return '';
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  };

  // Handlers para categorías
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen' });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'La imagen no debe superar los 2MB' });
        return;
      }

      setCategoryImage(file);
      setCategoryCurrentImageUrl(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryFormData({
      name: category.name || '',
      displayOrder: category.displayOrder ?? 0
    });
    setCategoryCurrentImageUrl(category.imageUrl || null);
    setCategoryPreview(null);
    setCategoryImage(null);
    setShowCategorySection(true);
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryFormData({ name: '', displayOrder: 0 });
    setCategoryImage(null);
    setCategoryPreview(null);
    setCategoryCurrentImageUrl(null);
  };

  const handleSaveCategory = async () => {
    const trimmedName = categoryFormData.name?.trim();
    if (!trimmedName) {
      setMessage({ type: 'error', text: 'El nombre de la categoría es obligatorio' });
      return;
    }

    const normalizedName = formatCategoryName(trimmedName);

    setSavingCategory(true);
    setMessage({ type: '', text: '' });

    try {
      let savedCategory;

      if (editingCategoryId) {
        const categoryData = {
          name: normalizedName,
          displayOrder: categoryFormData.displayOrder || 0,
          imageUrl: categoryCurrentImageUrl
        };

        await api.put(`/admin/categories/${editingCategoryId}`, categoryData);
        savedCategory = { id: editingCategoryId, ...categoryData };

        if (categoryImage) {
          const formDataImage = new FormData();
          formDataImage.append('file', categoryImage);

          const imageResponse = await api.post(`/admin/categories/${editingCategoryId}/image`, formDataImage, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          savedCategory.imageUrl = imageResponse.data?.imageUrl || imageResponse.data;
        }
      } else {
        const categoryData = {
          name: normalizedName,
          displayOrder: categoryFormData.displayOrder || 0
        };

        const createResponse = await api.post('/admin/categories', categoryData);
        savedCategory = createResponse.data;

        if (categoryImage) {
          const formDataImage = new FormData();
          formDataImage.append('file', categoryImage);

          const imageResponse = await api.post(`/admin/categories/${savedCategory.id}/image`, formDataImage, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          savedCategory.imageUrl = imageResponse.data?.imageUrl || imageResponse.data;
        }
      }

      setMessage({ type: 'success', text: editingCategoryId ? 'Categoría actualizada exitosamente!' : 'Categoría creada exitosamente!' });
      
      await loadCategories();
      
      setFormData(prev => ({ ...prev, category: savedCategory.name }));
      
      handleCancelCategoryEdit();
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(
          error,
          editingCategoryId ? 'No pudimos actualizar la categoría.' : 'No pudimos crear la categoría.',
          { byStatus: { 409: 'Ya existe una categoría con ese nombre.', 400: 'Los datos de la categoría no son válidos.' } }
        ),
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/categories/${id}`);
      setMessage({ type: 'success', text: 'Categoría eliminada exitosamente!' });
      await loadCategories();
      
      if (formData.category === name) {
        setFormData(prev => ({ ...prev, category: '' }));
      }
    } catch (error) {
      const msg = getApiErrorMessage(
        error,
        'No pudimos eliminar la categoría.',
        {
          byStatus: {
            409: error.response?.data?.error || 'No se puede eliminar: tiene productos asociados.',
            404: 'Esa categoría ya no existe.',
          },
        }
      );
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
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

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No pudimos registrar el producto.', {
          byStatus: { 400: 'Revisá nombre, precio, categoría y stock.', 409: 'Ya existe un producto similar o conflicto de datos.' },
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryDisplayImage = useMemo(() => {
    if (categoryPreview) return categoryPreview;
    if (categoryCurrentImageUrl) return `${IMAGE_BASE_URL}${categoryCurrentImageUrl}`;
    return null;
  }, [categoryPreview, categoryCurrentImageUrl]);

  return (
    <div className="add-product-container">
      <h2>Agregar Nuevo Producto</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Sección de Gestión de Categorías */}
      <div className="category-management-section">
        <button
          type="button"
          className="category-section-toggle"
          onClick={() => setShowCategorySection(!showCategorySection)}
        >
          {showCategorySection ? '▼' : '▶'} Agregar Categoría
        </button>

        {showCategorySection && (
          <div className="category-section-content">
            <h3>{editingCategoryId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            
            <div className="category-form-row">
              <div className="form-group">
                <label htmlFor="category-name">Nombre de la Categoría *</label>
                <input
                  type="text"
                  id="category-name"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  required
                  placeholder="Ej: SKINCARE"
                  maxLength={100}
                />
                <small>Se guardará en mayúsculas</small>
              </div>

              <div className="form-group">
                <label htmlFor="category-order">Orden de Visualización</label>
                <input
                  type="number"
                  id="category-order"
                  name="displayOrder"
                  value={categoryFormData.displayOrder}
                  onChange={handleCategoryInputChange}
                  min="0"
                  placeholder="0"
                />
                <small>Número menor = aparece primero</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category-image">Imagen de la Categoría</label>
              <input
                type="file"
                id="category-image"
                accept="image/*"
                onChange={handleCategoryImageChange}
              />
              {categoryDisplayImage && (
                <div className="image-preview" style={{ marginTop: '1rem' }}>
                  <img src={categoryDisplayImage} alt="Preview categoría" />
                </div>
              )}
              <small>Opcional. Máx. 2MB</small>
            </div>

            <div className="category-form-actions">
              <button
                type="button"
                className="submit-button"
                onClick={handleSaveCategory}
                disabled={savingCategory}
                style={{ marginTop: '0' }}
              >
                {savingCategory ? 'Guardando...' : (editingCategoryId ? 'Guardar Cambios' : 'Crear Categoría')}
              </button>
              {editingCategoryId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelCategoryEdit}
                  disabled={savingCategory}
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            {/* Lista de categorías existentes - RENDERIZADO CONDICIONAL IGUAL A PRODUCTLIST */}
            {categories.length > 0 && (
              <div className="existing-categories">
                <h4>Categorías Existentes</h4>
                <div className="categories-grid">
                  {categories.map((cat) => (
                    <div key={cat.id || cat.name} className="category-card">
                      <div className="category-card-image">
                        {cat.imageUrl ? (
                          <img 
                            src={`${IMAGE_BASE_URL}${cat.imageUrl}`}
                            alt={cat.name}
                            className="category-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                const existingNoImage = parent.querySelector('.no-image');
                                if (!existingNoImage) {
                                  const noImageDiv = document.createElement('div');
                                  noImageDiv.className = 'no-image';
                                  noImageDiv.textContent = 'Sin imagen';
                                  parent.appendChild(noImageDiv);
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="no-image">Sin imagen</div>
                        )}
                      </div>
                      <div className="category-card-info">
                        <strong>{cat.name}</strong>
                      </div>
                      <div className="category-card-actions">
                        <button
                          type="button"
                          className="edit-category-btn"
                          onClick={() => handleEditCategory(cat)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="delete-category-btn"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                  <option key={category.id || category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            {categories.length > 0 && (
              <small className="category-info">
                Categorías disponibles: {categories.map(c => c.name).join(', ')}
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
