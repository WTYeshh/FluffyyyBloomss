import React from 'react';
import { X, ShoppingCart, Percent } from 'lucide-react';
import type { Product } from '../data/db';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'flowers': return 'Handcrafted Flower';
      case 'keychains': return 'Cute Keychain';
      case 'art': return 'One Piece Art';
      default: return cat;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="detail-img-side">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="detail-info-side">
          <div>
            <span className="product-cat" style={{ fontSize: '0.8rem' }}>
              {getCategoryLabel(product.category)}
            </span>
            <h2 className="modal-title" style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '1.8rem', lineHeight: '1.2' }}>
              {product.title}
            </h2>
            
            <div className="product-price-section" style={{ marginBottom: '1.25rem' }}>
              <span className="current-price" style={{ fontSize: '1.8rem' }}>₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="scratch-price" style={{ fontSize: '1.1rem' }}>₹{product.originalPrice}</span>
                  <span 
                    style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold', 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.1rem',
                      marginLeft: '0.5rem'
                    }}
                  >
                    <Percent size={12} />
                    {discount}% Off
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', flexGrow: 1 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Product Details
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              {product.description}
            </p>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button
              className="btn-primary"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={!product.isAvailable}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShoppingCart size={18} />
              <span>{product.isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
