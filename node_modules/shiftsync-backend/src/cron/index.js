const cron = require('node-cron');
const { sendShiftReminders } = require('../services/notificationService');

function initCron() {
  if (process.env.DISABLE_CRON === 'true') return;
  cron.schedule('0 7 * * *', async () => {
    try {
      await sendShiftReminders();
    } catch (e) {
      console.error('Cron error', e);
    }
  });
}

module.exports = { initCron };

