const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pawfect FurEver Backend is running', timestamp: new Date().toISOString() });
});

// Mock data
const products = [
  { id: 1, name: 'Premium Dog Food', category: 'food', petType: 'dog', price: 49.99, image: 'https://via.placeholder.com/200', rating: 4.5, stock: 50 },
  { id: 2, name: 'Cat Scratching Post', category: 'toys', petType: 'cat', price: 29.99, image: 'https://via.placeholder.com/200', rating: 4.8, stock: 30 },
  { id: 3, name: 'Dog Leash', category: 'accessories', petType: 'dog', price: 19.99, image: 'https://via.placeholder.com/200', rating: 4.3, stock: 100 },
  { id: 4, name: 'Cat Litter Box', category: 'accessories', petType: 'cat', price: 39.99, image: 'https://via.placeholder.com/200', rating: 4.6, stock: 25 },
  { id: 5, name: 'Bird Cage', category: 'accessories', petType: 'bird', price: 89.99, image: 'https://via.placeholder.com/200', rating: 4.7, stock: 15 },
  { id: 6, name: 'Fish Tank Filter', category: 'accessories', petType: 'fish', price: 34.99, image: 'https://via.placeholder.com/200', rating: 4.4, stock: 40 },
];

const users = [];
const orders = [];
let orderIdCounter = 1;

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const user = { id: users.length + 1, email, password, name, petProfile: null };
  users.push(user);
  
  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, petProfile: user.petProfile } });
});

// Pet profile endpoints
app.post('/api/profile/pet', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
  const user = users.find(u => u.id === decoded.id);
  
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  user.petProfile = req.body;
  res.json({ petProfile: user.petProfile });
});

app.get('/api/profile/pet', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
  const user = users.find(u => u.id === decoded.id);
  
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  res.json({ petProfile: user.petProfile });
});

// Product endpoints
app.get('/api/products', (req, res) => {
  const { petType, category } = req.query;
  let filtered = products;
  
  if (petType) {
    filtered = filtered.filter(p => p.petType === petType);
  }
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  res.json({ products: filtered });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

// Order endpoints
app.post('/api/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
  
  const order = {
    id: orderIdCounter++,
    userId: decoded.id,
    items: req.body.items,
    total: req.body.total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  res.status(201).json({ order });
});

app.get('/api/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
  
  const userOrders = orders.filter(o => o.userId === decoded.id);
  res.json({ orders: userOrders });
});

module.exports = app;
