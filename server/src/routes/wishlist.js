const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Wishlist store: { userId -> [productId] }
const wishlists = {};

/**
 * @route GET /api/wishlist
 * @desc Get user's wishlist
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => {
  const wishlist = wishlists[req.user.id] || [];
  res.json({ wishlist, total: wishlist.length });
});

/**
 * @route POST /api/wishlist/:productId
 * @desc Add product to wishlist
 * @access Private
 */
router.post('/:productId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);

  if (!wishlists[req.user.id]) wishlists[req.user.id] = [];

  if (wishlists[req.user.id].includes(productId)) {
    return res.status(409).json({ error: 'Product already in wishlist' });
  }

  wishlists[req.user.id].push(productId);
  res.status(201).json({
    wishlist: wishlists[req.user.id],
    message: 'Added to wishlist'
  });
});

/**
 * @route DELETE /api/wishlist/:productId
 * @desc Remove product from wishlist
 * @access Private
 */
router.delete('/:productId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);

  if (!wishlists[req.user.id]) {
    return res.status(404).json({ error: 'Wishlist is empty' });
  }

  const idx = wishlists[req.user.id].indexOf(productId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not in wishlist' });
  }

  wishlists[req.user.id].splice(idx, 1);
  res.json({ wishlist: wishlists[req.user.id], message: 'Removed from wishlist' });
});

module.exports = { router };
