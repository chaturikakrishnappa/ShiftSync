const mongoose = require('mongoose');
const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');
const User = require('../models/User');
const { generateSchedule } = require('../services/aiService');
const { emitToBusiness } = require('../sockets');
const asyncHandler = require('../utils/asyncHandler');

function getWeekId(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const createShift = asyncHandler(async (req, res) => {
  const { title, shiftDate, startTime, endTime } = req.body;
  const shift = await Shift.create({
    businessId: req.user.businessId,
    title,
    shiftDate,
    startTime,
    endTime,
    status: 'draft',
    weekId: getWeekId(shiftDate)
  });
  res.status(201).json(shift);
});

const listWeek = asyncHandler(async (req, res) => {
  const { weekId } = req.query;
  const businessId = req.user.businessId;
  const shifts = await Shift.find({ businessId, weekId });
  const assignments = await ShiftAssignment.find({ businessId }).where('shiftDate').in(shifts.map(s => s.shiftDate));
  res.json({ shifts, assignments });
});

const publishWeek = asyncHandler(async (req, res) => {
  const { weekId } = req.body;
  const businessId = req.user.businessId;
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    await Shift.updateMany({ businessId, weekId }, { $set: { status: 'published' } }, { session });
  });
  session.endSession();
  emitToBusiness(businessId, 'schedule_published', { weekId });
  res.json({ ok: true });
});

const assignShift = asyncHandler(async (req, res) => {
  const { shiftId, userId } = req.body;
  const shift = await Shift.findOne({ _id: shiftId, businessId: req.user.businessId });
  if (!shift) return res.status(404).json({ error: 'Shift not found' });
  const existing = await ShiftAssignment.findOne({ userId, shiftDate: shift.shiftDate });
  if (existing) return res.status(400).json({ error: 'User already assigned to a shift that day' });
  const assignment = await ShiftAssignment.create({
    businessId: req.user.businessId,
    userId,
    shiftId,
    shiftDate: shift.shiftDate,
    startTime: shift.startTime,
    endTime: shift.endTime
  });
  res.status(201).json(assignment);
});

const autoSchedule = asyncHandler(async (req, res) => {
  const businessId = req.user.businessId;
  const { weekId } = req.body;
  const shifts = await Shift.find({ businessId, weekId });
  const employees = await User.find({ businessId, role: 'employee', isActive: true }).select('_id');
  const constraints = { shifts: shifts.map(s => ({ id: s._id, date: s.shiftDate })), employees: employees.map(e => e._id) };
  const plan = await generateSchedule({ constraints });
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    for (const a of plan.assignments) {
      const s = shifts.find(x => x._id === a.shiftId);
      if (!s) continue;
      const conflict = await ShiftAssignment.findOne({ userId: a.userId, shiftDate: s.shiftDate }).session(session);
      if (conflict) continue;
      await ShiftAssignment.create(
        [
          {
            businessId,
            userId: a.userId,
            shiftId: a.shiftId,
            shiftDate: s.shiftDate,
            startTime: s.startTime,
            endTime: s.endTime
          }
        ],
        { session }
      );
    }
  });
  session.endSession();
  res.json({ ok: true });
});

module.exports = { createShift, listWeek, publishWeek, assignShift, autoSchedule };
