"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Replace empty string to &nbsp;
function default_1(str) {
    return typeof str === 'string'
        ? str.replace(/(\s{2,})|(\s{1,}$)/g, function ($0) { return '\u00A0'.repeat($0.length); })
        : str;
}
exports.default = default_1;
