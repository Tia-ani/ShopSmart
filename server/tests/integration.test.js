const request = require('supertest');
const app = require('../src/app');

/**
 * Integration test: Full user journey from registration → pet profile → browse → order
 * Tests interaction between Auth, Profile, Products, and Orders modules
 */
describe('Integration: Full User Shopping Journey', () => {
  let token;
  const user = {
    name: 'Integration Tester',
    email: `integration-${Date.now()}@test.com`,
    password: 'testpass123'
  };

  let productId;

  describe('Step 1: User Registration', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(user);

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      token = res.body.token;
    });
  });

  describe('Step 2: Create Pet Profile', () => {
    it('should set up a pet profile after registration', async () => {
      const res = await request(app)
        .post('/api/profile/pet')
        .set('Authorization', `Bearer ${token}`)
        .send({ petType: 'dog', petBreed: 'Labrador', petName: 'Buddy' });

      expect(res.statusCode).toBe(200);
      expect(res.body.petProfile).toHaveProperty('petType', 'dog');
      expect(res.body.petProfile).toHaveProperty('petBreed', 'Labrador');
    });

    it('should retrieve the pet profile', async () => {
      const res = await request(app)
        .get('/api/profile/pet')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.petProfile).toHaveProperty('petName', 'Buddy');
    });
  });

  describe('Step 3: Browse Personalized Products', () => {
    it('should fetch dog products based on pet profile', async () => {
      const res = await request(app).get('/api/products?petType=dog');

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.products.every(p => p.petType === 'dog')).toBe(true);

      productId = res.body.products[0].id;
    });

    it('should get a single product detail', async () => {
      const res = await request(app).get(`/api/products/${productId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.product.id).toBe(productId);
    });
  });

  describe('Step 4: Add to Wishlist', () => {
    it('should add a product to wishlist', async () => {
      const res = await request(app)
        .post(`/api/wishlist/${productId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.wishlist).toContain(productId);
    });

    it('should view the wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.wishlist).toContain(productId);
    });
  });

  describe('Step 5: Place Order', () => {
    it('should place an order with products from the store', async () => {
      const productRes = await request(app).get(`/api/products/${productId}`);
      const product = productRes.body.product;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ ...product, quantity: 1 }],
          total: product.price,
          paymentMethod: 'card'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.order).toHaveProperty('id');
      expect(res.body.order).toHaveProperty('status', 'pending');
      expect(res.body.order.items[0]).toHaveProperty('name', product.name);
    });
  });

  describe('Step 6: View Order History', () => {
    it('should see the placed order in order history', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      expect(res.body.orders[0]).toHaveProperty('status');
    });
  });

  describe('Step 7: Leave a Review', () => {
    it('should submit a product review', async () => {
      const res = await request(app)
        .post(`/api/reviews/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          rating: 5,
          title: 'Great product!',
          body: 'My dog absolutely loves this. Would highly recommend to all dog owners!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.review).toHaveProperty('rating', 5);
    });

    it('should see the review on the product', async () => {
      const res = await request(app).get(`/api/reviews/${productId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.reviews.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('averageRating');
    });
  });
});
