"use strict";
exports.__esModule = true;
var Operation;
(function (Operation) {
    Operation["create"] = "change";
    Operation["update"] = "change";
    Operation["delete"] = "change";
    // queue that isn't based
    // on a Document being modified
    Operation["named"] = "named";
})(Operation || (Operation = {}));
exports["default"] = Operation;
