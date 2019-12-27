"use strict";
exports.__esModule = true;
var Bull = require('bull');
exports.Queue = Bull;
var Events_1 = require("./src/classes/Events");
exports.Events = Events_1["default"];
var IOperation_1 = require("./src/enums/IOperation");
exports.Operation = IOperation_1["default"];
