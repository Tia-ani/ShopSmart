import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('login');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [petProfile, setPetProfile] = useState(null);
  
  // Auth forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Pet profile form
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');

  useEffect(() => {
    if (token) {
      fetchPetProfile();
      fetchProducts();
    }
  }, [token]);

  const fetchPetProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/pet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPetProfile(data.petProfile);
        if (data.petProfile) setView('products');
      }
    } catch (err) {
      console.error('Failed to fetch pet profile', err);
    }
  };

  const fetchProducts = async (filterPetType = null) => {
    try {
      const url = filterPetType 
        ? `${API_URL}/api/products?petType=${filterPetType}`
        : `${API_URL}/api/products`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setView('petProfile');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setPetProfile(data.user.petProfile);
        setView(data.user.petProfile ? 'products' : 'petProfile');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handlePetProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/profile/pet`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ petType, petBreed })
      });
      const data = await res.json();
      if (res.ok) {
        setPetProfile(data.petProfile);
        fetchProducts(petType);
        setView('products');
      }
    } catch (err) {
      alert('Failed to save pet profile');
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart, total })
      });
      if (res.ok) {
        alert('Order placed successfully!');
        setCart([]);
      }
    } catch (err) {
      alert('Checkout failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPetProfile(null);
    setCart([]);
    localStorage.removeItem('token');
    setView('login');
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#6366f1' }}>🐾 Pawfect FurEver</h1>
        
        {view === 'login' ? (
          <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>
                Login
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              Don't have an account? <a href="#" onClick={() => setView('register')} style={{ color: '#6366f1' }}>Register</a>
            </p>
          </div>
        ) : (
          <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input 
                type="text" 
                placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                required
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>
                Register
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              Already have an account? <a href="#" onClick={() => setView('login')} style={{ color: '#6366f1' }}>Login</a>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (view === 'petProfile') {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#6366f1' }}>🐾 Tell us about your pet!</h1>
        <form onSubmit={handlePetProfile}>
          <label style={{ display: 'block', margin: '20px 0 10px' }}>Pet Type:</label>
          <select 
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          >
            <option value="">Select pet type</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="fish">Fish</option>
          </select>
          
          <label style={{ display: 'block', margin: '20px 0 10px' }}>Breed:</label>
          <input 
            type="text" 
            placeholder="e.g., Golden Retriever" 
            value={petBreed}
            onChange={(e) => setPetBreed(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
          
          <button type="submit" style={{ width: '100%', padding: '10px', marginTop: '20px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}>
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px' }}>
        <h1 style={{ color: '#6366f1' }}>🐾 Pawfect FurEver</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {petProfile && <span>Pet: {petProfile.petType} ({petProfile.petBreed})</span>}
          <span>Cart: {cart.length}</span>
          <button onClick={() => setView('cart')} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>
            View Cart
          </button>
          <button onClick={logout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      {view === 'products' && (
        <div>
          <h2>Products {petProfile && `for ${petProfile.petType}s`}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {products.map(product => (
              <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '4px' }} />
                <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
                <p style={{ color: '#6b7280' }}>{product.category}</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1' }}>${product.price}</p>
                <p>⭐ {product.rating} | Stock: {product.stock}</p>
                <button 
                  onClick={() => addToCart(product)}
                  style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'cart' && (
        <div>
          <button onClick={() => setView('products')} style={{ marginBottom: '20px', padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}>
            ← Back to Products
          </button>
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div>
              {cart.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', border: '1px solid #e5e7eb', marginBottom: '10px', borderRadius: '4px' }}>
                  <span>{item.name}</span>
                  <span>${item.price}</span>
                </div>
              ))}
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <h3>Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</h3>
                <button 
                  onClick={checkout}
                  style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '16px' }}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
