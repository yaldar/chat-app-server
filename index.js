"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
var express_1 = __importDefault(require("express"));
var socket_io_1 = __importDefault(require("socket.io"));
var morgan_1 = __importDefault(require("morgan"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var http_1 = __importDefault(require("http"));
var logger_1 = require("./logger");
var util_1 = __importDefault(require("./util"));
var app = express_1["default"]();
app.use(body_parser_1["default"].urlencoded({ extended: false }));
app.use(body_parser_1["default"].json());
app.use(cors_1["default"]());
var PORT = 8080;
var INACTIVITY_TIMEOUT = 1000; // 10 seconds
var server = http_1["default"].createServer(app);
var io = socket_io_1["default"](server);
var startTimer = function (timer, socket, nickname) { };
app.use(morgan_1["default"]('combined', {
    stream: {
        write: function (meta) {
            logger_1.logger.info('Request served', meta);
        }
    }
}));
var users = [];
io.on('connection', function (socket) {
    var inactivityTimer;
    socket.on('user_join', function (nickname) {
        inactivityTimer = setTimeout(function () {
            socket.emit('inactivity_disconnect');
            socket.disconnect();
            io.emit('timeout', nickname);
        }, INACTIVITY_TIMEOUT);
        users.push({ nickname: nickname, id: socket.id });
        io.emit('user_join', nickname);
        logger_1.logger.info("New user joined, id: " + socket.id + ", nickname: " + nickname);
    });
    socket.on('new_message', function (data) {
        var id = data.id, message = data.message;
        var nickname = util_1["default"].getNickname(id, users);
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function () {
            socket.emit('inactivity_disconnect');
            socket.disconnect();
            io.emit('timeout', nickname);
        }, INACTIVITY_TIMEOUT);
        if (nickname) {
            io.emit('new_message', { nickname: nickname, message: message });
            logger_1.logger.info("User " + nickname + " sent a message \"" + message + "\" at " + util_1["default"].getTime() + ". Socket Id: " + id);
        }
        else {
            logger_1.logger.warn("Socket with id: " + id + " attempted to send \"" + message + "\" with " + nickname + ". No such nickname in the database. Disconnecting socket " + id);
            socket.disconnect();
        }
    });
    socket.on('disconnect', function () {
        var id = socket.id;
        var nickname = util_1["default"].getNickname(id, users);
        if (nickname) {
            users = users.filter(function (el) { return el.id.toString() !== id.toString(); });
            io.emit('user_leave', nickname);
            logger_1.logger.info("User nickname: " + nickname + ", with Id: " + socket.id + " disconnected ");
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
app.use(function (err, req, res, _next) {
    logger_1.logger.error(req.method + " - " + err.message + "  - " + req.originalUrl + " - " + req.ip);
    res.status(500).json({
        message: "Something went wrong fetching the data. Try again later. Internal server error: \"" + err + "\""
    });
});
server.listen(PORT, function () {
    console.log("listening on port " + PORT);
});
process.on('SIGINT', function () { return util_1["default"].existHandler('SIGINT', logger_1.logger, io); });
process.on('SIGTERM', function () { return util_1["default"].existHandler('SIGTERM', logger_1.logger, io); });
process.on('exit', function () { return util_1["default"].existHandler('exit', logger_1.logger, io); });
