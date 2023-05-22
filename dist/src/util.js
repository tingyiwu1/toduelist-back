"use strict";
exports.__esModule = true;
exports.randString = void 0;
var randString = function (n) {
    return Math.random().toString(36).substring(2, n + 2).toUpperCase();
};
exports.randString = randString;
//# sourceMappingURL=util.js.map