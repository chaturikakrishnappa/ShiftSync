const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If multiple errors, join them; if one, just use it
    const msg = errors.array().map(e => e.msg).join(', ');
    return res.status(400).json({ error: msg });
  }
  next();
}

module.exports = { validate };

