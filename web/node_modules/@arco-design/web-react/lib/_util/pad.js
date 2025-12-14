"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padEnd = exports.padStart = void 0;
function padStart(string, length, char) {
    if (char === void 0) { char = ' '; }
    var s = String(string);
    if (!length) {
        return s;
    }
    var newString = s.length < length ? "" + char + s : s;
    return newString.length < length ? padStart(newString, length, char) : newString;
}
exports.padStart = padStart;
function padEnd(string, length, char) {
    if (char === void 0) { char = ' '; }
    var s = String(string);
    if (!length) {
        return s;
    }
    var newString = s.length < length ? "" + s + char : s;
    return newString.length < length ? padEnd(newString, length, char) : newString;
}
exports.padEnd = padEnd;
