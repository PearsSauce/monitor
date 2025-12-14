"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var constant_1 = require("./constant");
function fixedWidth(width) {
    return typeof width === 'number' || typeof width === 'string'
        ? {
            width: width,
        }
        : {};
}
function ColGroup(props) {
    var colgroupRef = (0, react_1.useRef)();
    var prefixCls = props.prefixCls, columns = props.columns, columnWidths = props.columnWidths, producer = props.producer, expandedRowKeys = props.expandedRowKeys, data = props.data, onSetColumnWidths = props.onSetColumnWidths;
    (0, react_1.useEffect)(function () {
        if (producer && colgroupRef.current) {
            var cols = Array.from(colgroupRef.current.querySelectorAll('col') || []).filter(function (col) {
                return !col.classList.contains(prefixCls + "-expand-icon-col") &&
                    !col.classList.contains(prefixCls + "-selection-col");
            });
            var widths = cols.map(function (col) {
                var width = col.getBoundingClientRect().width;
                return width;
            });
            onSetColumnWidths(widths);
        }
    }, [producer, onSetColumnWidths, prefixCls, expandedRowKeys, data, columns]);
    var mainColIndex = 0;
    return (react_1.default.createElement("colgroup", { ref: colgroupRef }, columns.map(function (col, index) {
        var _a;
        if (col.title === constant_1.INTERNAL_EXPAND_KEY) {
            return (react_1.default.createElement("col", { key: constant_1.INTERNAL_EXPAND_KEY, className: prefixCls + "-expand-icon-col", style: fixedWidth(col.width) }));
        }
        if (col.title === constant_1.INTERNAL_SELECTION_KEY) {
            return (react_1.default.createElement("col", { key: constant_1.INTERNAL_SELECTION_KEY, className: prefixCls + "-selection-col", style: fixedWidth(col.width) }));
        }
        var width;
        if (col.width) {
            width = col.width;
        }
        else if (!producer && columnWidths) {
            width = columnWidths[mainColIndex];
        }
        mainColIndex++;
        return react_1.default.createElement("col", { key: (_a = col.key) !== null && _a !== void 0 ? _a : index, style: fixedWidth(width) });
    })));
}
exports.default = ColGroup;
