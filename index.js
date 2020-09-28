"use strict";
exports.__esModule = true;
var morgan = require('morgan');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var logger = require('./logger').logger;
var util = require('./util');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
var PORT = 8080;
var INACTIVITY_TIMEOUT = 60000;
var http = require('http').createServer(app, {
    pingTimeout: INACTIVITY_TIMEOUT
});
var io = require('socket.io')(http);
app.use(morgan('combined', {
    stream: {
        write: function (meta) {
            logger.info('Request served', meta);
        }
    }
}));
var users = [];
io.on('connection', function (socket) {
    socket.on('new_message', function (data) {
        var id = data.id, message = data.message;
        var nickname = util.getNickname(id, users);
        if (nickname) {
            io.emit('new_message', { nickname: nickname, message: message });
            logger.info("User " + nickname + " sent a message \"" + message + "\" at " + util.getTime() + ". Socket Id: " + id);
        }
        else {
            logger.warn("Socket with id: " + id + " attempted to send \"" + message + "\" with " + nickname + ". No such nickname in the database. Disconnecting socket " + id);
            socket.disconnect();
        }
    });
    socket.on('user_join', function (nickname) {
        users.push({ nickname: nickname, id: socket.id });
        io.emit('user_join', nickname);
        logger.info("New user joined, id: " + socket.id + ", nickname: " + nickname);
    });
    socket.on('disconnect', function () {
        var id = socket.id;
        var nickname = util.getNickname(id, users);
        if (nickname) {
            users = users.filter(function (el) { return el.id.toString() !== id.toString(); });
            io.emit('user_leave', nickname);
            logger.info("User nickname: " + nickname + ", with Id: " + socket.id + " disconnected ");
        }
    });
});
app.get('/api/users', function (req, res) {
    res
        .json(users.map(function (user) { return user.nickname; }))
        .status(200)
        .end();
});
app.get('/api/users/:nickname', function (req, res) {
    var found = users.find(function (el) { return el.nickname === req.params.nickname; });
    if (found) {
        res.status(409).end();
    }
    else {
        res.json(found).status(200).end();
    }
});
app.use(function (req, res) {
    res.status(404).json({ message: 'Page Not Found' });
});
app.use(function (err, req, res, next) {
    logger.error(req.method + " - " + err.message + "  - " + req.originalUrl + " - " + req.ip);
    res.status(500).json({
        message: "Something went wrong fetching the data. Try again later. Internal server error: \"" + err + "\""
    });
});
http.listen(PORT, function () {
    console.log("listening on port " + PORT);
});
process.on('SIGINT', function () { return util.existHandler('SIGINT', logger, io); });
process.on('SIGTERM', function () { return util.existHandler('SIGTERM', logger, io); });
process.on('exist', function () { return util.existHandler('exit', logger, io); });
