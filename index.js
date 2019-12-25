"use strict";
exports.__esModule = true;
var Bull = require('bull');
exports.Queue = Bull;
var EventFramework_1 = require("./src/classes/EventFramework");
exports.EventFramework = EventFramework_1["default"];
var IOperation_1 = require("./src/interfaces/IOperation");
exports.Operation = IOperation_1["default"];
