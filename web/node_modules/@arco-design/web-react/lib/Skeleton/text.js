"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var is_1 = require("../_util/is");
var classNames_1 = __importDefault(require("../_util/classNames"));
function text(props) {
    var style = props.style, _a = props.width, width = _a === void 0 ? '60%' : _a, _b = props.rows, rows = _b === void 0 ? 3 : _b, className = props.className, prefixCls = props.prefixCls;
    var classNames = (0, classNames_1.default)(prefixCls + "-text", className);
    var nodes = [];
    function getTextWidth(index) {
        if ((0, is_1.isArray)(width)) {
            return width[index];
        }
        if (rows - 1 === index) {
            return width;
        }
        return undefined;
    }
    for (var i = 0; i < rows; i++) {
        nodes.push(react_1.default.createElement("li", { className: prefixCls + "-text-row", key: i, style: { width: getTextWidth(i) } }));
    }
    return (react_1.default.createElement("ul", { className: classNames, style: style }, nodes));
}
exports.default = text;
