const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Reviews store: { productId -> [review] }
const reviews = {};

/**
 * @route GET /api/reviews/:productId
 * @desc Get all reviews for a product
 * @access Public
 */
router.get('/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const productReviews = reviews[productId] || [];
  const sorted = [...productReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    reviews: sorted,
    total: sorted.length,
    averageRating: sorted.length > 0
      ? (sorted.reduce((sum, r) => sum + r.rating, 0) / sorted.length).toFixed(1)
      : 0
  });
});

/**
 * @route POST /api/reviews/:productId
 * @desc Add a review for a product
 * @access Private
 */
router.post('/:productId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);
  const { rating, title, body } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  if (!body || body.trim().length < 10) {
    return res.status(400).json({ error: 'Review body must be at least 10 characters' });
  }

  if (!reviews[productId]) reviews[productId] = [];

  // One review per user per product
  const existing = reviews[productId].find(r => r.userId === req.user.id);
  if (existing) {
    return res.status(409).json({ error: 'You have already reviewed this product' });
  }

  const review = {
    id: Date.now(),
    productId,
    userId: req.user.id,
    userEmail: req.user.email,
    rating: parseInt(rating),
    title: title || '',
    body: body.trim(),
    helpful: 0,
    verified: true,
    createdAt: new Date().toISOString()
  };

  reviews[productId].push(review);
  res.status(201).json({ review, message: 'Review submitted successfully' });
});

/**
 * @route PUT /api/reviews/:productId/:reviewId/helpful
 * @desc Mark a review as helpful
 * @access Private
 */
router.put('/:productId/:reviewId/helpful', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);
  const reviewId = parseInt(req.params.reviewId);

  const productReviews = reviews[productId] || [];
  const review = productReviews.find(r => r.id === reviewId);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.helpful += 1;
  res.json({ review });
});

/**
 * @route DELETE /api/reviews/:productId/:reviewId
 * @desc Delete your own review
 * @access Private
 */
router.delete('/:productId/:reviewId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);
  const reviewId = parseInt(req.params.reviewId);

  const productReviews = reviews[productId] || [];
  const idx = productReviews.findIndex(
    r => r.id === reviewId && r.userId === req.user.id
  );

  if (idx === -1) {
    return res.status(404).json({ error: 'Review not found or not yours to delete' });
  }

  productReviews.splice(idx, 1);
  res.json({ message: 'Review deleted successfully' });
});

module.exports = { router, reviews };
