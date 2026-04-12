import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiError';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../services/api';
import { capitalizeFirst } from '../utils/formatUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Preparar array de imágenes (por ahora solo imageUrl, pero preparado para múltiples)
  const productImages = product?.imageUrl ? [product.imageUrl] : [];
  
  // Resetear índice de imagen cuando cambia el producto
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
    }
  }, [product?.id]);

  // Intercambiar imagen principal con miniatura al hacer click
  const handleThumbnailClick = (clickedIndex) => {
    if (clickedIndex !== selectedImageIndex) {
      setSelectedImageIndex(clickedIndex);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);
      setError(null);
      setSelectedImageIndex(0); // Resetear imagen seleccionada al cargar nuevo producto
    } catch (err) {
      setError(getApiErrorMessage(err, 'Producto no encontrado'));
    } finally {
      setLoading(false);
    }
  };
  
  // Calcular precio total
  const totalPrice = product ? (product.price || 0) * quantity : 0;

  const handleAddToCart = () => {
    if (product && product.stockQuantity > 0) {
      addToCart(product, quantity);
      showToast(
        `¡${quantity} ${capitalizeFirst(product.name)} agregado${quantity > 1 ? 's' : ''} al carrito!`,
        { variant: 'success' }
      );
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="product-detail-container">
          <div className="loading">Cargando producto...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="product-detail-container">
          <div className="error-message">
            <p>{error || 'Producto no encontrado'}</p>
            <button onClick={() => navigate('/')} className="back-button">
              Volver al inicio
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Header />
      <div className="product-detail-container">
        <div className="product-detail-content">
          <div className="product-detail-main-grid">
            {/* Columna izquierda: Galería de imágenes */}
            <div className="product-gallery-section">
            <div className="product-main-image">
              {productImages.length > 0 && productImages[selectedImageIndex] ? (
                <img
                  src={getImageUrl(productImages[selectedImageIndex])}
                  alt={capitalizeFirst(product.name)}
                  className="product-detail-image"
                  onError={(e) => {
                    console.error('Error loading image:', productImages[selectedImageIndex], e);
                    e.target.src = 'https://via.placeholder.com/600x600?text=Sin+Imagen';
                  }}
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {productImages.length > 1 && (
              <div className="product-thumbnails">
                {productImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`thumbnail-button ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={getImageUrl(imageUrl)}
                      alt={`${capitalizeFirst(product.name)} - Vista ${index + 1}`}
                      onError={(e) => {
                        console.error('Error loading thumbnail:', imageUrl, e);
                        e.target.src = 'https://via.placeholder.com/80x80?text=Sin+Imagen';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => navigate(-1)} className="back-button">
              ← Volver
            </button>
          </div>

          {/* Columna derecha: Información del producto */}
          <div className="product-info-section">
            <div className="product-header product-header-info">
              <h1 className="product-title">{capitalizeFirst(product.name)}</h1>
            </div>

            {product.category && (
              <div className="product-category-text">
                {product.category}
              </div>
            )}

            {product.price != null && !Number.isNaN(Number(product.price)) && (
              <p
                className="product-detail-price-text"
                aria-label={`Precio ${Math.round(Number(product.price))} pesos`}
              >
                ${Math.round(Number(product.price))}
              </p>
            )}

            <div className="product-description">
              <p>{product.description || 'Sin descripción disponible.'}</p>
            </div>

            {/* 4. Cantidad */}
            {product.stockQuantity > 0 && (
              <div className="quantity-selector">
                <label htmlFor="quantity">
                  Cantidad: <span className="sr-only">(máximo {product.stockQuantity} disponibles)</span>
                </label>
                <div className="quantity-controls" role="group" aria-label="Control de cantidad">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-button"
                    type="button"
                    aria-label="Disminuir cantidad"
                    disabled={quantity <= 1}
                    aria-disabled={quantity <= 1}
                  >
                    <span aria-hidden="true">−</span>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), product.stockQuantity));
                    }}
                    className="quantity-input"
                    aria-label="Cantidad de producto"
                    aria-valuemin="1"
                    aria-valuemax={product.stockQuantity}
                    aria-valuenow={quantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="quantity-button"
                    type="button"
                    aria-label="Aumentar cantidad"
                    disabled={quantity >= product.stockQuantity}
                    aria-disabled={quantity >= product.stockQuantity}
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. Botón agregar al carrito */}
            <div className="product-actions">
              {product.stockQuantity > 0 ? (
                <button 
                  onClick={handleAddToCart}
                  className="add-to-cart-button"
                >
                  🛒 Agregar al Carrito
                </button>
              ) : (
                <button 
                  className="add-to-cart-button disabled"
                  disabled
                >
                  Producto Agotado
                </button>
              )}
            </div>

            {/* 6. Stock disponible */}
            <div className="product-stock-section">
              {product.stockQuantity > 0 ? (
                <span className="stock-available-text">
                  Stock disponible: {product.stockQuantity} {product.stockQuantity === 1 ? 'unidad' : 'unidades'}
                </span>
              ) : (
                <span className="stock-available-text out-of-stock-text">
                  Stock disponible: 0 unidades
                </span>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetail;

