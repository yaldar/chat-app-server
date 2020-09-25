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
var cookie = require('cookie');
var PORT = 8080;
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const users = ['a'];

// helpers:
const checkExists = (nickname) => users.includes(nickname);

app.get('/api/users', (req, res) => {
  res.json(users).end();
});

app.post('/api/users', (req, res) => {
  const nickname = req.body.nickname;
  const alreadyExists = checkExists(nickname);
  if (alreadyExists) {
    res.status(409).end();
  } else {
    users.push(nickname);
    res.status(201).json({ nickname });
  }
});

io.on('connection', function (socket) {
  socket.on('test', (data) => {
    console.log('on test ran ///');

    console.log(data, socket.id, data);
  });
  socket.on('nickname', (data) => {
    console.log('on nickname ran ///');
    users.includes(data) ? null : users.push(data);
    console.log(users);
  });
});

// might delete later
// app.use((req, res) => {
//   res.status(404).json({ message: 'Page Not Found' });
// });

// app.use((err, req, res, next) => {
//   res
//     .status(500)
//     .json({
//       message: `Something went wrong fetching the data. Try again later. Internal server error: "${err}"`,
//     });
// });

http.listen(PORT, function () {
  console.log('listening on port ' + PORT);
});
