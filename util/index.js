"use strict";
exports.__esModule = true;
var winston = require('winston');
var getNickname = function (id, users) {
    var found = users.find(function (u) { return u.id === id; });
    if (found) {
        return found.nickname;
    }
    return null;
};
var getTime = function () {
    var today = new Date();
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    return date;
};
var existHandler = function (code, logger, io) {
    logger.info("Shutting down on " + code);
    io.emit('server_shutdown');
    io.close();
};
module.exports = {
    getNickname: getNickname,
    getTime: getTime,
    existHandler: existHandler
};
exports["default"] = { getNickname: getNickname, getTime: getTime, existHandler: existHandler };
