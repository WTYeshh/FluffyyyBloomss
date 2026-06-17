import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../data/db';

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
  activeCategory: 'all' | 'flowers' | 'keychains' | 'art';
  setActiveCategory: (category: 'all' | 'flowers' | 'keychains' | 'art') => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  onAddToCart,
  onViewDetails,
  activeCategory,
  setActiveCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Filter products by active category
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.isAvailable;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0; // default
  });

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'flowers': return 'Eternal Blossoms';
      case 'keychains': return 'Amigurumi Buddies';
      case 'art': return 'Straw Hat Gallery';
      default: return 'Handcrafted Collections';
    }
  };

  const getCategorySub = () => {
    switch (activeCategory) {
      case 'flowers': return 'Elegant hand-knit flower pots & crochet bouquets, crafted with precision using premium cotton fibers.';
      case 'keychains': return 'Cute, plush amigurumi companions. Stuffed with love to accompany your keys, bags, and backpacks.';
      case 'art': return 'High-contrast anime themed paintings and woodwork engravings capturing your favorite One Piece moments.';
      default: return 'Explore our boutique of handcrafted creations. Each item is unique, durable, and made with absolute care.';
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <span 
          style={{ 
            fontSize: '0.85rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '0.4rem 1rem',
            borderRadius: '20px'
          }}
        >
          Artisanal Boutique
        </span>
        <h1>{getCategoryTitle()}</h1>
        <p>{getCategorySub()}</p>
      </section>

      {/* Categories / Tabs Filter */}
      <div className="category-tabs">
        <button
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Handcrafted
        </button>
        <button
          className={`tab-btn ${activeCategory === 'flowers' ? 'active' : ''}`}
          onClick={() => setActiveCategory('flowers')}
        >
          Crochet Flowers
        </button>
        <button
          className={`tab-btn ${activeCategory === 'keychains' ? 'active' : ''}`}
          onClick={() => setActiveCategory('keychains')}
        >
          Cute Keychains
        </button>
        <button
          className={`tab-btn ${activeCategory === 'art' ? 'active' : ''}`}
          onClick={() => setActiveCategory('art')}
        >
          One Piece Art
        </button>
      </div>

      {/* Search and Sort Toolbar */}
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto 1rem',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search our creations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', borderRadius: '30px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              borderRadius: '30px', 
              padding: '0.5rem 2rem 0.5rem 1rem', 
              width: 'auto',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="alphabetical">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length > 0 ? (
        <section className="product-grid">
          {sortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          ))}
        </section>
      ) : (
        <div className="text-center" style={{ padding: '6rem 2rem', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No creations found</h3>
          <p>We couldn't find any products matching your search criteria. Try a different term!</p>
        </div>
      )}
    </div>
  );
};
