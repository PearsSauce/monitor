"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var get_1 = __importDefault(require("lodash/get"));
var context_1 = require("./context");
var classNames_1 = __importDefault(require("../../_util/classNames"));
var ConfigProvider_1 = require("../../ConfigProvider");
function Row(props) {
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    var _a = (0, react_1.useContext)(context_1.SummaryContext), columns = _a.columns, stickyOffsets = _a.stickyOffsets, stickyClassNames = _a.stickyClassNames, prefixCls = _a.prefixCls;
    var children = props.children, rest = __rest(props, ["children"]);
    var colSpans = react_1.default.Children.map(children, function (child) { return child.props.colSpan || 1; });
    var element = react_1.default.Children.map(children, function (child, index) {
        var _a, _b;
        var _c, _d;
        var childElement = child;
        // childElement?.props?.$$ArcoTableSummaryCell: Compatible Cell.defaultProps.$$ArcoTableSummaryCell
        var isSummaryCell = (0, get_1.default)(childElement, 'type.__ARCO_TABLE_SUMMARY_CELL__') ||
            (0, get_1.default)(childElement, 'props.$$ArcoTableSummaryCell');
        var childStyle = (_c = childElement === null || childElement === void 0 ? void 0 : childElement.props) === null || _c === void 0 ? void 0 : _c.style;
        var childClassName = (_d = childElement === null || childElement === void 0 ? void 0 : childElement.props) === null || _d === void 0 ? void 0 : _d.className;
        var prevAllColSpan = colSpans.slice(0, index).reduce(function (p, n) { return p + n; }, 0);
        var stickyIndex = prevAllColSpan;
        var stickyStyle = columns[stickyIndex].fixed === 'left'
            ? (_a = {}, _a[rtl ? 'right' : 'left'] = stickyOffsets[stickyIndex], _a) : columns[stickyIndex].fixed === 'right'
            ? (_b = {}, _b[rtl ? 'left' : 'right'] = stickyOffsets[stickyIndex], _b) : {};
        var stickyClassName = columns[stickyIndex].fixed === 'left' || columns[stickyIndex].fixed === 'right'
            ? stickyClassNames[stickyIndex]
            : '';
        return isSummaryCell
            ? react_1.default.cloneElement(childElement, __assign(__assign({}, childElement.props), { className: (0, classNames_1.default)(prefixCls + "-td", stickyClassName, childClassName), style: __assign(__assign({}, childStyle), stickyStyle) }))
            : child;
    });
    return react_1.default.createElement("tr", __assign({}, rest), element);
}
exports.default = Row;
