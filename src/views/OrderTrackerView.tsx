import React, { useState } from 'react';
import { Search, MapPin, Package, Check, Clipboard, Calendar } from 'lucide-react';
import { getOrders } from '../data/db';
import type { Order } from '../data/db';

export const OrderTrackerView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchingOrders, setMatchingOrders] = useState<Order[]>([]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    
    if (!query.trim()) {
      setMatchingOrders([]);
      return;
    }

    const allOrders = getOrders();
    const cleanQuery = query.trim().toLowerCase();

    // Match either by order reference ID (exact) or phone number (exact match)
    const matches = allOrders.filter(order => 
      order.id.toLowerCase() === cleanQuery || 
      order.id.toLowerCase() === `order-${cleanQuery}` ||
      order.phone.replace(/\D/g, '') === cleanQuery.replace(/\D/g, '')
    );

    setMatchingOrders(matches);
  };

  const getStatusStep = (status: 'Pending' | 'Shipped' | 'Delivered') => {
    switch (status) {
      case 'Pending': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 1;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto 6rem', padding: '0 2rem' }}>
      
      {/* 1. Header description */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Track Your Order</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Enter the Order Reference ID or Phone Number used during checkout to monitor dispatch status.
        </p>
      </div>

      {/* 2. Track form */}
      <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '280px' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            className="form-input"
            placeholder="e.g. order-245678 or 10-digit phone number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem', paddingRight: '1rem', borderRadius: '30px', fontSize: '1rem', height: '3.2rem' }}
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: 'auto', padding: '0 2.5rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', height: '3.2rem' }}
        >
          Track Progress
        </button>
      </form>

      {/* 3. Tracking Results */}
      {searched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {matchingOrders.length > 0 ? (
            matchingOrders.map(order => {
              const currentStep = getStatusStep(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="admin-content-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                  
                  {/* Result Header */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '1rem',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '1.25rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Order Reference
                      </span>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>#{order.id}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Placed Date</span>
                      <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        {order.date}
                      </strong>
                    </div>
                  </div>

                  {/* Stepper progress bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '1rem 0' }}>
                    {/* Background Progress bar line */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '18px', 
                        left: '10%', 
                        right: '10%', 
                        height: '4px', 
                        background: 'var(--border)', 
                        zIndex: 0 
                      }} 
                    />
                    
                    {/* Active Progress bar line */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '18px', 
                        left: '10%', 
                        width: currentStep === 1 ? '0%' : currentStep === 2 ? '40%' : '80%', 
                        height: '4px', 
                        background: 'var(--primary)', 
                        transition: 'width 0.5s ease-in-out',
                        zIndex: 0 
                      }} 
                    />

                    {/* Step 1: Received */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '30%' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: currentStep >= 1 ? 'var(--primary)' : 'var(--bg-store)', 
                          border: `2px solid ${currentStep >= 1 ? 'var(--primary)' : 'var(--border)'}`,
                          color: currentStep >= 1 ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}
                      >
                        {currentStep >= 1 ? <Check size={18} /> : '1'}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: currentStep >= 1 ? 'bold' : 'normal', textAlign: 'center' }}>
                        Order Received
                      </span>
                    </div>

                    {/* Step 2: Dispatched */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '30%' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: currentStep >= 2 ? 'var(--primary)' : 'var(--bg-card)', 
                          border: `2px solid ${currentStep >= 2 ? 'var(--primary)' : 'var(--border)'}`,
                          color: currentStep >= 2 ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}
                      >
                        {currentStep >= 2 ? <Check size={18} /> : '2'}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: currentStep >= 2 ? 'bold' : 'normal', textAlign: 'center' }}>
                        Dispatched
                      </span>
                    </div>

                    {/* Step 3: Arrived */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '30%' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: currentStep >= 3 ? 'var(--primary)' : 'var(--bg-card)', 
                          border: `2px solid ${currentStep >= 3 ? 'var(--primary)' : 'var(--border)'}`,
                          color: currentStep >= 3 ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}
                      >
                        {currentStep >= 3 ? <Check size={18} /> : '3'}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: currentStep >= 3 ? 'bold' : 'normal', textAlign: 'center' }}>
                        Delivered
                      </span>
                    </div>
                  </div>

                  {/* Summary row details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    
                    {/* Left details - reciepent & address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <MapPin size={16} />
                        <span>Delivery Address</span>
                      </h4>
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.25rem' }}>{order.userName}</strong>
                        <span>{order.address}</span>
                        <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Phone: {order.phone}</span>
                      </div>
                    </div>

                    {/* Right details - items summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <Package size={16} />
                        <span>Order Summary</span>
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img src={item.image} alt={item.title} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                              <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                              <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                            </div>
                            <strong>₹{item.price * item.quantity}</strong>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontWeight: 'bold', marginTop: '0.25rem', fontSize: '1rem' }}>
                          <span>Total Paid:</span>
                          <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>Method: Cash on Delivery</span>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          ) : (
            <div className="admin-content-card text-center" style={{ padding: '3rem 2rem', color: 'var(--text-muted)' }}>
              <Clipboard size={48} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                No Orders Found
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                We couldn't find any orders matching <strong>"{query}"</strong>. Double-check your 6-digit Order ID or 10-digit Phone Number.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default OrderTrackerView;
