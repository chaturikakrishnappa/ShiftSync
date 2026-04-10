const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) socket.join(`user:${userId}`);
    socket.on('joinBusiness', (businessId) => socket.join(`business:${businessId}`));
  });
}

function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

function emitToBusiness(businessId, event, payload) {
  if (io) io.to(`business:${businessId}`).emit(event, payload);
}

module.exports = { initSocket, emitToUser, emitToBusiness };

