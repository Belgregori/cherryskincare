import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Categories.css';

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      setLoadError(null);
      const response = await api.get('/products/categories');

      let categoriesData = Array.isArray(response.data) ? response.data : [];

      if (categoriesData.length > 0 && typeof categoriesData[0] === 'string') {
        categoriesData = categoriesData.map((name, index) => ({
          id: index + 1,
          name: name,
          imageUrl: null
        }));
      }

      setCategories(categoriesData);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setLoadError(getApiErrorMessage(err, 'No se pudieron cargar las categorías'));
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryImageUrl = (category) => {
    if (!category?.imageUrl) return null;
    if (category.imageUrl.startsWith('http')) return category.imageUrl;
    if (category.imageUrl.startsWith('/')) return `${IMAGE_BASE_URL}${category.imageUrl}`;
    return `${IMAGE_BASE_URL}/api/images/${category.imageUrl}`;
  };

  if (loadingCategories) {
    return (
      <div className="categories-page">
        <Header />
        <div className="categories-container">
          <div className="categories-loading">
            <div className="categories-loading-spinner" />
            <p>Cargando categorías...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="categories-page">
      <Header />
      <div className="categories-container">
        <div className="categories-hero">
          <h1 className="categories-title">Categorías</h1>
          <p className="categories-subtitle">Explorá nuestros productos por categoría</p>
        </div>

        {loadError && (
          <div className="categories-error">
            <p>{loadError}</p>
            <button type="button" onClick={loadCategories} style={{ marginTop: '1rem' }}>
              Reintentar
            </button>
          </div>
        )}

        {!loadError && categories.length === 0 ? (
          <div className="categories-empty">
            <p>No hay categorías disponibles por ahora.</p>
          </div>
        ) : null}

        {!loadError && categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.name}
                className="category-card"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/products?category=${encodeURIComponent(cat.name)}`);
                  }
                }}
              >
                <div className="category-card-image">
                  {getCategoryImageUrl(cat) ? (
                    <img
                      src={getCategoryImageUrl(cat)}
                      alt={cat.name}
                      className="category-thumbnail"
                    />
                  ) : (
                    <div className="no-image">Sin imagen</div>
                  )}
                </div>
                <div className="category-card-info">
                  <strong>{cat.name}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}

export default Categories;
