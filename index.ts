/* eslint-disable no-console */
// const express = require('express');
import * as express from 'express';
import * as socket from 'socket-io';

const app = express();
const cookie = require('cookie');

const PORT = 8080;

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.use((socket, next) => {
  console.log(socket);
});
io.on('connection', (socket) => {
  socket.on('test', () => {
    console.log(cookie);
  });
});

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
