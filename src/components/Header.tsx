import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, LogOut, ShieldAlert, Heart, Menu, X } from 'lucide-react';
import type { User as DbUser } from '../data/db';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  currentUser: DbUser | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setView,
  cartCount,
  currentUser,
  onLogout,
  onOpenAuth
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavigate = (view: string) => {
    setView(view);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <nav className="header-nav glass">
        {/* Logo */}
        <div className="logo" onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>
          <Heart size={22} fill="var(--primary)" stroke="var(--primary)" />
          <span>FluffyyyBloomss</span>
        </div>

        {/* Laptop/Desktop Nav Links */}
        <div className="nav-links">
          <button
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
          >
            Home
          </button>
          <button
            className={`nav-item ${currentView === 'shop' ? 'active' : ''}`}
            onClick={() => handleNavigate('shop')}
          >
            Catalog
          </button>
          <button
            className={`nav-item ${currentView === 'track' ? 'active' : ''}`}
            onClick={() => handleNavigate('track')}
          >
            Track Order
          </button>
          
          {currentUser?.isAdmin && (
            <button
              className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavigate('admin')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706' }}
            >
              <ShieldAlert size={15} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Laptop/Desktop Actions + Mobile Burger Toggle */}
        <div className="nav-actions">
          {/* Sign In (Desktop) */}
          <div className="nav-links" style={{ gap: '0.75rem' }}>
            {currentUser ? (
              <div className="user-profile-btn">
                <UserIcon size={15} />
                <span>{currentUser.name.split(' ')[0]}</span>
                <button
                  onClick={onLogout}
                  title="Log Out"
                  style={{
                    marginLeft: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#ef4444',
                    padding: '0.2rem'
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button className="user-profile-btn" onClick={onOpenAuth}>
                <UserIcon size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Cart Icon (Always visible) */}
          <button
            className="icon-btn"
            onClick={() => setView('cart')}
            aria-label="View Cart"
            style={{
              border: currentView === 'cart' ? '1px solid var(--primary)' : 'none',
              background: currentView === 'cart' ? 'var(--primary-light)' : 'none'
            }}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>

          {/* Mobile Menu Hamburguer toggle */}
          <button
            className="icon-btn mobile-menu-toggle"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open Mobile Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay Backdrop */}
      <div 
        className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <button
          className="modal-close"
          onClick={() => setIsDrawerOpen(false)}
          aria-label="Close Mobile Menu"
          style={{ top: '1.25rem', right: '1.25rem' }}
        >
          <X size={18} />
        </button>

        <div className="logo" style={{ marginBottom: '1rem' }}>
          <Heart size={20} fill="var(--primary)" stroke="var(--primary)" />
          <span>FluffyyyBloomss</span>
        </div>

        <div className="drawer-links">
          <button
            className={`drawer-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
          >
            Home
          </button>
          <button
            className={`drawer-link ${currentView === 'shop' ? 'active' : ''}`}
            onClick={() => handleNavigate('shop')}
          >
            Catalog Collection
          </button>
          <button
            className={`drawer-link ${currentView === 'track' ? 'active' : ''}`}
            onClick={() => handleNavigate('track')}
          >
            Track My Order
          </button>
          {currentUser?.isAdmin && (
            <button
              className={`drawer-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavigate('admin')}
              style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldAlert size={18} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Mobile Session Actions */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <UserIcon size={16} />
                <span>Signed as {currentUser.name}</span>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  onLogout();
                  setIsDrawerOpen(false);
                }}
                style={{
                  background: '#ef4444',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={() => {
                onOpenAuth();
                setIsDrawerOpen(false);
              }}
            >
              Sign In Account
            </button>
          )}
        </div>
      </div>
    </>
  );
};
export default Header;
