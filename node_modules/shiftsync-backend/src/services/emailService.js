const nodemailer = require('nodemailer');

function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendInviteEmail({ to, inviteLink, businessName }) {
  const transporter = makeTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@shiftsync.app',
    to,
    subject: `You're invited to ${businessName} on ShiftSync`,
    html: `<p>You've been invited to join ${businessName} on ShiftSync.</p><p>Please click the link to accept your invite:</p><p><a href="${inviteLink}">${inviteLink}</a></p>`
  });
}

async function sendReminderEmail({ to, subject, html }) {
  const transporter = makeTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@shiftsync.app',
    to,
    subject,
    html
  });
}

module.exports = { sendInviteEmail, sendReminderEmail };

