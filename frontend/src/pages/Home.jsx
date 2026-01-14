import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';
import { IMAGE_BASE_URL } from '../services/api';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      // Filtrar solo productos activos
      const activeProducts = data.filter(product => product.isActive);
      setProducts(activeProducts);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
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
          <div className="error">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <div className="home-container">
        <section className="hero-section">
          <h1>Cherry Skincare</h1>
          <p>Tu tienda de productos de cuidado de la piel</p>
        </section>

        {/* Carrusel de imágenes */}
        <section className="carousel-section">
          <ImageCarousel 
            images={products
              .filter(p => p.imageUrl)
              .slice(0, 5)
              .map(p => `${IMAGE_BASE_URL}${p.imageUrl}`)
            }
          />
        </section>

        <section className="products-section">
        <h2>Nuestros Productos</h2>
        
        {products.length === 0 ? (
          <p className="no-products">No hay productos disponibles en este momento.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
              >
                {product.imageUrl && (
                  <div className="product-image" onClick={() => navigate(`/product/${product.id}`)}>
                    <img 
                      src={`${IMAGE_BASE_URL}${product.imageUrl}`} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
                      }}
                    />
                  </div>
                )}
                <div className="product-info" onClick={() => navigate(`/product/${product.id}`)}>
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">${product.price?.toFixed(2)}</p>
                  {product.stockQuantity > 0 ? (
                    <span className="product-stock">En stock: {product.stockQuantity}</span>
                  ) : (
                    <span className="product-out-of-stock">Agotado</span>
                  )}
                </div>
                {product.stockQuantity > 0 && (
                  <button
                    className="add-to-cart-quick-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    aria-label="Agregar al carrito"
                    title="Agregar al carrito"
                  >
                    +
                  </button>
                )}
              </div>
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

