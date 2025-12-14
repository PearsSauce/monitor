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
var is_1 = require("../_util/is");
var utils_1 = require("./utils");
var Marks = function (props) {
    var _a = props.data, data = _a === void 0 ? [] : _a, vertical = props.vertical, prefixCls = props.prefixCls, reverse = props.reverse, intervalConfigs = props.intervalConfigs;
    if (!data.length)
        return null;
    return (react_1.default.createElement("div", { className: prefixCls + "-marks" }, data.map(function (_a) {
        var _b, _c;
        var key = _a.key, content = _a.content;
        var offset = (0, utils_1.formatPercent)((0, utils_1.getIntervalOffset)(+key, intervalConfigs));
        var dom = null;
        if ((0, is_1.isObject)(content) && (0, utils_1.isNotEmpty)(content.text)) {
            dom = content.text;
        }
        else if ((0, utils_1.isNotEmpty)(content)) {
            dom = content;
        }
        return ((0, utils_1.isNotEmpty)(dom) && (react_1.default.createElement("div", { className: prefixCls + "-marks-text", "aria-hidden": true, key: key, style: vertical
                ? (_b = {}, _b[reverse ? 'top' : 'bottom'] = offset, _b) : (_c = {}, _c[reverse ? 'right' : 'left'] = offset, _c), onMouseDown: function (e) {
                e.stopPropagation();
                (0, is_1.isFunction)(props.onMouseDown) && props.onMouseDown(parseFloat(key));
            } }, dom)));
    })));
};
exports.default = (0, react_1.memo)(Marks);
