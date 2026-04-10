const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection is not established. Please check if MONGODB_URI is set in .env and your database is accessible.'
    });
  }
  next();
};

module.exports = dbCheck;
