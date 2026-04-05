const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { users } = require('./auth');

const router = express.Router();

/**
 * @route GET /api/profile/pet
 * @desc Get current user's pet profile
 * @access Private
 */
router.get('/pet', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ petProfile: user.petProfile });
});

/**
 * @route POST /api/profile/pet
 * @desc Create or update pet profile
 * @access Private
 */
router.post('/pet',
  authenticateToken,
  validateBody(['petType', 'petBreed']),
  (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPetTypes = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster'];
    if (!validPetTypes.includes(req.body.petType)) {
      return res.status(400).json({
        error: `petType must be one of: ${validPetTypes.join(', ')}`
      });
    }

    user.petProfile = {
      petType: req.body.petType,
      petBreed: req.body.petBreed,
      petName: req.body.petName || null,
      petAge: req.body.petAge || null,
      petWeight: req.body.petWeight || null,
      updatedAt: new Date().toISOString()
    };

    res.json({
      petProfile: user.petProfile,
      message: 'Pet profile saved successfully'
    });
  }
);

/**
 * @route PUT /api/profile/user
 * @desc Update user profile info
 * @access Private
 */
router.put('/user', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, phone, address } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      petProfile: user.petProfile
    }
  });
});

module.exports = { router };
