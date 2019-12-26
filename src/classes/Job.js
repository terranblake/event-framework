"use strict";
exports.__esModule = true;
var uuid = require("uuid");
var Job = /** @class */ (function () {
    function Job(name, model, operation, data) {
        this.id = Job.generate();
        this.name = name;
        this.model = model;
        this.operation = operation;
        this.data = data;
    }
    Job.generate = function () {
        return uuid.v1();
    };
    return Job;
}());
exports["default"] = Job;
