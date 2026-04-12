import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { capitalizeFirst } from '../utils/formatUtils';
import './ImageCarousel.css';

const ITEM_WIDTH_MAX = 280;
const ITEM_WIDTH_MIN = 72;
const SPEED_PX_PER_SEC = 38;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1;
const MIN_OPACITY = 0.6;
const MAX_OPACITY = 1;
const MOBILE_BREAKPOINT_PX = 576;
const VISIBLE_ITEMS_DESKTOP = 5;
const VISIBLE_ITEMS_MOBILE = 3;

/**
 * Curva suave tipo coseno: en el centro (t=0) devuelve 1, en los extremos (t=1) devuelve 0.
 * Usada para escala y opacidad según distancia al centro.
 */
function smoothCurve(t) {
  const clamped = Math.min(1, Math.max(0, t));
  return Math.cos((Math.PI / 2) * clamped);
}

function ImageCarousel({ products = [] }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const navigate = useNavigate();
  const [itemWidth, setItemWidth] = useState(ITEM_WIDTH_MAX);
  const [visibleItems, setVisibleItems] = useState(VISIBLE_ITEMS_DESKTOP);

  const getDisplayProducts = (count) => {
    if (products.length === 0) return [];
    if (products.length >= count) return products.slice(0, count);
    const repeated = [];
    while (repeated.length < count) {
      repeated.push(...products);
    }
    return repeated.slice(0, count);
  };

  const baseSet = getDisplayProducts(visibleItems);
  const repeatCount = visibleItems === VISIBLE_ITEMS_MOBILE ? 4 : 3;
  const trackItems = Array.from({ length: repeatCount }, () => baseSet).flat();
  const segmentWidth = baseSet.length * itemWidth;
  const trackWidth = trackItems.length * itemWidth;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const w = container.offsetWidth || 0;
      const nextVisible = w > 0 && w < MOBILE_BREAKPOINT_PX ? VISIBLE_ITEMS_MOBILE : VISIBLE_ITEMS_DESKTOP;
      setVisibleItems(nextVisible);

      const slot = w < 1
        ? ITEM_WIDTH_MAX
        : Math.min(ITEM_WIDTH_MAX, Math.max(ITEM_WIDTH_MIN, (w / nextVisible) * 0.88));
      setItemWidth(slot);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleProductClick = useCallback((productId) => {
    if (productId) navigate(`/product/${productId}`);
  }, [navigate]);

  useEffect(() => {
    if (baseSet.length === 0 || !containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;

    if (segmentWidth > 0) {
      progressRef.current = progressRef.current % segmentWidth;
    }

    const tick = (now) => {
      const lastTime = lastTimeRef.current;
      const dt = lastTime != null ? (now - lastTime) / 1000 : 0;
      lastTimeRef.current = now;

      let progress = progressRef.current + SPEED_PX_PER_SEC * dt;
      if (progress >= segmentWidth) progress -= segmentWidth;
      progressRef.current = progress;

      track.style.transform = `translate3d(${-progress}px, 0, 0)`;

      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const halfWidth = Math.max(containerRect.width / 2, 1);

      const slots = track.querySelectorAll('.carousel-slot');
      slots.forEach((slot) => {
        const rect = slot.getBoundingClientRect();
        const slotCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(slotCenterX - centerX);
        const t = distance / halfWidth;
        const curve = smoothCurve(t);

        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * curve;
        const opacity = MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * curve;
        const shadowIntensity = curve;
        const boxShadow = `0 ${4 + 12 * shadowIntensity}px ${12 + 20 * shadowIntensity}px rgba(0, 0, 0, ${0.15 + 0.2 * shadowIntensity})`;

        const item = slot.querySelector('.carousel-item');
        if (item) {
          item.style.transform = `scale(${scale})`;
          item.style.opacity = String(opacity);
          item.style.boxShadow = boxShadow;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [baseSet.length, segmentWidth]);

  if (baseSet.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="image-carousel-infinite"
      role="region"
      aria-label="Carrusel de productos destacados"
    >
      <div
        ref={trackRef}
        className="carousel-track"
        style={{ width: trackWidth }}
        aria-live="polite"
      >
        {trackItems.map((product, index) => {
          const imageUrl = typeof product === 'string' ? product : product.imageUrl;
          const productId = typeof product === 'object' && product.id ? product.id : null;
          const name = typeof product === 'object' && product.name ? product.name : null;
          return (
            <div
              key={`${productId ?? imageUrl}-${index}`}
              className="carousel-slot"
              style={{ width: itemWidth }}
            >
              <div
                className="carousel-item"
                onClick={() => handleProductClick(productId)}
                style={{ cursor: productId ? 'pointer' : 'default' }}
                role={productId ? 'button' : undefined}
                tabIndex={productId ? 0 : undefined}
                onKeyDown={(e) => {
                  if (productId && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleProductClick(productId);
                  }
                }}
              >
                <img
                  src={imageUrl}
                  alt={name ? capitalizeFirst(name) : `Imagen ${(index % baseSet.length) + 1} del carrusel Cherry Skincare`}
                  loading={index < 10 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Imagen';
                    e.target.alt = 'Imagen no disponible';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ImageCarousel;
