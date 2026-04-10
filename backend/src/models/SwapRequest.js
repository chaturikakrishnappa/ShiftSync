const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SwapRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    shiftAssignmentId: { type: String, ref: 'ShiftAssignment', required: true },
    fromUserId: { type: String, ref: 'User', required: true },
    toUserId: { type: String, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'manager_approved'], default: 'pending' }
  },
  { timestamps: true, versionKey: false }
);

SwapRequestSchema.index({ businessId: 1, fromUserId: 1, toUserId: 1 });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);

