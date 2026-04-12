import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';
import { capitalizeFirst } from '../utils/formatUtils';
import './ProductCard.css';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card">
      {product.imageUrl && (
        <div className="product-image" onClick={handleCardClick}>
          <img
            src={getImageUrl(product.imageUrl)}
            alt={capitalizeFirst(product.name)}
            onError={(e) => {
              console.error('Error loading image:', product.imageUrl, e);
              e.target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
            }}
          />
          {product.stockQuantity > 0 && (
            <button
              className="add-to-cart-quick-button"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
              title="Agregar al carrito"
            >
              +
            </button>
          )}
        </div>
      )}
      <div className="product-info" onClick={handleCardClick}>
        <h3>{capitalizeFirst(product.name)}</h3>
        <div className="product-meta">
          <p className="product-category">{product.category}</p>
          {product.price && (
            <p className="product-price">${Math.round(product.price)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
