"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var utils_1 = require("../utils");
// get sticky cell's left and right
function useStickyOffsets(columns) {
    var colWidths = columns.map(function (c) { return (0, utils_1.px2Number)(c.width); });
    var colFixed = columns.map(function (c) { return c.fixed; });
    var stickyOffsets = (0, react_1.useMemo)(function () {
        return columns.map(function (column) {
            var offset = 0;
            if (column.fixed === 'left') {
                columns.some(function (col) {
                    if (col.fixed === 'left') {
                        if (col.key === column.key) {
                            return true;
                        }
                        var colWidth = col.$$isOperation ? (0, utils_1.px2Number)(col.width) || 40 : (0, utils_1.px2Number)(col.width);
                        offset += colWidth;
                        return false;
                    }
                    return false;
                });
            }
            if (column.fixed === 'right') {
                __spreadArray([], __read(columns), false).reverse().some(function (col) {
                    if (col.fixed === 'right') {
                        if (col.key === column.key) {
                            return true;
                        }
                        var colWidth = col.$$isOperation ? (0, utils_1.px2Number)(col.width) || 40 : (0, utils_1.px2Number)(col.width);
                        offset += colWidth;
                        return false;
                    }
                    return false;
                });
            }
            return offset;
        });
    }, [colWidths.join('-'), colFixed.join('-')]);
    return stickyOffsets;
}
exports.default = useStickyOffsets;
