const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const orders = [];
let orderIdCounter = 1;

/**
 * @route POST /api/orders
 * @desc Place a new order
 * @access Private
 */
router.post('/', authenticateToken, (req, res) => {
  const { items, total, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  if (!total || total <= 0) {
    return res.status(400).json({ error: 'Invalid order total' });
  }

  const order = {
    id: orderIdCounter++,
    userId: req.user.id,
    items: items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image
    })),
    total: parseFloat(total.toFixed(2)),
    status: 'pending',
    shippingAddress: shippingAddress || null,
    paymentMethod: paymentMethod || 'card',
    trackingNumber: null,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json({ order, message: 'Order placed successfully!' });
});

/**
 * @route GET /api/orders
 * @desc Get all orders for current user
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => {
  const userOrders = orders
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ orders: userOrders, total: userOrders.length });
});

/**
 * @route GET /api/orders/:id
 * @desc Get a single order by ID
 * @access Private
 */
router.get('/:id', authenticateToken, (req, res) => {
  const order = orders.find(
    o => o.id === parseInt(req.params.id) && o.userId === req.user.id
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ order });
});

/**
 * @route PUT /api/orders/:id/cancel
 * @desc Cancel an order
 * @access Private
 */
router.put('/:id/cancel', authenticateToken, (req, res) => {
  const order = orders.find(
    o => o.id === parseInt(req.params.id) && o.userId === req.user.id
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status}` });
  }

  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();
  res.json({ order, message: 'Order cancelled successfully' });
});

/**
 * @route GET /api/orders/admin/all
 * @desc Get all orders (Admin)
 * @access Private/Admin
 */
router.get('/admin/all', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders: sorted, total: sorted.length });
});

/**
 * @route PUT /api/orders/admin/:id/status
 * @desc Update order status (Admin)
 * @access Private/Admin
 */
router.put('/admin/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { status, trackingNumber } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  order.updatedAt = new Date().toISOString();

  res.json({ order, message: 'Order status updated' });
});

module.exports = { router, orders };
