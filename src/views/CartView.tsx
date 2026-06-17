import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2, CheckCircle, Smartphone, MapPin, Mail, User } from 'lucide-react';
import { createOrder } from '../data/db';
import type { Product, User as DbUser } from '../data/db';
import { sendOrderEmail } from '../data/email';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentUser: DbUser | null;
  setView: (view: string) => void;
  onOpenAuth: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  currentUser,
  setView,
  onOpenAuth
}) => {
  // Checkout form fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Sync email & name when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name);
      if (!email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (cartItems.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!address.trim() || address.length < 10) {
      setFormError('Please provide a complete house/delivery address.');
      return;
    }
    if (!city.trim()) {
      setFormError('Please enter your city.');
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit pin code.');
      return;
    }

    // Process order
    const orderItems = cartItems.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    const fullAddressString = `${address}, ${city} - ${pincode}`;

    const order = createOrder({
      userId: currentUser?.id || 'guest-' + Date.now(),
      userName: fullName,
      email: email,
      phone: phone,
      address: fullAddressString,
      items: orderItems,
      total: total
    });

    // Send order confirmation details to yeshwanthkg@gmail.com
    sendOrderEmail(order);

    setSuccessOrder(order);
    onClearCart();
  };

  // If order was successfully completed
  if (successOrder) {
    return (
      <div className="text-center" style={{ maxWidth: '600px', margin: '6rem auto', padding: '0 2rem' }}>
        <CheckCircle size={72} color="#10b981" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
          Order Confirmed!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          Thank you for supporting handcrafted art, <strong>{successOrder.userName}</strong>! We have registered your order 
          <code style={{ background: 'var(--border)', padding: '2px 8px', borderRadius: '4px', margin: '0 5px', fontWeight: 'bold' }}>#{successOrder.id}</code>. 
          We will contact you at <strong>{successOrder.phone}</strong> or send shipping details to <strong>{successOrder.email}</strong> shortly.
        </p>

        <div 
          style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            textAlign: 'left', 
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <h4 style={{ fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            Delivery details:
          </h4>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <strong>Recipient:</strong> {successOrder.userName}
          </p>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <strong>Phone:</strong> {successOrder.phone}
          </p>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <strong>Address:</strong> {successOrder.address}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '1rem' }}>
            Total Payment: ₹{successOrder.total} (Cash on Delivery)
          </p>
        </div>

        <button className="btn-primary" onClick={() => setView('shop')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="text-center" style={{ padding: '8rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Looks like you haven't added any of our cute keychains, hand-crocheted flowers, or One Piece art yet!
        </p>
        <button 
          className="btn-primary" 
          onClick={() => setView('shop')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.85rem 2rem' }}
        >
          <ArrowLeft size={16} />
          <span>Go to Shop</span>
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Cart Items Section */}
      <div className="cart-items-section">
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Your Bag</span>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '12px' }}>
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </h2>

        {cartItems.map(item => (
          <div key={item.product.id} className="cart-item">
            <img src={item.product.image} alt={item.product.title} className="cart-item-img" />
            <div className="cart-item-info">
              <h3 className="cart-item-title">{item.product.title}</h3>
              <p className="cart-item-price">₹{item.product.price}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="cart-qty-ctrl">
                <button 
                  className="qty-btn" 
                  onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-num">{item.quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button 
                onClick={() => onRemoveItem(item.product.id)}
                style={{ color: '#ef4444', padding: '0.5rem', borderRadius: '50%' }}
                aria-label="Remove item"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setView('shop')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--primary)', 
            fontWeight: 'bold',
            marginTop: '1rem',
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to catalog</span>
        </button>
      </div>

      {/* Cart Summary & Billing Panel */}
      <div>
        <div className="cart-summary-panel">
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Billing Summary
          </h3>
          
          <div className="flex-column" style={{ gap: '0.75rem' }}>
            <div className="summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Bag Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Shipping Details</span>
              <span style={{ fontWeight: 600 }}>
                {shipping === 0 ? (
                  <span style={{ color: '#10b981' }}>FREE Shipping</span>
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>
            {shipping > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '-0.25rem', fontWeight: 'bold' }}>
                Add ₹{1000 - subtotal} more for FREE shipping!
              </p>
            )}
            <div className="summary-row summary-total">
              <span>Grand Total</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>₹{total}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Shipping & Customer Details
            </h4>

            {formError && (
              <div 
                style={{ 
                  padding: '0.6rem', 
                  backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                  color: '#ef4444', 
                  borderRadius: '6px', 
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  textAlign: 'center'
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="checkout-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="checkout-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: '2.25rem', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="checkout-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="checkout-email"
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.25rem', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="checkout-phone">Phone Number (For updates)</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="checkout-phone"
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ paddingLeft: '2.25rem', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="checkout-address">House / Street Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  <textarea
                    id="checkout-address"
                    className="form-input"
                    rows={2}
                    placeholder="Door No, Street Name, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ paddingLeft: '2.25rem', fontSize: '0.9rem', resize: 'none' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="checkout-city">City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    className="form-input"
                    placeholder="City Name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="checkout-pincode">Pin Code</label>
                  <input
                    id="checkout-pincode"
                    type="text"
                    className="form-input"
                    placeholder="6 digits"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ fontSize: '0.9rem' }}
                    required
                  />
                </div>
              </div>

              {!currentUser && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                  Checking out as Guest. You can also{' '}
                  <button type="button" onClick={onOpenAuth} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Sign In
                  </button>{' '}
                  to save your orders.
                </p>
              )}

              <button type="submit" className="btn-primary mt-2" style={{ padding: '1rem' }}>
                Place Order (Cash on Delivery)
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
