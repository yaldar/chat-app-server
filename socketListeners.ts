import Socket from 'socket.io';
import { logger } from './logger';
import util from './util';

const INACTIVITY_TIMEOUT = 10000; // 10 seconds

const startTimer = (
  io: Socket.Server,
  socket: Socket.Socket,
  nickname: string,
) => setTimeout(() => {
  socket.emit('inactivity_disconnect');
  socket.disconnect();
  io.emit('timeout', nickname);
}, INACTIVITY_TIMEOUT);

type MessageType = {
  id: string;
  message: string;
};

const createSocketListeners = (io: Socket.Server) => (
  socket: Socket.Socket,
) => {
  let inactivityTimer;

  socket.on('user_join', (nickname: string) => {
    inactivityTimer = startTimer(io, socket, nickname);
    util.addUser(nickname, socket.id);
    io.emit('user_join', nickname);
    logger.info(`New user joined, id: ${socket.id}, nickname: ${nickname}`);
  });

  socket.on('new_message', (data: MessageType) => {
    const { id, message } = data;
    const nickname = util.getNickname(id);
    clearTimeout(inactivityTimer);

    inactivityTimer = startTimer(io, socket, nickname);

    if (nickname) {
      io.emit('new_message', { nickname, message });
      logger.info(
        `User ${nickname} sent a message "${message}" at ${util.getTime()}. Socket Id: ${id}`,
      );
    } else {
      logger.warn(
        `Socket with id: ${id} attempted to send "${message}" with ${nickname}. No such nickname in the database. Disconnecting socket ${id}`,
      );
      socket.disconnect();
    }
  });

  socket.on('disconnect', () => {
    const { id } = socket;
    const nickname = util.getNickname(id);
    if (nickname) {
      // eslint-disable-next-line no-param-reassign
      util.removeUser(nickname);

      io.emit('user_leave', nickname);
      logger.info(
        `User nickname: ${nickname}, with Id: ${socket.id} disconnected `,
      );
    }
  });
};

export default createSocketListeners;
