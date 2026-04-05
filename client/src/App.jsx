import { useState, useEffect, useCallback } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Toast Notification System ────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast };
}

// ─── Star Rating Component ─────────────────────────────────────
function StarRating({ rating }) {
  const stars = '★★★★★☆☆☆☆☆';
  const full = Math.round(rating);
  return <span className="stars">{stars.slice(5 - full, 10 - full)}</span>;
}

// ─── Auth Page ─────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      localStorage.setItem('token', data.token);
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🐾</span>
          <h1>Pawfect FurEver</h1>
          <p className="auth-subtitle">Your pet&apos;s favourite online store</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Create Account
          </button>
        </div>

        {error && (
          <div className="toast toast-error" style={{ marginBottom: '1rem', animation: 'none' }}>
            <span>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="register-name" className="form-input" type="text" placeholder="e.g. Jane Smith" value={form.name} onChange={update('name')} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="auth-email" className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="auth-password" className="form-input" type="password" placeholder={tab === 'register' ? 'At least 6 characters' : 'Your password'} value={form.password} onChange={update('password')} required />
          </div>
          <button id="auth-submit" className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? '...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Pet Onboarding ────────────────────────────────────────────
function PetOnboarding({ token, onComplete }) {
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(false);

  const petOptions = [
    { value: 'dog', emoji: '🐕', label: 'Dog' },
    { value: 'cat', emoji: '🐈', label: 'Cat' },
    { value: 'bird', emoji: '🐦', label: 'Bird' },
    { value: 'fish', emoji: '🐟', label: 'Fish' },
    { value: 'rabbit', emoji: '🐇', label: 'Rabbit' },
    { value: 'hamster', emoji: '🐹', label: 'Hamster' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!petType) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/pet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ petType, petBreed, petName })
      });
      const data = await res.json();
      if (res.ok) onComplete(data.petProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            {petType ? petOptions.find(p => p.value === petType)?.emoji : '🐾'}
          </div>
          <h2>Tell us about your pet!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            <p>We need a little info to tailor your pet&apos;s experience</p> just for them
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">What type of pet do you have?</label>
            <div className="pet-type-grid">
              {petOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`pet-type-option ${petType === opt.value ? 'selected' : ''}`}
                  onClick={() => setPetType(opt.value)}
                >
                  <span className="pet-emoji">{opt.emoji}</span>
                  <span className="pet-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pet&apos;s Name (optional)</label>
            <input id="pet-name" className="form-input" type="text" placeholder="e.g. Buddy, Whiskers" value={petName} onChange={e => setPetName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Breed</label>
            <input id="pet-breed" className="form-input" type="text" placeholder="e.g. Golden Retriever, Persian" value={petBreed} onChange={e => setPetBreed(e.target.value)} required />
          </div>

          <button id="pet-submit" className="btn btn-primary btn-full" type="submit" disabled={!petType || loading}>
            {loading ? 'Saving...' : 'Start Shopping →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onWishlist, inWishlist }) {
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
        />
        {discount > 0 && <span className="product-badge badge-sale">-{discount}%</span>}
        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={() => onWishlist(product.id)}
          title="Wishlist"
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-rating">
          <StarRating rating={product.rating} />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
          <span style={{ marginLeft: 'auto', color: product.stock < 10 ? 'var(--danger)' : 'var(--text-muted)' }}>
            {product.stock < 10 ? `Only ${product.stock} left!` : `In stock`}
          </span>
        </div>

        <div className="product-footer">
          <div className="price-group">
            <span className="price-current">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="price-compare">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <button
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products View ─────────────────────────────────────────────
function ProductsView({ petProfile, onAddToCart, wishlist, onWishlist }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [petFilter, setPetFilter] = useState(petProfile?.petType || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('');

  const petEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐇', hamster: '🐹' };
  const categories = ['food', 'toys', 'accessories', 'bedding', 'training', 'tech', 'housing'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (petFilter) params.append('petType', petFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);

      const res = await fetch(`${API_URL}/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [petFilter, categoryFilter, search, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const petTypes = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster'];

  return (
    <div className="page">
      {petProfile && (
        <div className="hero-banner">
          <div className="hero-text">
            <h2>
              {petProfile.petName
                ? `Shopping for ${petProfile.petName} 🐾`
                : `Perfect picks for your ${petProfile.petType}!`}
            </h2>
            <p>
              Personalised recommendations for your {petProfile.petBreed}. 
              Browse our curated selection of premium products.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <span className="tag">Breed: {petProfile.petBreed}</span>
              <span className="tag">Type: {petProfile.petType}</span>
            </div>
          </div>
          <div className="hero-emoji">{petEmojis[petProfile.petType] || '🐾'}</div>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            id="product-search"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {petTypes.map(pt => (
          <button
            key={pt}
            className={`filter-chip ${petFilter === pt ? 'active' : ''}`}
            onClick={() => setPetFilter(petFilter === pt ? '' : pt)}
          >
            {petEmojis[pt]} {pt}
          </button>
        ))}

        <select
          id="sort-select"
          className="form-input"
          style={{ width: 'auto', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
            style={{ textTransform: 'capitalize' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="products-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: '200px', borderRadius: 0 }} />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                <div className="skeleton" style={{ height: '18px', width: '80%' }} />
                <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                <div className="skeleton" style={{ height: '36px', marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search term</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setPetFilter(''); setCategoryFilter(''); setSort(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Showing {products.length} products
          </div>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                inWishlist={wishlist.includes(product.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Cart View ─────────────────────────────────────────────────
function CartView({ cart, onUpdate, onRemove, token, onOrderPlaced }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 9.99) : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const items = cart.map(item => ({ ...item, quantity: item.qty }));
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, total })
      });
      const data = await res.json();
      if (res.ok) {
        onOrderPlaced();
        addToast('Order placed successfully! 🎉', 'success');
      } else {
        addToast(data.error || 'Checkout failed', 'error');
      }
    } catch {
      addToast('Network error during checkout', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page cart-wrapper">
        <h2 style={{ marginBottom: '1.5rem' }}>Shopping Cart</h2>
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Add some pawsome products to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h2>Shopping Cart</h2>
          <span className="page-subtitle">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <img
            className="cart-item-img"
            src={item.image}
            alt={item.name}
            onError={e => { e.target.src = 'https://via.placeholder.com/70'; }}
          />
          <div className="cart-item-info">
            <div className="cart-item-name">{item.name}</div>
            <div className="cart-item-meta">{item.brand} · {item.category}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '4px 8px' }}>
              <button className="btn-ghost" style={{ padding: '0 0.4rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', background: 'transparent' }} onClick={() => onUpdate(item.id, -1)}>−</button>
              <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
              <button className="btn-ghost" style={{ padding: '0 0.4rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', background: 'transparent' }} onClick={() => onUpdate(item.id, 1)}>+</button>
            </div>
            <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
            <button className="btn btn-danger btn-xs" onClick={() => onRemove(item.id)}>✕</button>
          </div>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Shipping</span>
          <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
            {shipping === 0 ? 'FREE 🎉' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        {subtotal > 0 && subtotal < 50 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.5rem 0', borderTop: '1px dashed var(--border)' }}>
            💡 Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </div>
        )}
        <div className="cart-summary-row total">
          <span>Total</span>
          <span style={{ color: 'var(--primary-light)' }}>${total.toFixed(2)}</span>
        </div>
        <button
          id="checkout-btn"
          className="btn btn-success btn-full"
          style={{ marginTop: '1rem' }}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Checkout · $${total.toFixed(2)} →`}
        </button>
      </div>
    </div>
  );
}

// ─── Orders View ───────────────────────────────────────────────
function OrdersView({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const statusClass = (status) => {
    const map = { pending: 'status-pending', confirmed: 'status-confirmed', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled' };
    return map[status] || 'status-pending';
  };

  if (loading) return <div className="page"><div className="spinner" style={{ margin: '4rem auto' }} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h2>My Orders</h2>
          <span className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} total</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your orders will appear here once you make a purchase</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <span className="order-id">Order #{order.id}</span>
                <div className="order-date" style={{ marginTop: '0.25rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
              <span className={`order-status ${statusClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="order-items-preview">
              {order.items.slice(0, 4).map((item, i) => (
                <img
                  key={i}
                  className="order-item-thumb"
                  src={item.image || 'https://via.placeholder.com/50'}
                  alt={item.name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/50'; }}
                  title={item.name}
                />
              ))}
              {order.items.length > 4 && (
                <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  +{order.items.length - 4}
                </div>
              )}
            </div>

            <div className="order-footer">
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="order-total">${order.total.toFixed(2)}</div>
            </div>

            {order.estimatedDelivery && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                📅 Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [, setUser] = useState(null);
  const [petProfile, setPetProfile] = useState(null);
  const [view, setView] = useState('products');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [appReady, setAppReady] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Boot: validate token and load user data
  useEffect(() => {
    const boot = async () => {
      if (!token) { setAppReady(true); return; }
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Token invalid');
        const data = await res.json();
        setUser(data.user);

        const profileRes = await fetch(`${API_URL}/api/profile/pet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setPetProfile(profileData.petProfile);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setAppReady(true);
      }
    };
    boot();
  }, [token]);

  const handleAuth = (token, user) => {
    setToken(token);
    setUser(user);
    if (user.petProfile) {
      setPetProfile(user.petProfile);
    }
  };

  const handlePetComplete = (profile) => {
    setPetProfile(profile);
    addToast(`Profile saved for your ${profile.petType}! 🐾`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPetProfile(null);
    setCart([]);
    setWishlist([]);
    setView('products');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        addToast(`${product.name} quantity updated`, 'info');
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      addToast(`${product.name} added to cart!`, 'success');
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;
      if (item.qty + delta <= 0) return prev.filter(i => i.id !== productId);
      return prev.map(i => i.id === productId ? { ...i, qty: i.qty + delta } : i);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
    addToast('Item removed from cart', 'info');
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        addToast('Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      }
      addToast('Added to wishlist ❤️', 'success');
      return [...prev, productId];
    });
  };

  const handleOrderPlaced = () => {
    setCart([]);
    setView('orders');
  };

  if (!appReady) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Pawfect FurEver...</p>
      </div>
    );
  }

  if (!token) return <AuthPage onAuth={handleAuth} />;
  if (!petProfile) return <PetOnboarding token={token} onComplete={handlePetComplete} />;

  const petEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐇', hamster: '🐹' };
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <a className="navbar-logo" href="#" onClick={() => setView('products')}>
            <span className="logo-emoji">🐾</span>
            <span>Pawfect FurEver</span>
          </a>

          <div className="nav-tabs">
            {[
              { key: 'products', label: '🛍 Shop' },
              { key: 'orders', label: '📦 Orders' },
              { key: 'wishlist-view', label: '❤️ Wishlist' },
            ].map(tab => (
              <button
                key={tab.key}
                id={`nav-${tab.key}`}
                className={`nav-tab ${view === tab.key ? 'active' : ''}`}
                onClick={() => setView(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <span className="pet-badge">
              {petEmojis[petProfile.petType]} {petProfile.petName || petProfile.petBreed}
            </span>

            <div className="cart-btn">
              <button
                id="nav-cart"
                className="btn btn-secondary btn-icon"
                onClick={() => setView('cart')}
                title="Shopping Cart"
              >
                🛒
              </button>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>

            <button id="nav-logout" className="btn btn-danger btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {view === 'products' && (
        <ProductsView
          token={token}
          petProfile={petProfile}
          cart={cart}
          onAddToCart={addToCart}
          wishlist={wishlist}
          onWishlist={toggleWishlist}
        />
      )}

      {view === 'cart' && (
        <CartView
          cart={cart}
          onUpdate={updateCartQty}
          onRemove={removeFromCart}
          token={token}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {view === 'orders' && <OrdersView token={token} />}

      {view === 'wishlist-view' && (
        <div className="page">
          <div className="page-header">
            <div className="page-title">
              <h2>❤️ Wishlist</h2>
              <span className="page-subtitle">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🤍</div>
              <h3>Your wishlist is empty</h3>
              <p>Save products you love by clicking the heart icon</p>
              <button className="btn btn-primary" onClick={() => setView('products')}>Browse Products</button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              You have {wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved.
              Browse the shop to see your wished products or remove them from the heart icon.
            </p>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default App;
