"use strict";
exports.__esModule = true;
var Operation;
(function (Operation) {
    Operation["create"] = "insert";
    Operation["update"] = "update";
    Operation["delete"] = "delete";
    // queue that isn't based
    // on a Document being modified
    Operation["named"] = "named";
})(Operation || (Operation = {}));
exports["default"] = Operation;
