const request = require('supertest');
const app = require('../src/app');

describe('Products Routes', () => {
  describe('GET /api/products', () => {
    it('should return a list of products with pagination', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('page', 1);
    });

    it('should filter products by petType', async () => {
      const res = await request(app).get('/api/products?petType=dog');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.every(p => p.petType === 'dog')).toBe(true);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=food');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.every(p => p.category === 'food')).toBe(true);
    });

    it('should search products by name', async () => {
      const res = await request(app).get('/api/products?search=dog');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it('should sort products by price ascending', async () => {
      const res = await request(app).get('/api/products?sort=price-asc');
      expect(res.statusCode).toBe(200);
      const prices = res.body.products.map(p => p.price);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('should paginate correctly', async () => {
      const res = await request(app).get('/api/products?page=1&limit=3');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBeLessThanOrEqual(3);
      expect(res.body.pagination.limit).toBe(3);
    });

    it('should reject invalid page value', async () => {
      const res = await request(app).get('/api/products?page=0');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/products/featured', () => {
    it('should return only featured products', async () => {
      const res = await request(app).get('/api/products/featured');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.every(p => p.featured === true)).toBe(true);
    });
  });

  describe('GET /api/products/categories', () => {
    it('should return categories and petTypes', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('petTypes');
      expect(Array.isArray(res.body.categories)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.product).toHaveProperty('id', 1);
      expect(res.body.product).toHaveProperty('name');
      expect(res.body.product).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/99999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('POST /api/products (Admin protected)', () => {
    it('should reject unauthenticated product creation', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Test Product', category: 'food', petType: 'dog', price: 10 });
      expect(res.statusCode).toBe(401);
    });
  });
});
