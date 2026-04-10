const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BusinessSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    ownerId: { type: String, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

BusinessSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Business', BusinessSchema);

