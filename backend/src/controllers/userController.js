const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, businessId: user.businessId });
});

const listEmployees = asyncHandler(async (req, res) => {
  const users = await User.find({ businessId: req.user.businessId, role: 'employee' }).select('name email _id');
  res.json(users);
});

module.exports = { me, listEmployees };
