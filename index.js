'use strict';
exports.__esModule = true;
/* eslint-disable no-console */
// const express = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

var PORT = 8080;
var http = require('http').createServer(app);

var io = require('socket.io')(http);

const users = ['a'];
// let users = [{ nickname: 'a' }];
// NOTIFY WHEN NEW USER JOINS!!!!!!!!!!!!!
// helpers:
// const checkExists = (nickname) => users.find((el) => el.nickname === nickname);
const checkExists = (nickname) => users.includes(nickname);

app.get('/api/users', (req, res) => {
  res.json(users).status(200).end();
  // res.json(users.map((el) => el.nickname)).end();
});

app.post('/api/users', (req, res) => {
  console.log(users);
  const nickname = req.body.nickname;
  const alreadyExists = checkExists(nickname);
  if (alreadyExists) {
    res.status(409).end();
  } else {
    users.push(nickname);
    res.status(201).json({ nickname });
  }
});

io.on('connect', function (socket) {
  // socket.broadcast.emit('new_user', 'new user has joineed');
  socket.on('message', (data) => {
    socket.broadcast.emit(data);
  });

  // socket.on('disconnect', () => {

  // });
});

// might delete later
app.use((req, res) => {
  res.status(404).json({ message: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: `Something went wrong fetching the data. Try again later. Internal server error: "${err}"`,
  });
});

http.listen(PORT, function () {
  console.log('listening on port ' + PORT);
});
