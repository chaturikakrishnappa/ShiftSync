const { Parser } = require('json2csv');
const Attendance = require('../models/Attendance');
const ShiftAssignment = require('../models/ShiftAssignment');
const asyncHandler = require('../utils/asyncHandler');

const clockIn = asyncHandler(async (req, res) => {
  const { assignmentId } = req.body;
  const assignment = await ShiftAssignment.findById(assignmentId);
  if (!assignment || assignment.userId !== req.user.id) return res.status(400).json({ error: 'Invalid assignment' });
  const late = (() => {
    const now = new Date();
    const [h, m] = assignment.startTime.split(':').map(Number);
    const scheduled = new Date(`${assignment.shiftDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    return now.getTime() - scheduled.getTime() > 10 * 60 * 1000;
  })();
  const rec = await Attendance.create({
    businessId: req.user.businessId,
    userId: req.user.id,
    shiftAssignmentId: assignmentId,
    clockInTime: new Date(),
    late
  });
  res.json(rec);
});

const clockOut = asyncHandler(async (req, res) => {
  const { assignmentId } = req.body;
  const rec = await Attendance.findOne({ userId: req.user.id, shiftAssignmentId: assignmentId });
  if (!rec) return res.status(400).json({ error: 'No clock-in record' });
  rec.clockOutTime = new Date();
  await rec.save();
  res.json(rec);
});

const weeklyReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const data = await Attendance.find({
    businessId: req.user.businessId,
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });
  res.json(data);
});

const exportCsv = asyncHandler(async (req, res) => {
  const data = await Attendance.find({ businessId: req.user.businessId }).lean();
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment('attendance.csv');
  res.send(csv);
});

module.exports = { clockIn, clockOut, weeklyReport, exportCsv };
