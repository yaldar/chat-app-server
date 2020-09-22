"use strict";
exports.__esModule = true;
/* eslint-disable no-console */
var express_1 = require("express");
var app = express_1["default"]();
var PORT = 3000;
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(PORT, function () {
    console.log("Example app listening at http://localhost:" + PORT);
});
