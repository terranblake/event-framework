"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var mongoose = require("mongoose");
var Bull = require('bull');
var pluralize = require('pluralize');
var utils_1 = require("@postilion/utils");
var IOperation_1 = require("../enums/IOperation");
var Job_1 = require("./Job");
var Events = /** @class */ (function () {
    function Events(subscriptions, options) {
        var _this = this;
        this.url = String();
        this.subscriptions = [];
        this.options = {
            redis: String(process.env.MONGODB || 'mongodb://localhost:27017/db'),
            mongodb: String(process.env.REDIS) || 'redis://localhost:6379'
        };
        this.RECONNECT_DELAY = 1000;
        this.DEFAULT_QUEUE_OPTIONS = {
            filters: [],
            options: {}
        };
        this.MANDATORY_STREAM_OPTIONS = {
            fullDocument: 'updateLookup'
        };
        this.reconnectMultiplier = 1;
        this.subscriptions = subscriptions;
        // if the caller only defines 1 of the fields, then
        // we want to use the default for the remaining fields
        this.options = __assign(__assign({}, options), this.options);
        mongoose.connection.on('disconnected', function () {
            utils_1.logger.info(new Date(), 'disconnected from mongodb');
            _this.reconnect();
        });
        mongoose.connection.on('connected', function () {
            utils_1.logger.info(new Date(), 'connected to mongodb');
            _this.createSubscriptions();
        });
        this.start();
    }
    Events.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (mongoose.connection.readyState === 1) {
                            utils_1.logger.info(new Date(), 'already connected to mongodb');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // deprecating manual mongodb connections because this
    // should be managed by the stores module. all modules
    // which use any of the stores should gracefully handle
    // a disconnected state without crashing anything
    Events.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.logger.info(new Date(), 'connecting to mongodb');
                        return [4 /*yield*/, mongoose.connect(this.options.mongodb)["catch"](console.error)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Events.prototype.reconnect = function () {
        var _this = this;
        setTimeout(function () {
            if (mongoose.connection.readyState === 1) {
                utils_1.logger.info(new Date(), 'already connected to mongodb. skipping connection attempt');
                return;
            }
            utils_1.logger.info(new Date(), 'reconnecting to mongodb');
            _this.start()["catch"](function (err) {
                _this.latestMongoError = err;
                _this.reconnectMultiplier = 1;
                console.error(new Date(), err);
                // delay connect time so we aren't hammering the db with connections
                if (_this.latestMongoError.name === 'MongoError' && _this.latestMongoError.message.includes('no primary found')) {
                    _this.reconnectMultiplier = 4;
                }
            });
        }, this.RECONNECT_DELAY * this.reconnectMultiplier);
    };
    Events.convertFiltersToPipeline = function (filters) {
        if (!filters.length) {
            return [];
        }
        for (var i in filters) {
            var stage = filters[i];
            var expressions = Object.keys(stage);
            // only get the first expression
            // because i haven't used a filters
            // with more than 1 expression
            var expression = stage[expressions[0]];
            // todo: add support for more complex
            // filters that have nested expressions
            for (var _i = 0, _a = Object.keys(expression); _i < _a.length; _i++) {
                var field = _a[_i];
                // todo: remove this because it could cause bugs in the future
                // if models have a field called operation. this would break
                // all event listeners who try to filter using this
                if (['fullDocument'].includes(field)) {
                    continue;
                }
                var value = filters[i][expressions[0]][field];
                delete filters[i][expressions[0]][field];
                filters[i][expressions[0]]["fullDocument." + field] = value;
            }
        }
        return filters;
    };
    Events.prototype.createSubscriptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, subscription;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.subscriptions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        subscription = _a[_i];
                        return [4 /*yield*/, this.subscribe(subscription)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Events.prototype.subscribe = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // handle what to do when we haven't connected to mongodb yet
                        if (mongoose.connection.readyState !== 1) {
                            return [2 /*return*/, this.reconnect()];
                        }
                        if (!(subscription.operation === IOperation_1["default"].named)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createNamedQueue(subscription)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.createChangeStream(subscription)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Events.prototype.createNamedQueue = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var name, operation, model, handler, options, namedQueue;
            return __generator(this, function (_a) {
                name = subscription.name, operation = subscription.operation, model = subscription.model, handler = subscription.handler, options = subscription.options;
                namedQueue = new Bull(name, options.redis || this.options.redis);
                utils_1.logger.info("created new named queue " + name + " for operation " + operation + " on model " + model.modelName);
                namedQueue.process('*', function (job) {
                    return __awaiter(this, void 0, void 0, function () {
                        var jobData, formattedJob;
                        return __generator(this, function (_a) {
                            jobData = JSON.parse(JSON.stringify(job.data));
                            formattedJob = new Job_1["default"](name, model, operation, jobData);
                            utils_1.logger.info("received job for " + name + " from named queue");
                            handler(formattedJob);
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    Events.prototype.createChangeStream = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var name, filters, handler, operation, options, model, pluralName, Collection, streamOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = subscription.name, filters = subscription.filters, handler = subscription.handler, operation = subscription.operation, options = subscription.options, model = subscription.model;
                        pluralName = String(pluralize(model.modelName)).toLowerCase();
                        return [4 /*yield*/, mongoose.connection.db.collection(pluralName)];
                    case 1:
                        Collection = _a.sent();
                        streamOptions = __assign(__assign(__assign({}, this.DEFAULT_QUEUE_OPTIONS), options), this.MANDATORY_STREAM_OPTIONS);
                        // reformat raw filters to use the format `fullDocument.FIELD`
                        // since mongodb isn't smart enough to figure out how to do that?
                        filters = Events.convertFiltersToPipeline(filters);
                        // add the operation type filtering to the beginning of the pipeline
                        // since it has the lowest computational complexity
                        filters.unshift({
                            $match: {
                                operationType: operation
                            }
                        });
                        // create change stream
                        utils_1.logger.info("created new change stream " + name + " with filters " + JSON.stringify(filters));
                        Collection.watch(filters, streamOptions).on('change', function (job) {
                            return __awaiter(this, void 0, void 0, function () {
                                var jobData, formattedJob;
                                return __generator(this, function (_a) {
                                    if (!job.fullDocument) {
                                        throw new Error("change stream job was missing reference to fullDocument. failing immediately");
                                    }
                                    jobData = JSON.parse(JSON.stringify(job.fullDocument));
                                    formattedJob = new Job_1["default"](name, model, operation, jobData);
                                    utils_1.logger.info("received job for " + name + " from change stream");
                                    handler(formattedJob);
                                    return [2 /*return*/];
                                });
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Events;
}());
exports["default"] = Events;
