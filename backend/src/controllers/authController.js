const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Business = require('../models/Business');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefresh } = require('../services/tokenService');
const { sendInviteEmail } = require('../services/emailService');

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/' // Ensure cookie is available for all routes
  });
}

const registerManager = asyncHandler(async (req, res) => {
  const { businessName, name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const business = await Business.create([{ name: businessName, ownerId: 'temp' }], { session });
    const businessId = business[0]._id;
    const passwordHash = await bcrypt.hash(password, 10);
    const manager = await User.create(
      [
        {
          businessId,
          email,
          name,
          role: 'manager',
          passwordHash,
          isActive: true
        }
      ],
      { session }
    );
    await Business.updateOne({ _id: businessId }, { ownerId: manager[0]._id }, { session });
    const access = signAccessToken({ sub: manager[0]._id, role: 'manager' });
    const refresh = signRefreshToken({ sub: manager[0]._id });
    setRefreshCookie(res, refresh);
    res.status(201).json({
      accessToken: access,
      user: { id: manager[0]._id, role: 'manager', name, email, businessId }
    });
  });
  session.endSession();
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const access = signAccessToken({ sub: user._id, role: user.role });
  const refresh = signRefreshToken({ sub: user._id });
  setRefreshCookie(res, refresh);
  res.json({ accessToken: access, user: { id: user._id, role: user.role, name: user.name, email: user.email, businessId: user.businessId } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  const payload = verifyRefresh(token);
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: 'Invalid user' });
  const access = signAccessToken({ sub: user._id, role: user.role });
  const refreshTk = signRefreshToken({ sub: user._id });
  setRefreshCookie(res, refreshTk);
  res.json({ accessToken: access, user: { id: user._id, role: user.role, name: user.name, email: user.email, businessId: user.businessId } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ ok: true });
});

const invite = asyncHandler(async (req, res) => {
  const { email, name, role } = req.body;
  const manager = await User.findById(req.user.id);
  if (manager.role !== 'manager') return res.status(403).json({ error: 'Forbidden' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const token = uuidv4();
  const invite = await User.create({
    businessId: manager.businessId,
    email,
    name,
    role: role || 'employee',
    passwordHash: await bcrypt.hash(uuidv4(), 10),
    inviteToken: token,
    inviteExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
    isActive: false
  });
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${base}/accept-invite?token=${token}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail({ to: email, inviteLink: link, businessName: process.env.APP_NAME || 'ShiftSync' });
  res.json({ ok: true });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({ email, inviteToken: token });
  if (!user) return res.status(400).json({ error: 'Invalid invite' });
  if (!user.inviteExpires || user.inviteExpires < new Date()) return res.status(400).json({ error: 'Invite expired' });
  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  user.isActive = true;
  user.inviteToken = undefined;
  user.inviteExpires = undefined;
  await user.save();
  const access = signAccessToken({ sub: user._id, role: user.role });
  const refreshTk = signRefreshToken({ sub: user._id });
  setRefreshCookie(res, refreshTk);
  res.json({ accessToken: access, user: { id: user._id, role: user.role, name: user.name, email: user.email, businessId: user.businessId } });
});

module.exports = { registerManager, login, refresh, logout, invite, acceptInvite };
