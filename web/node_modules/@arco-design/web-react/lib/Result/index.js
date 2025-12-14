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
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var IconCheck_1 = __importDefault(require("../../icon/react-icon-cjs/IconCheck"));
var IconExclamation_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamation"));
var IconInfo_1 = __importDefault(require("../../icon/react-icon-cjs/IconInfo"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
var _404_1 = __importDefault(require("./404"));
var _403_1 = __importDefault(require("./403"));
var _500_1 = __importDefault(require("./500"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var defaultIcons = {
    success: react_1.default.createElement(IconCheck_1.default, null),
    info: react_1.default.createElement(IconInfo_1.default, null),
    warning: react_1.default.createElement(IconExclamation_1.default, null),
    error: react_1.default.createElement(IconClose_1.default, null),
    '404': react_1.default.createElement(_404_1.default, null),
    '403': react_1.default.createElement(_403_1.default, null),
    '500': react_1.default.createElement(_500_1.default, null),
};
var defaultProps = {
    status: 'info',
};
function Result(baseProps, ref) {
    var _a, _b;
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, componentConfig = _c.componentConfig, rtl = _c.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Result);
    var className = props.className, style = props.style, status = props.status, title = props.title, subTitle = props.subTitle, extra = props.extra, children = props.children, propsIcon = props.icon, rest = __rest(props, ["className", "style", "status", "title", "subTitle", "extra", "children", "icon"]);
    var prefixCls = getPrefixCls('result');
    var icon = 'icon' in props ? propsIcon : defaultIcons[status];
    return (react_1.default.createElement("div", __assign({ ref: ref, className: (0, classNames_1.default)(prefixCls, (_a = {},
            _a[prefixCls + "-is-" + status] = status,
            _a[prefixCls + "-rtl"] = rtl,
            _a), className), style: style }, rest),
        icon && (react_1.default.createElement("div", { className: prefixCls + "-icon" },
            react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-icon-tip", (_b = {},
                    _b[prefixCls + "-icon-" + status] = status,
                    _b[prefixCls + "-icon-custom"] = status === null,
                    _b)) }, icon))),
        title && react_1.default.createElement("div", { className: prefixCls + "-title" }, title),
        subTitle && react_1.default.createElement("div", { className: prefixCls + "-subtitle" }, subTitle),
        extra && react_1.default.createElement("div", { className: prefixCls + "-extra" }, extra),
        children && react_1.default.createElement("div", { className: prefixCls + "-content" }, children)));
}
var ResultRef = (0, react_1.forwardRef)(Result);
ResultRef.displayName = 'Result';
exports.default = ResultRef;
