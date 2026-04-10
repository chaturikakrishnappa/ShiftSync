const { sendReminderEmail } = require('./emailService');
const ShiftAssignment = require('../models/ShiftAssignment');
const User = require('../models/User');
const { emitToUser } = require('../sockets');

async function sendShiftReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const assignments = await ShiftAssignment.find({
    shiftDate: { $gte: now.toISOString().slice(0, 10), $lte: in24h.toISOString().slice(0, 10) }
  })
    .populate('userId')
    .populate('shiftId');

  for (const a of assignments) {
    const user = a.userId;
    if (!user?.email) continue;
    const subject = 'Upcoming shift reminder';
    const html = `<p>You have a shift on ${a.shiftDate} from ${a.startTime} to ${a.endTime}.</p>`;
    await sendReminderEmail({ to: user.email, subject, html });
    emitToUser(user._id, 'reminder', { assignmentId: a._id });
  }
}

module.exports = { sendShiftReminders };

