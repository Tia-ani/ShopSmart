const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const express = require('express');
const { validateBody, validateEmail } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// In-memory store (replace with MongoDB in production)
const users = [];

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register',
  validateBody(['email', 'password', 'name']),
  validateEmail,
  (req, res) => {
    const { email, password, name } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const user = {
      id: users.length + 1,
      email,
      password, // In production: bcrypt.hash(password, 10)
      name,
      role: 'user',
      petProfile: null,
      createdAt: new Date().toISOString()
    };
    users.push(user);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  }
);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login',
  validateBody(['email', 'password']),
  (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        petProfile: user.petProfile
      }
    });
  }
);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      petProfile: user.petProfile
    }
  });
});

/**
 * @route PUT /api/auth/password
 * @desc Change user password
 * @access Private
 */
router.put('/password',
  authenticateToken,
  validateBody(['currentPassword', 'newPassword']),
  (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = users.find(u => u.id === req.user.id);

    if (!user || user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    res.json({ message: 'Password updated successfully' });
  }
);

// Export users array for use in other routes (in production, use DB)
module.exports = { router, users };
