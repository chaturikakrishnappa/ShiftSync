const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AvailabilitySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    userId: { type: String, ref: 'User', required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  { timestamps: true, versionKey: false }
);

AvailabilitySchema.index({ businessId: 1, userId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);

