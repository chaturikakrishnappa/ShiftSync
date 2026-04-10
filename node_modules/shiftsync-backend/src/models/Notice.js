const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const NoticeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    postedBy: { type: String, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

NoticeSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', NoticeSchema);

