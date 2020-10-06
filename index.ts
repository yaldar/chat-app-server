/* eslint-disable no-console */
import express from 'express';
import Socket from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { logger } from './logger';
import util from './util';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const PORT = 8080;
const INACTIVITY_TIMEOUT = 1000; // 10 seconds

const server = http.createServer(app);

const io = Socket(server);

app.use(
  morgan('combined', {
    stream: {
      write: (meta: any) => {
        logger.info('Request served', meta);
      },
    },
  }),
);

type UserType = {
  nickname: string;
  id: string;
};

type MessageType = {
  id: string;
  message: string;
};

let users: UserType[] = [];

io.on('connection', (socket) => {
  let inactivityTimer;

  socket.on('user_join', (nickname: string) => {
    inactivityTimer = setTimeout(() => {
      socket.emit('inactivity_disconnect');
      socket.disconnect();
      io.emit('timeout', nickname);
    }, INACTIVITY_TIMEOUT);

    users.push({ nickname, id: socket.id });
    io.emit('user_join', nickname);
    logger.info(`New user joined, id: ${socket.id}, nickname: ${nickname}`);
  });

  socket.on('new_message', (data: MessageType) => {
    const { id, message } = data;
    const nickname = util.getNickname(id, users);
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
      socket.emit('inactivity_disconnect');
      socket.disconnect();
      io.emit('timeout', nickname);
    }, INACTIVITY_TIMEOUT);
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
    const nickname = util.getNickname(id, users);
    if (nickname) {
      users = users.filter((el) => el.id.toString() !== id.toString());

      io.emit('user_leave', nickname);
      logger.info(
        `User nickname: ${nickname}, with Id: ${socket.id} disconnected `,
      );
    }
  });
});

app.get('/api/users', (_req, res) => {
  res
    .json(users.map((user) => user.nickname))
    .status(200)
    .end();
});

app.get('/api/users/:nickname', (req, res) => {
  const found = users.find((el) => el.nickname === req.params.nickname);
  if (found) {
    res.status(409).end();
  } else {
    res.json(found).status(200).end();
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Page Not Found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error(
    `${req.method} - ${err.message}  - ${req.originalUrl} - ${req.ip}`,
  );
  res.status(500).json({
    message: `Something went wrong fetching the data. Try again later. Internal server error: "${err}"`,
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

process.on('SIGINT', () => util.existHandler('SIGINT', logger, io));
process.on('SIGTERM', () => util.existHandler('SIGTERM', logger, io));
process.on('exit', () => util.existHandler('exit', logger, io));
