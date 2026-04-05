const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

const validatePagination = (req, res, next) => {
  const pageParam = req.query.page;
  const limitParam = req.query.limit;
  const page = pageParam !== undefined ? parseInt(pageParam) : 1;
  const limit = limitParam !== undefined ? parseInt(limitParam) : 12;

  if (pageParam !== undefined && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: 'Page must be >= 1' });
  }
  if (limit < 1 || limit > 100) return res.status(400).json({ error: 'Limit must be between 1 and 100' });

  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};

module.exports = { validateBody, validateEmail, validatePagination };
