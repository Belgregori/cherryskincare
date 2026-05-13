import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiError';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './Products.css';

/** Etiqueta legible: primera mayúscula, resto minúsculas (ej. Skincare). El valor del filtro sigue siendo el nombre crudo del backend. */
function formatCategoryTitle(name) {
  const t = (typeof name === 'string' ? name : '').trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    return safeGetLocalStorage('products_searchTerm', '');
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return safeGetLocalStorage('products_selectedCategory', 'all');
  });
  const [sortBy, setSortBy] = useState(() => {
    return safeGetLocalStorage('products_sortBy', 'name');
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    } else {
      setSelectedCategory('all');
    }
    loadProducts();
  }, [searchParams]);

  // Persistir filtros en localStorage
  useEffect(() => {
    safeSetLocalStorage('products_searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    safeSetLocalStorage('products_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    safeSetLocalStorage('products_sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      const activeProducts = data.filter(product => product.isActive);
      setProducts(activeProducts);
      
      // Cargar categorías desde el endpoint
      const categoriesData = await productService.getCategories();
      // Normalizar categorías (puede venir como array de strings o array de objetos)
      const normalizedCategories = [...new Set((categoriesData || [])
        .map((cat) => {
          if (typeof cat === 'string') return cat;
          if (cat && typeof cat === 'object') {
            // Soportar posibles shapes del backend
            return cat.name ?? cat.category ?? cat.categoryName ?? cat.title ?? '';
          }
          return '';
        })
        .map((name) => (typeof name === 'string' ? name.trim() : ''))
        .filter((name) => name.length > 0)
      )].sort((a, b) => a.localeCompare(b, 'es'));
      setCategories(normalizedCategories);
      
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos cargar los productos.', {
        byStatus: { 503: 'El listado no está disponible temporalmente.' },
      }));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const productCategory = (product.category?.trim() || '').toUpperCase();
        const selectedCategoryTrimmed = (selectedCategory.trim()).toUpperCase();
        const matches = productCategory === selectedCategoryTrimmed;
        if (!matches && productCategory && selectedCategoryTrimmed) {
          console.log('No match:', { productCategory, selectedCategoryTrimmed, productName: product.name });
        }
        return matches;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="products-page">
        <Header />
        <div className="products-container">
          <div className="loading">Cargando productos...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <Header />
        <div className="products-container">
          <div className="error">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="products-page">
      <Header />
      <div className="products-container">
        <div className="products-header">
          <h1>Todos los Productos</h1>
          <p>Explora nuestra colección completa</p>
        </div>

        <div className="products-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="category">Categoría:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {formatCategoryTitle(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">Ordenar por:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Nombre A-Z</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          <div className="results-count">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No se encontraron productos con los filtros seleccionados.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="clear-filters-btn">
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Products;

