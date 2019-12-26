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
var Job_1 = require("./Job");
var EventFramework = /** @class */ (function () {
    function EventFramework(url, subscriptions) {
        var _this = this;
        this.queues = [];
        this.RECONNECT_DELAY = 1000;
        this.DEFAULT_QUEUE_OPTIONS = {
            filters: [],
            options: {}
        };
        this.MANDATORY_STREAM_OPTIONS = {
            fullDocument: 'updateLookup'
        };
        this.reconnectMultiplier = 1;
        this.url = url;
        this.subscriptions = subscriptions;
        mongoose.connection.on('disconnected', function () {
            utils_1.logger.info(new Date(), 'disconnected from mongodb');
            _this.reconnect();
        });
        mongoose.connection.on('connected', function () {
            utils_1.logger.info(new Date(), 'connected to mongodb');
            _this.createSubscriptions(subscriptions);
        });
        this.start();
    }
    EventFramework.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.logger.info(new Date(), 'connected to mongodb');
                        return [4 /*yield*/, this.createSubscriptions(this.subscriptions)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EventFramework.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Make sure you're using mongoose >= 5.0.0
                        utils_1.logger.info(new Date(), "mongoose version: " + mongoose.version);
                        // todo: set this up to be used for testing
                        // and have a variant for production
                        // await setupReplicaSet();
                        // if imported as a module we need to handle using the
                        // singleton connection object exposed by mongoose
                        if (mongoose.connection.readyState === 1) {
                            return [2 /*return*/, this.initialize()];
                        }
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EventFramework.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.logger.info(new Date(), 'connecting to mongodb');
                        return [4 /*yield*/, mongoose.connect(this.url)["catch"](console.error)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EventFramework.prototype.reconnect = function () {
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
    EventFramework.convertFiltersToPipeline = function (filters) {
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
                if (field.includes('fullDocument')) {
                    continue;
                }
                var value = filters[i][expressions[0]][field];
                delete filters[i][expressions[0]][field];
                filters[i][expressions[0]]["fullDocument." + field] = value;
            }
        }
        return filters;
    };
    EventFramework.prototype.createSubscriptions = function (subscriptions) {
        if (subscriptions === void 0) { subscriptions = []; }
        return __awaiter(this, void 0, void 0, function () {
            var namedSubscriptions, collectionSubscriptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        namedSubscriptions = subscriptions.filter(function (s) { return s.operation === 'named'; });
                        collectionSubscriptions = subscriptions.filter(function (s) { return s.operation !== 'named'; });
                        // create a mongodb change stream for each subscription
                        // todo: combine both routes into single function which
                        // uses existing formatting to pushes all jobs onto a
                        // queue with a consistent format
                        // todo: figure out how to determine which services are
                        // listening for which collections, with what operation
                        // and with what filters
                        return [4 /*yield*/, this.createChangeStreams(collectionSubscriptions)];
                    case 1:
                        // create a mongodb change stream for each subscription
                        // todo: combine both routes into single function which
                        // uses existing formatting to pushes all jobs onto a
                        // queue with a consistent format
                        // todo: figure out how to determine which services are
                        // listening for which collections, with what operation
                        // and with what filters
                        _a.sent();
                        // create a bull queue for each named subscription
                        return [4 /*yield*/, this.createNamedQueues(namedSubscriptions)];
                    case 2:
                        // create a bull queue for each named subscription
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EventFramework.prototype.createNamedQueues = function (subscriptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, _i, subscriptions_1, subscription;
            return __generator(this, function (_a) {
                _loop_1 = function (subscription) {
                    var name_1 = subscription.name, operation = subscription.operation, model = subscription.model, handler = subscription.handler;
                    var namedQueue = new Bull(name_1);
                    utils_1.logger.info("created new named queue " + name_1 + " for operation " + operation + " on model " + model.modelName);
                    namedQueue.process(function (job) {
                        return __awaiter(this, void 0, void 0, function () {
                            var jobData, formattedJob;
                            return __generator(this, function (_a) {
                                jobData = JSON.parse(JSON.stringify(job.data));
                                formattedJob = new Job_1["default"](name_1, model, operation, jobData);
                                utils_1.logger.info("received job for " + name_1 + " from named queue");
                                handler(formattedJob);
                                return [2 /*return*/];
                            });
                        });
                    });
                    // todo: add completed and failed handling listeners
                    this_1.queues.push(namedQueue);
                };
                this_1 = this;
                // todo: create bull queues with the name and handler provided in the subscription
                // todo: provide more context to named queues with primary model of focus
                for (_i = 0, subscriptions_1 = subscriptions; _i < subscriptions_1.length; _i++) {
                    subscription = subscriptions_1[_i];
                    _loop_1(subscription);
                }
                return [2 /*return*/];
            });
        });
    };
    EventFramework.prototype.createChangeStreams = function (subscriptions) {
        return __awaiter(this, void 0, void 0, function () {
            var collections, collectionNames, _loop_2, this_2, _i, collectionNames_1, name_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongoose.connection.db.listCollections().toArray()];
                    case 1:
                        collections = _a.sent();
                        collectionNames = collections.map(function (c) { return c.name; });
                        _loop_2 = function (name_2) {
                            var collectionSubscriptions, Collection, _loop_3, _i, collectionSubscriptions_1, _a, name_3, filters, handler, operation, options, model;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        collectionSubscriptions = subscriptions.filter(function (s) { return String(pluralize(s.model.modelName)).toLowerCase() === name_2; });
                                        if (!collectionSubscriptions.length) {
                                            utils_1.logger.info("no subscriptions for collection " + name_2);
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, mongoose.connection.db.collection(name_2)];
                                    case 1:
                                        Collection = _b.sent();
                                        _loop_3 = function (name_3, filters, handler, operation, options, model) {
                                            // make sure that we are always including the
                                            // fullDocument option for consistency
                                            // and have default filters and options
                                            var streamOptions = __assign(__assign(__assign({}, this_2.DEFAULT_QUEUE_OPTIONS), options), this_2.MANDATORY_STREAM_OPTIONS);
                                            // reformat raw filters to use the format `fullDocument.FIELD`
                                            // since mongodb isn't smart enough to figure out how to do that?
                                            filters = EventFramework.convertFiltersToPipeline(filters);
                                            // create change stream
                                            utils_1.logger.info("created new change stream " + name_3 + " with filters " + JSON.stringify(filters));
                                            Collection.watch(filters, streamOptions).on(operation, function (job) {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    var jobData, formattedJob;
                                                    return __generator(this, function (_a) {
                                                        if (!job.fullDocument) {
                                                            throw new Error("change stream job was missing reference to fullDocument. failing immediately");
                                                        }
                                                        jobData = JSON.parse(JSON.stringify(job.fullDocument));
                                                        formattedJob = new Job_1["default"](name_3, model, operation, jobData);
                                                        utils_1.logger.info("received job for " + name_3 + " from change stream");
                                                        handler(formattedJob);
                                                        return [2 /*return*/];
                                                    });
                                                });
                                            });
                                        };
                                        // todo: enable further filtering by operationType
                                        // create a job object
                                        // insert in jobs collection
                                        // listen on jobs collection changes
                                        // filter from there into the service
                                        // todo: group subscriptions by filter type
                                        // pipelines have their own unique change streams
                                        // regular mongo queries are either converted to pipelines
                                        // 		or use the same change stream for receiving events
                                        // todo: remove duplicated change streams by comparing filters
                                        // and simply add another handler for an existing change stream
                                        // todo: push all changes from every model into an event stream data model
                                        // create a change stream for each subscription
                                        for (_i = 0, collectionSubscriptions_1 = collectionSubscriptions; _i < collectionSubscriptions_1.length; _i++) {
                                            _a = collectionSubscriptions_1[_i], name_3 = _a.name, filters = _a.filters, handler = _a.handler, operation = _a.operation, options = _a.options, model = _a.model;
                                            _loop_3(name_3, filters, handler, operation, options, model);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _i = 0, collectionNames_1 = collectionNames;
                        _a.label = 2;
                    case 2:
                        if (!(_i < collectionNames_1.length)) return [3 /*break*/, 5];
                        name_2 = collectionNames_1[_i];
                        return [5 /*yield**/, _loop_2(name_2)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return EventFramework;
}());
exports["default"] = EventFramework;
