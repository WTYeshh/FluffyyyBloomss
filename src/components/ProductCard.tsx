import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../data/db';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
  cartQuantity?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails, cartQuantity = 0 }) => {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'single': return 'Single Flower';
      case 'bouquet': return 'Flower Bouquet';
      case 'keychains': return 'Cute Keychain';
      case 'accessories': return 'Accessories';
      default: return cat;
    }
  };

  return (
    <article className="product-card" onClick={() => onViewDetails(product)} style={{ cursor: 'pointer' }}>
      {discount > 0 && (
        <span className="badge-sale">
          {discount}% OFF
        </span>
      )}
      
      <div className="product-img-container">
        <img
          src={product.image}
          alt={product.title}
          className="product-img"
          loading="lazy"
        />
      </div>

      <div className="product-details">
        <span className="product-cat">{getCategoryLabel(product.category)}</span>
        <h3 className="product-title" title={product.title}>
          {product.title}
        </h3>
        
        <div className="product-price-section">
          <span className="current-price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="scratch-price">₹{product.originalPrice}</span>
          )}
        </div>

        {cartQuantity > 0 ? (
          <div style={{ display: 'flex', gap: '0.4rem', width: '100%', marginTop: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
            {/* Non-clickable gray status label */}
            <div
              style={{
                flexGrow: 1,
                padding: '0.8rem',
                backgroundColor: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: 600,
                userSelect: 'none',
                cursor: 'default'
              }}
            >
              <span>✓ Added to Cart ({cartQuantity})</span>
            </div>
            {/* +1 button — only interactive element */}
            <button
              className="add-cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, e);
              }}
              style={{
                margin: 0,
                width: '42px',
                flexShrink: 0,
                padding: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '1rem',
                backgroundColor: 'var(--bg-store)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)'
              }}
              disabled={!product.isAvailable}
              title="Add one more"
            >
              +1
            </button>
          </div>
        ) : (
          <button
            className="add-cart-btn"
            onClick={(e) => onAddToCart(product, e)}
            disabled={!product.isAvailable}
          >
            <ShoppingCart size={16} />
            <span>{product.isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        )}
      </div>
    </article>
  );
};
