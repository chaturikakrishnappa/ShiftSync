/**
 * ShiftSync Backend Server Entry Point
 * 
 * Enforces strict bootstrap order:
 * 1. Load Environment Variables
 * 2. Connect to MongoDB Atlas (Wait for success)
 * 3. Initialize Express and Http Server
 * 4. Start Listening (with EADDRINUSE protection)
 */

// 1. Load and Validate Env
require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets');
const { connectDB } = require('./config/db');
const { initCron } = require('./cron');

const PORT = process.env.PORT || 5000;

// Required env check
const requiredEnvs = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing = requiredEnvs.filter(env => !process.env[env]);
if (missing.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL ERROR: MISSING ENV VARIABLES');
  console.error(`Missing: ${missing.join(', ')}`);
  console.error('Check your .env file or backend/.env.example.');
  process.exit(1);
}

async function bootstrap() {
  try {
    // 2. Database Connection (Blocking success)
    await connectDB();

    // 3. Server Setup
    const server = http.createServer(app);
    initSocket(server);

    // Handle asynchronous server errors (like port conflict)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('\x1b[31m%s\x1b[0m', `❌ PORT CONFLICT ERROR: Port ${PORT} is already in use.`);
        console.error(`Action Required: Use 'npx kill-port ${PORT}' or change PORT in .env.`);
      } else {
        console.error('\x1b[31m%s\x1b[0m', `❌ SERVER ERROR: ${err.message}`);
      }
      process.exit(1);
    });

    // 4. Start Listening with Port Protection
    server.listen(PORT, () => {
      console.log('\x1b[36m%s\x1b[0m', `🚀 ShiftSync API Running at http://localhost:${PORT}`);
      
      // Start Automation (Cron) only after successful listen
      if (process.env.DISABLE_CRON !== 'true') {
        initCron();
        console.log('\x1b[35m%s\x1b[0m', '⏰ Shift Reminders Scheduled (7 AM Cron)');
      }
    });

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ BOOTSTRAP FAILED');
    console.error(err);
    process.exit(1);
  }
}

// Global Rejection Handler
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at Promise:', reason);
  process.exit(1);
});

// Run
bootstrap();
