import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, FileText, ShoppingBag, DollarSign, Package, TrendingUp, Download, Link, X } from 'lucide-react';
import { getOrders, getProducts, saveProduct, deleteProduct, updateOrderStatus, getGoogleSheetUrl, setGoogleSheetUrl, syncProducts } from '../data/db';
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
  const [category, setCategory] = useState<'flowers' | 'keychains' | 'art'>('flowers');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageType, setImageType] = useState<'upload' | 'select' | 'url'>('upload');
  const [imageSelect, setImageSelect] = useState(LOCAL_IMAGES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploadBase64, setImageUploadBase64] = useState('');
  const [formError, setFormError] = useState('');
  const [sheetUrlInput, setSheetUrlInput] = useState(getGoogleSheetUrl());
  const [showScriptModal, setShowScriptModal] = useState(false);

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

    if (isNaN(parsedOrigPrice) || parsedOrigPrice < parsedPrice) {
      setFormError('Original (strike) price must be equal to or greater than the sale price.');
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
      alert(`Patience/delay email successfully sent to yeshwanthkg@gmail.com for order #${order.id}!`);
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

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('flowers');
    setPrice('');
    setOriginalPrice('');
    setImageType('upload');
    setImageUploadBase64('');
    setImageUrl('');
    setFormError('');
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
            Orders List ({orders.length})
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
                  {orders.map(order => (
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
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
                  placeholder="e.g. Lavender Crochet Bouquet"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="prod-category">Category</label>
                  <select
                    id="prod-category"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="flowers">Crochet Flowers</option>
                    <option value="keychains">Cute Keychains</option>
                    <option value="art">One Piece Art</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Pricing Tactics</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '-0.3rem', marginBottom: '0.3rem' }}>
                    Strike price &gt; Sale price
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleStartEdit(prod)}
                            style={{ color: 'var(--text-main)', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Category Split */}
            <div className="admin-content-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Sales by Category (Items Sold)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['flowers', 'keychains', 'art'].map(cat => {
                  const count = categorySalesMap[cat] || 0;
                  const percent = totalSalesCount > 0 ? Math.round((count / totalSalesCount) * 100) : 0;
                  
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{cat}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} items ({percent}%)</span>
                      </div>
                      <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            background: cat === 'flowers' ? '#ec4899' : cat === 'keychains' ? '#8b5cf6' : '#ef4444', 
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

            {/* Google Sheets Synchronization Settings */}
            <div className="admin-content-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link size={18} style={{ color: 'var(--primary)' }} />
                <span>Google Sheets Database Sync Settings</span>
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Connect your storefront catalog to a Google Sheet. Once connected, your friend can add or edit products directly from their phone's Google Sheets app, and updates will automatically sync to customers!
              </p>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <div style={{ flexGrow: 1, minWidth: '300px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Google Web App URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>
                <button
                  onClick={handleSaveSheetUrl}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0.75rem 1.5rem', height: 'fit-content' }}
                >
                  Save Connection
                </button>
              </div>

              {/* Step by step Help instructions */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-store)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>📋 Step-by-Step Google Sheets Setup Guide:</strong>
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <li>Create a new Google Sheet named <code>FluffyyyBloomss Inventory</code>.</li>
                  <li>In the first row, set the exact column headers: <br/>
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)' }}>id</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>title</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>description</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>category</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>price</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>originalPrice</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>image</code>, 
                    <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', marginLeft: '4px' }}>isAvailable</code>
                  </li>
                  <li>Click <strong>Extensions &gt; Apps Script</strong>. Delete any code, and paste our Apps Script integration code.</li>
                  <li>Click <strong>Deploy &gt; New Deployment</strong>. Select <strong>Web App</strong>. Set "Execute as" to <strong>Me</strong> and "Who has access" to <strong>Anyone</strong>.</li>
                  <li>Click <strong>Deploy</strong>, authorize permissions, copy the <strong>Web App URL</strong>, and paste it in the settings box above!</li>
                </ol>
                <button 
                  onClick={() => setShowScriptModal(true)} 
                  style={{ display: 'block', marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Click here to view Google Apps Script Code to copy
                </button>
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
    </div>
  );
};
