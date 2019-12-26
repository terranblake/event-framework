"use strict";
exports.__esModule = true;
var uuid = require("uuid");
var uuidTime = require('uuid-time');
var Job = /** @class */ (function () {
    function Job(name, model, operation, data) {
        this.id = Job.generate();
        this.name = name;
        this.model = model;
        this.operation = operation;
        this.data = data;
    }
    // generate a time-based identifier
    Job.generate = function () {
        return uuid.v1();
    };
    // get the date from the provided id
    Job.createdAt = function (id) {
        return new Date(uuidTime.v1(id));
    };
    return Job;
}());
exports["default"] = Job;
