const Notice = require('../models/Notice');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const doc = await Notice.create({
    businessId: req.user.businessId,
    title,
    message,
    postedBy: req.user.id
  });
  res.json(doc);
});

const list = asyncHandler(async (req, res) => {
  const docs = await Notice.find({ businessId: req.user.businessId }).sort({ createdAt: -1 });
  res.json(docs);
});

module.exports = { create, list };
