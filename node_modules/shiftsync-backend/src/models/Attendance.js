const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AttendanceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    userId: { type: String, ref: 'User', required: true },
    shiftAssignmentId: { type: String, ref: 'ShiftAssignment', required: true },
    clockInTime: { type: Date },
    clockOutTime: { type: Date },
    late: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

AttendanceSchema.index({ businessId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);

