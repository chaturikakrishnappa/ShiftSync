const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ShiftSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    title: { type: String, default: 'Shift' },
    shiftDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    weekId: { type: String }
  },
  { timestamps: true, versionKey: false }
);

ShiftSchema.index({ businessId: 1, shiftDate: 1 });

module.exports = mongoose.model('Shift', ShiftSchema);

