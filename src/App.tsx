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
import { getLoggedInUser, getProducts, logoutUser, syncProducts } from './data/db';
import type { Product, User } from './data/db';
import { Heart, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'fluffy_bloom_cart';

function App() {
  const [currentView, setView] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<'all' | 'single' | 'bouquet' | 'keychains' | 'accessories'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAddToCart, setPendingAddToCart] = useState<Product | null>(null);
  const [welcomeToast, setWelcomeToast] = useState<{ name: string; action: 'login' | 'register' | 'order' } | null>(null);

  // Initialize data on mount
  useEffect(() => {
    // Get local products first (fast)
    setProducts(getProducts());

    // Sync with Google Sheets in the background
    syncProducts().then(syncedProducts => {
      setProducts(syncedProducts);
    });
    
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

  // Auto-dismiss welcome toast
  useEffect(() => {
    if (welcomeToast) {
      const timer = setTimeout(() => {
        setWelcomeToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [welcomeToast]);

  const triggerCrackerBurst = () => {
    // Small quick pop of 4 particles from left side
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 30,
      origin: { x: 0.1, y: 0.8 }
    });
    // Small quick pop of 4 particles from right side
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 30,
      origin: { x: 0.9, y: 0.8 }
    });
  };

  const showWelcomeToast = (name: string, action: 'login' | 'register' | 'order') => {
    setWelcomeToast({ name, action });
    triggerCrackerBurst();
  };

  // Refresh products list
  const refreshProducts = (forceSync = false) => {
    setProducts(getProducts());
    if (forceSync) {
      syncProducts().then(syncedProducts => {
        setProducts(syncedProducts);
      });
    }
  };

  const addToCartInternal = (product: Product) => {
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

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Stop opening product modal when clicking add-to-cart on card
    
    if (!currentUser) {
      setPendingAddToCart(product);
      setIsAuthOpen(true);
      return;
    }
    
    addToCartInternal(product);
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

  const handleLoginSuccess = (user: User, isRegister?: boolean) => {
    setCurrentUser(user);
    showWelcomeToast(user.name, isRegister ? 'register' : 'login');
    if (user.isAdmin) {
      setView('admin');
    } else {
      // Auto-add the pending product if any
      if (pendingAddToCart) {
        addToCartInternal(pendingAddToCart);
        setPendingAddToCart(null);
      }
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
            cartItems={cartItems}
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
            cartItems={cartItems}
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
            onOrderConfirmed={(name) => showWelcomeToast(name, 'order')}
          />
        )}

        {currentView === 'admin' && (
          currentUser?.isAdmin ? (
            <React.Suspense fallback={<div className="text-center" style={{ padding: '4rem 2rem' }}>Loading Admin Panel...</div>}>
              <AdminDashboard products={products} onProductsUpdated={refreshProducts} />
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
          padding: '1.5rem 2rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
          <Heart size={14} fill="var(--primary)" />
          <span>FluffyyyBloomss</span>
        </div>
        <p style={{ marginBottom: '0.75rem', lineHeight: '1.5', fontSize: '0.8rem' }}>
          Beautiful Handcrafted Flowers, Keychains, and anime canvas art.&nbsp;
          Made with love.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.8rem' }}>
          <button onClick={() => setView('shop')} style={{ color: 'var(--text-muted)' }}>Shop</button>
          <button onClick={() => setView('cart')} style={{ color: 'var(--text-muted)' }}>Bag</button>
        </div>
        {/* Copyright + inline sparkle credit row */}
        <div className="footer-bottom-row">
          <p style={{ fontSize: '0.72rem', opacity: 0.7, margin: 0 }}>
            &copy; {new Date().getFullYear()} FluffyyyBloomss. All rights reserved.
          </p>
          <div className="footer-dev-credit">
            <span className="footer-dev-sparkle">✦</span>
            <a
              href="https://itsyesh.in"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-label"
            >
              Designed &amp; developed by itsyesh.in
            </a>
          </div>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingAddToCart(null);
        }}
        onSuccess={handleLoginSuccess}
      />

      {welcomeToast && (
        <div 
          className="glass"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '1.25rem 2.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            border: '2px solid var(--primary)',
            background: 'rgba(254, 252, 250, 0.95)',
            textAlign: 'center',
            minWidth: '320px',
            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <span style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            {welcomeToast.action === 'order' ? '🌸' : '✨'}
          </span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {welcomeToast.action === 'order' ? 'Order Confirmed!' : `Welcome, ${welcomeToast.name}!`}
          </strong>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {welcomeToast.action === 'login' && 'Nice to see you again!'}
            {welcomeToast.action === 'register' && 'Thank you for joining our boutique!'}
            {welcomeToast.action === 'order' && 'Your payment & order are registered successfully!'}
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
