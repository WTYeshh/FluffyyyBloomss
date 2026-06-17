import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../data/db';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'flowers': return 'Handcrafted Flowers';
      case 'keychains': return 'Cute Keychains';
      case 'art': return 'One Piece Art';
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

        <button
          className="add-cart-btn"
          onClick={(e) => onAddToCart(product, e)}
          disabled={!product.isAvailable}
        >
          <ShoppingCart size={16} />
          <span>{product.isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </article>
  );
};
