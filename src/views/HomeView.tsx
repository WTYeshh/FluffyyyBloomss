import React from 'react';
import { Heart, Flower, Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '../data/db';

interface HomeViewProps {
  products: Product[];
  setView: (view: string) => void;
  setActiveCategory: (category: 'all' | 'flowers' | 'keychains' | 'art') => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  setView,
  setActiveCategory,
  onAddToCart,
  onViewDetails
}) => {
  // Grab a few products for the featured/bestseller row
  const bestsellers = products.slice(0, 4);

  const handleNavigateCategory = (cat: 'flowers' | 'keychains' | 'art') => {
    setActiveCategory(cat);
    setView('shop');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '5rem' }}>
      
      {/* 1. Large Hero Banner */}
      <section 
        style={{
          position: 'relative',
          padding: '6rem 2rem',
          margin: '0 2rem 0',
          background: 'rgba(254, 252, 250, 0.45)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
        
        <span 
          style={{ 
            fontSize: '0.85rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '3px', 
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            zIndex: 1
          }}
        >
          100% Handcrafted Boutique
        </span>

        <h1 
          style={{ 
            fontSize: '3.6rem', 
            fontWeight: 800, 
            lineHeight: '1.1', 
            letterSpacing: '-1.5px',
            maxWidth: '800px',
            zIndex: 1
          }}
        >
          Discover Cozy Crochet Florals & Unique Anime Art
        </h1>

        <p 
          style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-muted)', 
            maxWidth: '650px',
            lineHeight: '1.6',
            zIndex: 1
          }}
        >
          Welcome to **FluffyyyBloomss**. Every flower pot, cute amigurumi animal, and canvas painting is custom made by hand with absolute care and top-tier yarn.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, marginTop: '1rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => { setActiveCategory('all'); setView('shop'); }}
            style={{ width: 'auto', padding: '1rem 2.5rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Explore Collection</span>
            <ArrowRight size={16} />
          </button>
          <button 
            className="tab-btn" 
            onClick={() => setView('track')}
            style={{ borderRadius: '30px', padding: '1rem 2.25rem', margin: 0 }}
          >
            Track My Order
          </button>
        </div>
      </section>

      {/* 2. Featured Categories Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Shop by Category</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Individually designed creations, adapted to their own unique styling rules.</p>
        </div>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2rem' 
          }}
        >
          {/* Card: Flowers */}
          <div 
            className="product-card" 
            onClick={() => handleNavigateCategory('flowers')}
            style={{ cursor: 'pointer', padding: '2.25rem', background: 'rgba(255, 253, 252, 0.75)', border: '1px solid rgba(220, 185, 180, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                <Flower size={32} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '2px 8px', borderRadius: '10px' }}>
                Serif Aesthetic
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
              Eternal Crochet Florals
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Detailed tulips, daisies, lilies, and customized lavender bouquets wrapped in brown packing wrap. Never fades, no watering required.
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#ec4899', marginTop: 'auto' }}>
              <span>View Flowers</span>
              <ArrowRight size={14} />
            </span>
          </div>

          {/* Card: Keychains */}
          <div 
            className="product-card" 
            onClick={() => handleNavigateCategory('keychains')}
            style={{ cursor: 'pointer', padding: '2.25rem', background: 'rgba(254, 252, 255, 0.75)', border: '1px solid rgba(195, 180, 215, 0.35)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                <Heart size={32} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '10px' }}>
                Rounded Cute
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: "'Fredoka', sans-serif" }}>
              Amigurumi Keychains
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Chubby kittens, dinosaurs, bees, and smiling octopuses. Stuffed with micro-fibers, attached to a premium metal keyclasp.
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#8b5cf6', marginTop: 'auto' }}>
              <span>View Keychains</span>
              <ArrowRight size={14} />
            </span>
          </div>

          {/* Card: One Piece Art */}
          <div 
            className="product-card" 
            onClick={() => handleNavigateCategory('art')}
            style={{ cursor: 'pointer', padding: '2.25rem', background: 'rgba(254, 252, 250, 0.75)', border: '1px solid rgba(239, 180, 180, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
                <Sparkles size={32} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: '10px' }}>
                Dark Bold Gold
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              One Piece Canvas Art
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Vibrant acrylic sketches, neon UV glow-paint canvas, and burnt wood engravings illustrating Luffy, Zoro, Shanks, and crew icons.
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#ef4444', marginTop: 'auto' }}>
              <span>View Anime Art</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </section>

      {/* 3. Showcase of Bestsellers */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Bestselling Creations</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Our most popular items, ready to be dispatched.</p>
          </div>
          <button 
            onClick={() => { setActiveCategory('all'); setView('shop'); }} 
            style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem' }}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '2rem' 
          }}
        >
          {bestsellers.map(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            return (
              <div key={product.id} className="product-card" onClick={() => onViewDetails(product)} style={{ cursor: 'pointer' }}>
                <span className="badge-sale">{discount}% OFF</span>
                <div className="product-img-container">
                  <img src={product.image} alt={product.title} className="product-img" />
                </div>
                <div className="product-details">
                  <span className="product-cat" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                  <h3 className="product-title" style={{ fontSize: '1.05rem' }}>{product.title}</h3>
                  <div className="product-price-section">
                    <span className="current-price" style={{ fontSize: '1.2rem' }}>₹{product.price}</span>
                    <span className="scratch-price" style={{ fontSize: '0.8rem' }}>₹{product.originalPrice}</span>
                  </div>
                  <button 
                    className="add-cart-btn"
                    onClick={(e) => onAddToCart(product, e)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
export default HomeView;
