const mongoose = require('mongoose');
const SwapRequest = require('../models/SwapRequest');
const LeaveRequest = require('../models/LeaveRequest');
const ShiftAssignment = require('../models/ShiftAssignment');
const asyncHandler = require('../utils/asyncHandler');

const createSwap = asyncHandler(async (req, res) => {
  const { assignmentId, toUserId } = req.body;
  const a = await ShiftAssignment.findById(assignmentId);
  if (!a || a.userId !== req.user.id) return res.status(400).json({ error: 'Invalid assignment' });
  const reqDoc = await SwapRequest.create({
    businessId: req.user.businessId,
    shiftAssignmentId: assignmentId,
    fromUserId: req.user.id,
    toUserId
  });
  res.json(reqDoc);
});

const respondSwap = asyncHandler(async (req, res) => {
  const { requestId, accept } = req.body;
  const doc = await SwapRequest.findById(requestId);
  if (!doc || doc.toUserId !== req.user.id) return res.status(400).json({ error: 'Invalid request' });
  doc.status = accept ? 'accepted' : 'rejected';
  await doc.save();
  res.json(doc);
});

const approveSwap = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const doc = await SwapRequest.findById(requestId);
  if (!doc || doc.status !== 'accepted') return res.status(400).json({ error: 'Invalid request' });
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const a = await ShiftAssignment.findById(doc.shiftAssignmentId).session(session);
    if (!a) throw new Error('Assignment not found');
    a.userId = doc.toUserId;
    await a.save({ session });
    doc.status = 'manager_approved';
    await doc.save({ session });
  });
  session.endSession();
  res.json({ ok: true });
});

const createLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  const doc = await LeaveRequest.create({
    businessId: req.user.businessId,
    userId: req.user.id,
    startDate,
    endDate,
    reason
  });
  res.json(doc);
});

const approveLeave = asyncHandler(async (req, res) => {
  const { requestId, approve } = req.body;
  const doc = await LeaveRequest.findById(requestId);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.status = approve ? 'approved' : 'rejected';
  await doc.save();
  res.json(doc);
});

const listMy = asyncHandler(async (req, res) => {
  const swaps = await SwapRequest.find({ businessId: req.user.businessId });
  const leaves = await LeaveRequest.find({ businessId: req.user.businessId, userId: req.user.id });
  res.json({ swaps, leaves });
});

module.exports = { createSwap, respondSwap, approveSwap, createLeave, approveLeave, listMy };
