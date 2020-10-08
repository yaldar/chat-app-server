/* eslint-disable no-console */
import express from 'express';
import Socket from 'socket.io';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { logger } from './logger';
import util from './util';
import createRouter from './router';
import createSocketListeners from './socketListeners';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

util.initDataBase();

app.use(createRouter);

const PORT = process.env.PORT || 8080;
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

io.on('connection', createSocketListeners(io));

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
