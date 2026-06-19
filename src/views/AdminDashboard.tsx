import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, FileText, ShoppingBag, DollarSign, Package, TrendingUp, Download, Link, X, Users, Star, Lock } from 'lucide-react';
import { getOrders, getProducts, saveProduct, deleteProduct, updateOrderStatus, getGoogleSheetUrl, setGoogleSheetUrl, syncProducts, getUserSheetUrl, setUserSheetUrl, getUsers, getShippingFee, setShippingFee, getShippingThreshold, setShippingThreshold } from '../data/db';
import type { Product, Order } from '../data/db';
import { sendDelayEmail } from '../data/email';

// List of preloaded local images
const LOCAL_IMAGES = [
  'flower-1.jpeg',
  'flower-2.jpeg',
  'flower-3.jpeg',
  'flower-4.jpeg',
  'flower-5.jpeg',
  'flower-6.jpeg',
  'flower-7.jpeg',
  'flower-8.jpeg',
  'keychain-1.jpeg',
  'keychain-2.jpeg',
  'keychain-3.jpeg',
  'keychain-4.jpeg',
  'keychain-5.jpeg',
  'keychain-6.jpeg',
  'keychain-7.jpeg',
  'keychain-8.jpeg',
  'art-1.jpeg',
  'art-2.jpeg',
  'art-3.jpeg',
  'art-4.jpeg',
  'art-5.jpeg',
  'art-6.jpeg',
  'art-7.jpeg'
];

interface AdminDashboardProps {
  products: Product[];
  onProductsUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products: initialProducts, onProductsUpdated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products' | 'stats'>('orders');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(getOrders());

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'single' | 'bouquet' | 'keychains' | 'accessories'>('single');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'select' | 'url'>('upload');
  const [imageSelect, setImageSelect] = useState(LOCAL_IMAGES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadBase64, setImageUploadBase64] = useState('');
  const [formError, setFormError] = useState('');
  const [sheetUrlInput, setSheetUrlInput] = useState(getGoogleSheetUrl());
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [userSheetUrlInput, setUserSheetUrlInput] = useState(getUserSheetUrl());
  const [showUserScriptModal, setShowUserScriptModal] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => getUsers().filter((u: any) => !u.isAdmin).reverse().slice(0, 15));
  const [shippingFeeInput, setShippingFeeInput] = useState(getShippingFee().toString());
  const [shippingThresholdInput, setShippingThresholdInput] = useState(getShippingThreshold().toString());
  const [isShippingLocked, setIsShippingLocked] = useState(true);

  // Handle local image upload to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUploadBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Product title is required.');
      return;
    }
    
    const parsedPrice = parseFloat(price);
    const parsedOrigPrice = parseFloat(originalPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid selling price greater than 0.');
      return;
    }

    if (isNaN(parsedOrigPrice) || parsedOrigPrice <= parsedPrice) {
      setFormError('Please mention both prices, where the strike price is more and the sale price is less.');
      return;
    }

    // Determine product image path
    let productImg = '';
    if (imageType === 'upload') {
      if (!imageUploadBase64 && !editingId) {
        setFormError('Please upload an image file.');
        return;
      }
      productImg = imageUploadBase64 || (editingId ? products.find(p => p.id === editingId)?.image || '' : '');
    } else if (imageType === 'select') {
      productImg = `/images/${imageSelect}`;
    } else {
      if (!imageUrl.trim()) {
        setFormError('Please enter a valid image URL.');
        return;
      }
      productImg = imageUrl;
    }

    const targetProduct: Product = {
      id: editingId || 'product-' + Date.now(),
      title,
      description: description || `Handcrafted premium ${category} design, made with precision and quality materials.`,
      category,
      price: parsedPrice,
      originalPrice: parsedOrigPrice,
      image: productImg,
      isAvailable: true
    };

    saveProduct(targetProduct).then(() => {
      // Refresh lists
      setProducts(getProducts());
      onProductsUpdated();
      
      // Reset Form
      resetForm();
    });
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice.toString());
    
    if (product.image.startsWith('data:image')) {
      setImageType('upload');
      setImageUploadBase64(product.image);
    } else if (product.image.startsWith('/images/')) {
      setImageType('select');
      const filename = product.image.replace('/images/', '');
      setImageSelect(LOCAL_IMAGES.includes(filename) ? filename : LOCAL_IMAGES[0]);
    } else {
      setImageType('url');
      setImageUrl(product.image);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id).then(() => {
        setProducts(getProducts());
        onProductsUpdated();
      });
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered') => {
    updateOrderStatus(orderId, status);
    setOrders(getOrders());
  };

  const handleSendDelayEmail = async (order: Order) => {
    const success = await sendDelayEmail(order);
    if (success) {
      alert(`Patience/delay email successfully sent to FluffyyyBloomss@gmail.com for order #${order.id}!`);
    } else {
      alert('Failed to send email. Check console logs for details.');
    }
  };

  const handleSaveSheetUrl = async () => {
    setGoogleSheetUrl(sheetUrlInput);
    if (sheetUrlInput) {
      alert("Saving Google Sheets Web App URL! Syncing catalog data from spreadsheet...");
      const synced = await syncProducts();
      setProducts(synced);
      onProductsUpdated();
    } else {
      alert("Cleared Google Sheets Web App URL. Storefront will use local catalog database.");
      setProducts(getProducts());
      onProductsUpdated();
    }
  };

  const handleSaveUserSheetUrl = () => {
    setUserSheetUrl(userSheetUrlInput);
    if (userSheetUrlInput) {
      alert('Customer Data Sheet URL saved! New sign-ups will automatically sync to this sheet.');
    } else {
      alert('Customer Data Sheet URL cleared.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('single');
    setPrice('');
    setOriginalPrice('');
    setImageType('upload');
    setImageUploadBase64('');
    setImageUrl('');
    setFormError('');
  };

  const handleSaveShippingConfig = () => {
    const fee = Number(shippingFeeInput);
    const threshold = Number(shippingThresholdInput);
    if (isNaN(fee) || fee < 0 || isNaN(threshold) || threshold < 0) {
      alert("Please enter valid positive numbers for shipping rates.");
      return false;
    }
    setShippingFee(fee);
    setShippingThreshold(threshold);
    alert("Shipping rates successfully updated!");
    return true;
  };

  const handleToggleFeatured = (product: Product) => {
    const updated = {
      ...product,
      isFeatured: !product.isFeatured
    };
    saveProduct(updated).then(() => {
      setProducts(getProducts());
      onProductsUpdated();
    });
  };

  const handleExportJSON = () => {
    const exportData = products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      isAvailable: p.isAvailable !== false
    }));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "products.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSalesCount = orders.reduce((sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0), 0);
  
  const categorySalesMap = orders.reduce((map: Record<string, number>, o) => {
    o.items.forEach(item => {
      // Find product category if possible, fallback to a simple lookup
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : 'other';
      map[cat] = (map[cat] || 0) + item.quantity;
    });
    return map;
  }, {});

  // Get dynamic current image path for preview
  const getCurrentImagePreview = () => {
    if (imageType === 'upload') {
      return imageUploadBase64 || (editingId ? products.find(p => p.id === editingId)?.image || '' : '');
    } else if (imageType === 'select') {
      return `/images/${imageSelect}`;
    } else {
      return imageUrl;
    }
  };

  return (
    <div className="admin-layout">
      {/* Dashboard Top Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Store inventory, orders, and sales performance analytics.
          </p>
        </div>

        <div className="admin-nav-tabs">
          <button
            className={`admin-tab ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            Orders Queue ({Math.min(orders.length, 15)})
          </button>
          <button
            className={`admin-tab ${activeSubTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('products')}
          >
            Manage Products
          </button>
          <button
            className={`admin-tab ${activeSubTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('stats')}
          >
            Overview & Stats
          </button>
        </div>
      </div>

      {/* Orders Manager */}
      {activeSubTab === 'orders' && (
        <div className="admin-content-card">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} />
            <span>Customer Orders Queue</span>
          </h2>

          {orders.length > 0 ? (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Info</th>
                    <th>Customer Contact</th>
                    <th>Delivery Address</th>
                    <th>Ordered Items</th>
                    <th>Grand Total</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 15).map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>#{order.id}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}</span>
                      </td>
                      <td>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>{order.userName}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>{order.email}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.phone}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '200px', lineHeight: '1.4' }}>
                        {order.address}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} 
                              />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                {item.title}
                              </span>
                              <strong style={{ color: 'var(--text-muted)' }}>x{item.quantity}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{order.total}</strong>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>
                            {order.paymentMethod === 'UPI' ? '💳 UPI Pay' : '💵 Cash COD'}
                          </span>
                          <span style={{ 
                            color: order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b',
                            fontWeight: '600'
                          }}>
                            {order.paymentStatus === 'Paid' ? 'Paid' : 'COD Unpaid'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                          <select
                            className="form-input"
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', width: 'auto', border: '1px solid var(--border)' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => handleSendDelayEmail(order)}
                            style={{
                              marginTop: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: '#8b5cf6',
                              border: '1px dashed #8b5cf6',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              background: 'transparent',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Encourage Patience Mail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Package size={48} style={{ marginBottom: '1rem' }} />
              <p>No orders have been placed yet. Share your storefront link with friends!</p>
            </div>
          )}
        </div>
      )}

      {/* Product Manager */}
      {activeSubTab === 'products' && (
        <div className="admin-grid">
          {/* Form to Add/Edit Product */}
          <div className="admin-content-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              <span>{editingId ? 'Edit Product' : 'Add New Product'}</span>
            </h2>

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

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="prod-title">Product Name</label>
                <input
                  id="prod-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lavender Flower Bouquet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  className="form-input"
                  rows={2}
                  placeholder="Write details about materials, knit style, color options..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prod-category">Category</label>
                  <select
                    id="prod-category"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="single">Single Flower</option>
                    <option value="bouquet">Flower Bouquet</option>
                    <option value="keychains">Keychains</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Pricing Tactics</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '-0.3rem', marginBottom: '0.3rem' }}>
                    Strike price &gt; Sale price
                  </span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prod-original-price">Strike Price (₹)</label>
                  <input
                    id="prod-original-price"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 999"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prod-price">Sale Price (₹)</label>
                  <input
                    id="prod-price"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Image Source</label>
                <div className="tab-btn-group">
                  <button
                    type="button"
                    className={`tab-btn ${imageType === 'upload' ? 'active' : ''}`}
                    onClick={() => setImageType('upload')}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${imageType === 'select' ? 'active' : ''}`}
                    onClick={() => setImageType('select')}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Local Image
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${imageType === 'url' ? 'active' : ''}`}
                    onClick={() => setImageType('url')}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Web URL
                  </button>
                </div>

                {imageType === 'upload' && (
                  <div className="upload-container" style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Drag & Drop or Click to select image
                    </p>
                  </div>
                )}

                {imageType === 'select' && (
                  <div className="flex-column" style={{ gap: '0.5rem' }}>
                    <select
                      className="form-input"
                      value={imageSelect}
                      onChange={(e) => setImageSelect(e.target.value)}
                    >
                      {LOCAL_IMAGES.map((img, idx) => (
                        <option key={idx} value={img}>{img}</option>
                      ))}
                    </select>
                  </div>
                )}

                {imageType === 'url' && (
                  <div className="flex-column" style={{ gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                )}

                {/* Unified Image Preview */}
                {getCurrentImagePreview() && (
                  <div className="flex-column" style={{ gap: '0.4rem', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Selected Image Preview:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={getCurrentImagePreview()} 
                        alt="Selected Preview" 
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                        onError={(e) => { 
                          if (imageType === 'url') {
                            (e.target as any).src = 'https://placehold.co/150?text=Invalid+URL'; 
                          } else {
                            (e.target as any).src = 'https://placehold.co/150?text=No+Image'; 
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all', maxWidth: '240px' }}>
                        {imageType === 'upload' ? 'Uploaded Base64 Data' : getCurrentImagePreview()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                  {editingId ? 'Save Changes' : 'Publish Product'}
                </button>
                {editingId && (
                  <button type="button" className="tab-btn" onClick={resetForm} style={{ margin: 0 }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Products */}
          <div className="admin-content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Package size={20} />
                <span>Catalog List ({products.length})</span>
              </h2>
              <button 
                onClick={handleExportJSON}
                className="tab-btn" 
                style={{ 
                  margin: 0, 
                  fontSize: '0.82rem', 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontWeight: 'bold'
                }}
                title="Download updated products.json for Git commit"
              >
                <Download size={14} />
                <span>Export products.json</span>
              </button>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product details</th>
                    <th>Category</th>
                    <th>Pricing</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id} style={{ opacity: prod.isAvailable ? 1 : 0.5 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={prod.image} 
                            alt={prod.title} 
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{prod.title}</strong>
                            <span 
                              style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--text-muted)', 
                                display: 'inline-block',
                                maxWidth: '180px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {prod.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>
                          {prod.category}
                        </span>
                      </td>
                      <td>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>₹{prod.price}</strong>
                        {prod.originalPrice > prod.price && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{prod.originalPrice}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(prod)}
                            style={{ 
                              color: prod.isFeatured ? '#f59e0b' : 'var(--text-muted)', 
                              padding: '0.4rem', 
                              border: '1px solid var(--border)', 
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent'
                            }}
                            title={prod.isFeatured ? "Starred (Featured Bestseller)" : "Star (Feature on Home Page)"}
                          >
                            <Star size={14} fill={prod.isFeatured ? "#f59e0b" : "none"} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(prod)}
                            style={{ color: 'var(--text-main)', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            style={{ color: '#ef4444', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SECTION 3: Shipping Fees & Offers Configuration ── */}
          <div className="admin-content-card admin-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: '#10b981' }} />
              <span>🚚 Shipping Rates & Offers Configuration</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Configure the shipping fees charged to customers, and define the threshold amount above which shipping is completely free.
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Default Shipping Fee (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50"
                  value={shippingFeeInput}
                  onChange={(e) => setShippingFeeInput(e.target.value)}
                  style={{ fontSize: '0.9rem', opacity: isShippingLocked ? 0.6 : 1 }}
                  disabled={isShippingLocked}
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Free Shipping Min Order Threshold (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1000"
                  value={shippingThresholdInput}
                  onChange={(e) => setShippingThresholdInput(e.target.value)}
                  style={{ fontSize: '0.9rem', opacity: isShippingLocked ? 0.6 : 1 }}
                  disabled={isShippingLocked}
                />
              </div>
              {isShippingLocked && (
                <button
                  type="button"
                  onClick={() => setIsShippingLocked(false)}
                  style={{
                    width: 'auto',
                    padding: '0.75rem 1rem',
                    height: 'fit-content',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  title="Edit shipping rates"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (handleSaveShippingConfig()) {
                    setIsShippingLocked(true);
                  }
                }}
                disabled={isShippingLocked}
                className="btn-primary"
                style={{
                  width: 'auto',
                  padding: '0.75rem 1.5rem',
                  height: 'fit-content',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isShippingLocked ? '#9ca3af' : '#10b981',
                  boxShadow: isShippingLocked ? 'none' : '0 4px 12px rgba(16,185,129,0.25)',
                  cursor: isShippingLocked ? 'not-allowed' : 'pointer',
                  opacity: isShippingLocked ? 0.6 : 1,
                  color: '#ffffff'
                }}
              >
                <Lock size={14} />
                <span>Save the discount input</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Stats Tab */}
      {activeSubTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Analytics Summary Row */}
          <div className="analytics-grid">
            <div className="stat-card">
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} style={{ color: 'var(--accent)' }} />
                <span className="stat-val">₹{totalRevenue}</span>
              </div>
            </div>

            <div className="stat-card">
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>TOTAL ORDERS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
                <span className="stat-val">{orders.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>ITEMS SOLD</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: '#10b981' }} />
                <span className="stat-val">{totalSalesCount}</span>
              </div>
            </div>
          </div>

          {/* Detailed stats grids */}
          <div className="admin-stats-grid">
            {/* Category Split */}
            <div className="admin-content-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Sales by Category (Items Sold)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['single', 'bouquet', 'keychains', 'accessories'].map(cat => {
                  const count = categorySalesMap[cat] || 0;
                  const percent = totalSalesCount > 0 ? Math.round((count / totalSalesCount) * 100) : 0;
                  
                  const getProgressBarColor = (c: string) => {
                    switch (c) {
                      case 'single': return '#ec4899';
                      case 'bouquet': return '#f43f5e';
                      case 'keychains': return '#8b5cf6';
                      case 'accessories': return '#d28c2e';
                      default: return 'var(--primary)';
                    }
                  };

                  const getDisplayName = (c: string) => {
                    switch (c) {
                      case 'single': return 'Single Flower';
                      case 'bouquet': return 'Flower Bouquet';
                      case 'keychains': return 'Keychains';
                      case 'accessories': return 'Accessories';
                      default: return c;
                    }
                  };

                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{getDisplayName(cat)}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} items ({percent}%)</span>
                      </div>
                      <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            background: getProgressBarColor(cat), 
                            height: '100%', 
                            width: `${percent}%`,
                            borderRadius: '4px'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Profile */}
            <div className="admin-content-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Store Credentials & Status
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                You are currently logged into the FluffyyyBloomss local admin workspace. Changes to pricing, details, and products are stored in 
                the local database and loaded directly into the web application client.
              </p>
              <div style={{ padding: '0.75rem', background: 'var(--bg-store)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ display: 'block', marginBottom: '0.25rem' }}><strong>Environment:</strong> Development</span>
                <span style={{ display: 'block', marginBottom: '0.25rem' }}><strong>Storage System:</strong> HTML5 Web LocalStorage</span>
                <span><strong>Role:</strong> Administrator</span>
              </div>
            </div>

            {/* ── SECTION 1: Product Inventory Sheet ── */}
            <div className="admin-content-card admin-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link size={18} style={{ color: 'var(--primary)' }} />
                <span>📦 Product Inventory — Google Sheets Sync</span>
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Link a Google Sheet to your product catalog. Once connected, every product you add, edit, or delete in the Admin Dashboard is
                automatically saved to the Sheet — and you can also edit products directly in the Sheet and sync them back here.
                <strong style={{ color: 'var(--text-main)' }}> This prevents any data loss</strong> — the Sheet acts as a permanent backup of your store.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flexGrow: 1, minWidth: '300px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Product Sheet — Web App URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>
                <button onClick={handleSaveSheetUrl} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', height: 'fit-content' }}>
                  Save Connection
                </button>
              </div>

              {/* Detailed setup guide */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-store)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.75' }}>
                <strong style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>📋 Step-by-Step Setup Guide (Product Sheet):</strong>
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Create a new Google Sheet.</strong>{' '}
                    Go to <a href="https://sheets.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>sheets.google.com</a>, click
                    <strong> + Blank</strong>. Name it <code style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: '4px' }}>FluffyyyBloomss Inventory</code>.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Add the exact column headers in Row 1.</strong>{' '}
                    Click cell A1 and type each header exactly as shown, one per column (A→H):
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['id','title','description','category','price','originalPrice','image','isAvailable'].map(h => (
                        <code key={h} style={{ background: 'var(--border)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 'bold' }}>{h}</code>
                      ))}
                    </div>
                    <span style={{ display: 'block', marginTop: '4px', fontSize: '0.8rem' }}>⚠️ Spelling must be exact — lowercase, no spaces. The app reads these column names directly.</span>
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Open the Apps Script editor.</strong>{' '}
                    In your Google Sheet, click the top menu: <strong>Extensions → Apps Script</strong>. A new tab opens with a code editor.
                    Delete all existing code in the editor completely.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Paste the integration code.</strong>{' '}
                    Click the button below to see the code, copy it fully, and paste it into the Apps Script editor.
                    Then click the 💾 <strong>Save</strong> icon (or Ctrl+S).
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Deploy as a Web App.</strong>{' '}
                    Click <strong>Deploy → New Deployment</strong>. In the dialog:
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Click the gear ⚙️ icon next to "Select type" → choose <strong>Web App</strong></li>
                      <li>Description: <code style={{ background: 'var(--border)', padding: '1px 5px', borderRadius: '4px' }}>FluffyyyBloomss Inventory</code></li>
                      <li>"Execute as": set to <strong>Me (your Google account)</strong></li>
                      <li>"Who has access": set to <strong>Anyone</strong></li>
                    </ul>
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Authorize and copy the URL.</strong>{' '}
                    Click <strong>Deploy</strong>. Google will ask to authorize — click <strong>Authorize access</strong> and sign in.
                    After authorization, a popup shows your <strong>Web App URL</strong> (starts with <code>https://script.google.com/macros/s/...</code>).
                    Copy that URL.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Paste the URL above and click Save Connection.</strong>{' '}
                    Your product catalog is now permanently backed up. Every time you add or edit a product here, it syncs to the Sheet automatically.
                  </li>
                </ol>
                <button
                  onClick={() => setShowScriptModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  📄 Click here to view &amp; copy the Product Sheet Apps Script Code
                </button>
              </div>
            </div>

            {/* ── SECTION 2: Customer Data Sheet ── */}
            <div className="admin-content-card admin-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '2px solid var(--border)', paddingTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: '#8b5cf6' }} />
                <span>👥 Customer Data — Google Sheets Sync</span>
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                A <strong style={{ color: 'var(--text-main)' }}>separate Sheet</strong> that automatically records every customer who signs up on your store — name, email, and registration date.
                You can use this sheet to send bulk emails, promotional campaigns, or follow-up messages directly from Google Sheets.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flexGrow: 1, minWidth: '300px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer Sheet — Web App URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={userSheetUrlInput}
                    onChange={(e) => setUserSheetUrlInput(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>
                <button onClick={handleSaveUserSheetUrl} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', height: 'fit-content', background: '#8b5cf6', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}>
                  Save Customer Sheet
                </button>
              </div>

              {/* Detailed setup guide */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-store)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.75' }}>
                <strong style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>📋 Step-by-Step Setup Guide (Customer Sheet):</strong>
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Create a new (separate) Google Sheet.</strong>{' '}
                    Do NOT use the same sheet as Products. Go to sheets.google.com → <strong>+ Blank</strong>.
                    Name it <code style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: '4px' }}>FluffyyyBloomss Customers</code>.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Add these exact headers in Row 1 (A→D):</strong>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['id','name','email','registeredAt'].map(h => (
                        <code key={h} style={{ background: 'var(--border)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-main)', fontWeight: 'bold' }}>{h}</code>
                      ))}
                    </div>
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Open Apps Script and paste the Customer Sheet code.</strong>{' '}
                    Click <strong>Extensions → Apps Script</strong>, delete existing code, paste the customer script, and save.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Deploy as a Web App</strong> (same steps as the Product Sheet — Execute as Me, Anyone can access).
                    Copy the Web App URL.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--text-main)' }}>Paste the URL above and click Save Customer Sheet.</strong>{' '}
                    From now on, every new customer who signs up on your store will be automatically added to this Sheet — ready for email campaigns!
                  </li>
                </ol>
                <button
                  onClick={() => setShowUserScriptModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontWeight: 'bold', color: '#8b5cf6', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  📄 Click here to view &amp; copy the Customer Sheet Apps Script Code
                </button>
              </div>

              {/* Live registered user table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Registered Customers ({registeredUsers.length})</h4>
                  <button
                    onClick={() => setRegisteredUsers(getUsers().filter((u: any) => !u.isAdmin).reverse().slice(0, 15))}
                    className="tab-btn"
                    style={{ margin: 0, fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                  >
                    Refresh
                  </button>
                </div>
                {registeredUsers.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.map((u: any) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td style={{ color: 'var(--primary)', fontSize: '0.88rem' }}>{u.email}</td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.registeredAt || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-store)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.9rem' }}>No customers have signed up yet. Once they do, they'll appear here.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Google Apps Script Modal */}
      {showScriptModal && (
        <div className="modal-overlay" onClick={() => setShowScriptModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowScriptModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-body">
              <h2 className="modal-title">Google Apps Script Integration Code</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Copy the code below, paste it into the script editor of your Google Sheet, and deploy it as a Web App:
              </p>
              <pre 
                style={{ 
                  background: 'var(--bg-store)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  overflow: 'auto', 
                  maxHeight: '350px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
{`function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var action = payload.action;
  
  if (action === 'save') {
    var product = payload.product;
    var data = sheet.getDataRange().getValues();
    var foundRowIndex = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(product.id)) {
        foundRowIndex = i + 1; // 1-based index + headers
        break;
      }
    }
    
    var rowValues = [
      product.id,
      product.title,
      product.description,
      product.category,
      product.price,
      product.originalPrice,
      product.image,
      product.isAvailable
    ];
    
    if (foundRowIndex !== -1) {
      sheet.getRange(foundRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } else if (action === 'delete') {
    var id = payload.id;
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
              </pre>
              <button className="btn-primary mt-4" onClick={() => setShowScriptModal(false)}>
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Data Sheet Apps Script Modal */}
      {showUserScriptModal && (
        <div className="modal-overlay" onClick={() => setShowUserScriptModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUserScriptModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-body">
              <h2 className="modal-title">Customer Sheet — Apps Script Code</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Copy this code into the Apps Script editor of your <strong>FluffyyyBloomss Customers</strong> Google Sheet and deploy it as a Web App:
              </p>
              <pre
                style={{
                  background: 'var(--bg-store)',
                  padding: '1rem',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '350px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var action = payload.action;

  if (action === 'saveUser') {
    var user = payload.user;
    var data = sheet.getDataRange().getValues();
    var foundRow = -1;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(user.id)) {
        foundRow = i + 1;
        break;
      }
    }

    var rowValues = [
      user.id,
      user.name,
      user.email,
      user.registeredAt
    ];

    if (foundRow !== -1) {
      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}`}
              </pre>
              <button className="btn-primary mt-4" style={{ background: '#8b5cf6' }} onClick={() => setShowUserScriptModal(false)}>
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
