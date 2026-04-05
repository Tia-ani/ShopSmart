const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// In-memory product store
let products = [
  {
    id: 1,
    name: 'Premium Grain-Free Dog Food',
    description: 'High-protein, grain-free recipe for active dogs. Made with real chicken and sweet potato.',
    category: 'food',
    petType: 'dog',
    price: 49.99,
    comparePrice: 64.99,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9a72ce6?w=400',
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9a72ce6?w=400'],
    rating: 4.5,
    reviewCount: 128,
    stock: 50,
    tags: ['organic', 'grain-free', 'high-protein'],
    brand: 'PawNaturals',
    sku: 'DOG-FOOD-001',
    weight: '5kg',
    featured: true,
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 2,
    name: 'Cat Scratching Post Tower',
    description: 'Multi-level sisal scratching post with dangling toys. Keeps cats entertained for hours.',
    category: 'toys',
    petType: 'cat',
    price: 34.99,
    comparePrice: 44.99,
    image: 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400',
    images: ['https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400'],
    rating: 4.8,
    reviewCount: 89,
    stock: 30,
    tags: ['sisal', 'tower', 'multi-level'],
    brand: 'KittyKingdom',
    sku: 'CAT-TOY-001',
    weight: '3kg',
    featured: true,
    createdAt: new Date('2024-01-12').toISOString()
  },
  {
    id: 3,
    name: 'Retractable Dog Leash (5m)',
    description: 'Durable retractable leash with ergonomic handle. Built-in LED safety light.',
    category: 'accessories',
    petType: 'dog',
    price: 24.99,
    comparePrice: 34.99,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'],
    rating: 4.3,
    reviewCount: 234,
    stock: 100,
    tags: ['retractable', 'LED', 'ergonomic'],
    brand: 'PawTech',
    sku: 'DOG-ACC-001',
    weight: '0.5kg',
    featured: false,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 4,
    name: 'Self-Cleaning Litter Box',
    description: 'Automatic self-cleaning litter box with odor control and smart sensor technology.',
    category: 'accessories',
    petType: 'cat',
    price: 129.99,
    comparePrice: 159.99,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400',
    images: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400'],
    rating: 4.6,
    reviewCount: 312,
    stock: 25,
    tags: ['automatic', 'self-cleaning', 'smart'],
    brand: 'SmartPaws',
    sku: 'CAT-ACC-001',
    weight: '8kg',
    featured: true,
    createdAt: new Date('2024-01-18').toISOString()
  },
  {
    id: 5,
    name: 'Stainless Steel Bird Cage XL',
    description: 'Spacious XL bird cage with multiple perches, feeding stations, and removable base tray.',
    category: 'accessories',
    petType: 'bird',
    price: 89.99,
    comparePrice: 109.99,
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400',
    images: ['https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400'],
    rating: 4.7,
    reviewCount: 67,
    stock: 15,
    tags: ['stainless', 'XL', 'multiple-perches'],
    brand: 'BirdHome',
    sku: 'BIRD-ACC-001',
    weight: '12kg',
    featured: false,
    createdAt: new Date('2024-01-20').toISOString()
  },
  {
    id: 6,
    name: 'Aquarium Canister Filter 600L/h',
    description: 'High-performance canister filter for aquariums up to 150L. Ultra-quiet operation with bio-media.',
    category: 'accessories',
    petType: 'fish',
    price: 59.99,
    comparePrice: 74.99,
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400',
    images: ['https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400'],
    rating: 4.4,
    reviewCount: 156,
    stock: 40,
    tags: ['canister', 'quiet', 'bio-media'],
    brand: 'AquaPure',
    sku: 'FISH-ACC-001',
    weight: '2kg',
    featured: false,
    createdAt: new Date('2024-01-22').toISOString()
  },
  {
    id: 7,
    name: 'Orthopedic Memory Foam Dog Bed',
    description: 'Therapeutic memory foam dog bed with waterproof cover. Perfect for senior dogs and large breeds.',
    category: 'bedding',
    petType: 'dog',
    price: 74.99,
    comparePrice: 94.99,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'],
    rating: 4.9,
    reviewCount: 445,
    stock: 35,
    tags: ['memory-foam', 'orthopedic', 'waterproof'],
    brand: 'PawDreams',
    sku: 'DOG-BED-001',
    weight: '4kg',
    featured: true,
    createdAt: new Date('2024-01-25').toISOString()
  },
  {
    id: 8,
    name: 'Interactive Cat Feather Wand',
    description: 'Telescopic feather wand toy with replaceable tips. Promotes exercise and natural hunting instincts.',
    category: 'toys',
    petType: 'cat',
    price: 14.99,
    comparePrice: 19.99,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
    rating: 4.6,
    reviewCount: 521,
    stock: 75,
    tags: ['feather', 'telescopic', 'interactive'],
    brand: 'KittyPlay',
    sku: 'CAT-TOY-002',
    weight: '0.2kg',
    featured: false,
    createdAt: new Date('2024-01-28').toISOString()
  },
  {
    id: 9,
    name: 'Premium Cat Nutrition Dry Food',
    description: 'Vet-formulated balanced dry food with essential vitamins. For cats of all life stages.',
    category: 'food',
    petType: 'cat',
    price: 39.99,
    comparePrice: 49.99,
    image: 'https://images.unsplash.com/photo-1501820434261-5bb046afcf6b?w=400',
    images: ['https://images.unsplash.com/photo-1501820434261-5bb046afcf6b?w=400'],
    rating: 4.7,
    reviewCount: 299,
    stock: 60,
    tags: ['vet-formulated', 'balanced', 'all-life-stages'],
    brand: 'NutriCat',
    sku: 'CAT-FOOD-001',
    weight: '3kg',
    featured: false,
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    id: 10,
    name: 'Dog Training Treat Bag',
    description: 'Clip-on training treat pouch with magnetic closure. Includes clicker and waste bag dispenser.',
    category: 'training',
    petType: 'dog',
    price: 18.99,
    comparePrice: 24.99,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'],
    rating: 4.5,
    reviewCount: 178,
    stock: 90,
    tags: ['clip-on', 'clicker', 'training'],
    brand: 'TrainMyPup',
    sku: 'DOG-TRN-001',
    weight: '0.3kg',
    featured: false,
    createdAt: new Date('2024-02-05').toISOString()
  },
  {
    id: 11,
    name: 'Rabbit Hutch Deluxe 2-Story',
    description: '2-story indoor/outdoor rabbit hutch with ramp, nest box, and pull-out floor tray.',
    category: 'housing',
    petType: 'rabbit',
    price: 149.99,
    comparePrice: 179.99,
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400',
    images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400'],
    rating: 4.3,
    reviewCount: 44,
    stock: 10,
    tags: ['2-story', 'indoor-outdoor', 'deluxe'],
    brand: 'BunnyHome',
    sku: 'RAB-HSG-001',
    weight: '25kg',
    featured: false,
    createdAt: new Date('2024-02-08').toISOString()
  },
  {
    id: 12,
    name: 'GPS Pet Tracker Collar',
    description: 'Real-time GPS tracking collar with geofencing alerts. Works on dogs and cats. 7-day battery.',
    category: 'tech',
    petType: 'dog',
    price: 79.99,
    comparePrice: 99.99,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'],
    rating: 4.8,
    reviewCount: 267,
    stock: 45,
    tags: ['GPS', 'geofencing', 'real-time'],
    brand: 'PawTrack',
    sku: 'DOG-TEC-001',
    weight: '0.15kg',
    featured: true,
    createdAt: new Date('2024-02-10').toISOString()
  }
];

let productIdCounter = products.length + 1;

/**
 * @route GET /api/products
 * @desc Get all products with filtering and pagination
 * @access Public
 */
router.get('/', validatePagination, (req, res) => {
  const { petType, category, minPrice, maxPrice, search, sort, featured } = req.query;
  const { page, limit, skip } = req.pagination;

  let filtered = [...products];

  if (petType) filtered = filtered.filter(p => p.petType === petType);
  if (category) filtered = filtered.filter(p => p.category === category);
  if (featured === 'true') filtered = filtered.filter(p => p.featured);
  if (minPrice) filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  res.json({
    products: paginated,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @route GET /api/products/featured
 * @desc Get featured products
 * @access Public
 */
router.get('/featured', (req, res) => {
  const featured = products.filter(p => p.featured);
  res.json({ products: featured });
});

/**
 * @route GET /api/products/categories
 * @desc Get all unique categories
 * @access Public
 */
router.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  const petTypes = [...new Set(products.map(p => p.petType))];
  res.json({ categories, petTypes });
});

/**
 * @route GET /api/products/:id
 * @desc Get single product by ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

/**
 * @route POST /api/products
 * @desc Create a new product (Admin only)
 * @access Private/Admin
 */
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, category, petType, price, stock } = req.body;

  if (!name || !category || !petType || !price) {
    return res.status(400).json({ error: 'name, category, petType, and price are required' });
  }

  const product = {
    id: productIdCounter++,
    name,
    description: description || '',
    category,
    petType,
    price: parseFloat(price),
    comparePrice: req.body.comparePrice ? parseFloat(req.body.comparePrice) : null,
    image: req.body.image || 'https://via.placeholder.com/400',
    images: req.body.images || [],
    rating: 0,
    reviewCount: 0,
    stock: parseInt(stock) || 0,
    tags: req.body.tags || [],
    brand: req.body.brand || 'Generic',
    sku: req.body.sku || `SKU-${productIdCounter}`,
    weight: req.body.weight || '',
    featured: req.body.featured || false,
    createdAt: new Date().toISOString()
  };

  products.push(product);
  res.status(201).json({ product });
});

/**
 * @route PUT /api/products/:id
 * @desc Update a product (Admin only)
 * @access Private/Admin
 */
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  res.json({ product: products[idx] });
});

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product (Admin only)
 * @access Private/Admin
 */
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = products.splice(idx, 1)[0];
  res.json({ message: 'Product deleted successfully', product: deleted });
});

module.exports = { router, products };
