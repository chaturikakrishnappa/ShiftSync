const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const LeaveRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    userId: { type: String, ref: 'User', required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  { timestamps: true, versionKey: false }
);

LeaveRequestSchema.index({ businessId: 1, userId: 1, startDate: 1 });

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);

