import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';
import ProductCard from '../components/ProductCard';
import { getImageUrl } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.length > 0 && typeof list[0] === 'string'
        ? list.map((name, i) => ({ id: i + 1, name, imageUrl: null }))
        : list;
      setCategories(normalized);
      setCategoriesError(null);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategories([]);
      setCategoriesError(
        getApiErrorMessage(
          err,
          'No pudimos cargar las categorías. Podés seguir explorando los productos abajo.'
        )
      );
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      // Filtrar solo productos activos
      const activeProducts = data.filter(product => product.isActive);
      setProducts(activeProducts);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(
        getApiErrorMessage(
          err,
          'No pudimos cargar el catálogo en este momento. Probá de nuevo en unos minutos.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="home-container">
          <div className="loading">Cargando productos...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <div className="home-container">
          <div className="error">
            <p>{error}</p>
            <button onClick={loadProducts} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <div className="home-container">
        {/* Carrusel de imágenes */}
        <section className="carousel-section">
          <h2 className="featured-products-title">Productos destacados</h2>
          <ImageCarousel 
            products={products
              .filter(p => p.imageUrl)
              .slice(0, 5)
              .map(p => ({
                id: p.id,
                name: p.name,
                imageUrl: getImageUrl(p.imageUrl)
              }))
            }
          />
        </section>

        <section className="home-categories-section">
          <h2 className="home-categories-title">Categorías</h2>
          {categoriesError && (
            <p className="home-categories-warning" role="status">
              {categoriesError}
            </p>
          )}
          {categories.length > 0 ? (
            <div className="home-categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id || cat.name}
                  className="home-category-card"
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
                  <div className="home-category-card-image">
                    {cat.imageUrl ? (
                      <img
                        src={getImageUrl(cat.imageUrl)}
                        alt={cat.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('.home-category-no-image')) {
                            const div = document.createElement('div');
                            div.className = 'home-category-no-image';
                            div.textContent = 'Sin imagen';
                            parent.appendChild(div);
                          }
                        }}
                      />
                    ) : (
                      <div className="home-category-no-image">Sin imagen</div>
                    )}
                  </div>
                  <div className="home-category-card-info">
                    <span>{cat.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="products-section">
        <h2>Nuestros Productos</h2>
        
        {products.length === 0 ? (
          <p className="no-products">No hay productos disponibles en este momento.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      </div>
      <Footer />
    </div>
  );
}

export default Home;

