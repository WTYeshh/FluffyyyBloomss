import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Storefront } from './views/Storefront';
import { CartView } from './views/CartView';
const AdminDashboard = React.lazy(() => import('./views/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
import { HomeView } from './views/HomeView';
import { OrderTrackerView } from './views/OrderTrackerView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AuthModal } from './components/AuthModal';
import { Preloader } from './components/Preloader';
import { getLoggedInUser, getProducts, logoutUser } from './data/db';
import type { Product, User } from './data/db';
import { Heart, Lock } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'fluffy_bloom_cart';

function App() {
  const [currentView, setView] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'flowers' | 'keychains' | 'art'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    // Get products
    setProducts(getProducts());
    
    // Get logged-in user
    setCurrentUser(getLoggedInUser());

    // Get cart items from local storage
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
  }, []);

  // Save cart to local storage when it updates
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Refresh products list
  const refreshProducts = () => {
    setProducts(getProducts());
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Stop opening product modal when clicking add-to-cart on card
    
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.product.id === product.id);
      if (existing) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.isAdmin) {
      setView('admin');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    if (currentView === 'admin') {
      setView('shop');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    // Dynamically apply class depending on category to adapt styles
    <div className={`app-container theme-${activeCategory}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Preloader />
      
      {/* Navbar */}
      <Header
        currentView={currentView}
        setView={setView}
        cartCount={cartCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Areas */}
      <main style={{ flexGrow: 1 }}>
        {currentView === 'home' && (
          <HomeView
            products={products}
            setView={setView}
            setActiveCategory={setActiveCategory}
            onAddToCart={handleAddToCart}
            onViewDetails={(prod) => setSelectedProduct(prod)}
          />
        )}

        {currentView === 'shop' && (
          <Storefront
            products={products}
            onAddToCart={handleAddToCart}
            onViewDetails={(prod) => setSelectedProduct(prod)}
            activeCategory={activeCategory}
            setActiveCategory={(cat) => {
              setActiveCategory(cat);
            }}
          />
        )}

        {currentView === 'track' && (
          <OrderTrackerView />
        )}

        {currentView === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            currentUser={currentUser}
            setView={setView}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          currentUser?.isAdmin ? (
            <React.Suspense fallback={<div className="text-center" style={{ padding: '4rem 2rem' }}>Loading Admin Panel...</div>}>
              <AdminDashboard onProductsUpdated={refreshProducts} />
            </React.Suspense>
          ) : (
            <div className="text-center" style={{ padding: '8rem 2rem', maxWidth: '400px', margin: '0 auto' }}>
              <Lock size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Access Denied</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Please log in with an administrator account to access this panel.
              </p>
              <button className="btn-primary" onClick={() => setIsAuthOpen(true)}>
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          padding: '3rem 2rem 2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
          <Heart size={16} fill="var(--primary)" />
          <span>FluffyyyBloomss</span>
        </div>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Beautiful Handcrafted Flowers, Keychains, and anime canvas art.<br />
          Made with love & high-quality milk cotton yarn.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <button onClick={() => setView('shop')} style={{ color: 'var(--text-muted)' }}>Shop</button>
          <button onClick={() => setView('cart')} style={{ color: 'var(--text-muted)' }}>Bag</button>
          <button 
            onClick={() => {
              if (currentUser?.isAdmin) {
                setView('admin');
              } else {
                setIsAuthOpen(true);
              }
            }} 
            style={{ 
              color: 'var(--text-muted)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem' 
            }}
          >
            <Lock size={12} />
            <span>Admin Entrance</span>
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} FluffyyyBloomss. All rights reserved.
        </p>
      </footer>

      {/* Overlays / Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
