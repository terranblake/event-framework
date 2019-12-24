"use strict";
exports.__esModule = true;
var Operation;
(function (Operation) {
    Operation[Operation["create"] = 1] = "create";
    Operation[Operation["update"] = 2] = "update";
    Operation[Operation["delete"] = 3] = "delete";
    // queue that isn't based
    // on a Document being modified
    Operation[Operation["named"] = 4] = "named";
})(Operation || (Operation = {}));
exports["default"] = Operation;
