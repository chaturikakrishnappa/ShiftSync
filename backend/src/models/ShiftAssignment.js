const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ShiftAssignmentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    userId: { type: String, ref: 'User', required: true },
    shiftId: { type: String, ref: 'Shift', required: true },
    shiftDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  { timestamps: true, versionKey: false }
);

ShiftAssignmentSchema.index({ businessId: 1, userId: 1, shiftDate: 1 });

module.exports = mongoose.model('ShiftAssignment', ShiftAssignmentSchema);

