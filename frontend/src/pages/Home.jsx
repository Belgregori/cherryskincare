import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';
import ProductCard from '../components/ProductCard';
import { getImageUrl } from '../services/api';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

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
      let errorMessage = 'Error al cargar los productos';
      
      if (err.response) {
        // Error del servidor
        errorMessage = `Error del servidor: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        // Error de red (no hay respuesta)
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.';
      } else {
        // Error al configurar la petición
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
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

