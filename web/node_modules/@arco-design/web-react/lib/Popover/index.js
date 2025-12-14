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
var Tooltip_1 = __importDefault(require("../Tooltip"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var defaultProps = {
    position: 'top',
    trigger: 'hover',
    unmountOnExit: true,
};
function Popover(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Popover);
    var style = props.style, className = props.className, children = props.children, position = props.position, getPopupContainer = props.getPopupContainer, trigger = props.trigger, defaultPopupVisible = props.defaultPopupVisible, popupVisible = props.popupVisible, triggerProps = props.triggerProps, unmountOnExit = props.unmountOnExit, onVisibleChange = props.onVisibleChange, content = props.content, title = props.title, rest = __rest(props, ["style", "className", "children", "position", "getPopupContainer", "trigger", "defaultPopupVisible", "popupVisible", "triggerProps", "unmountOnExit", "onVisibleChange", "content", "title"]);
    var prefixCls = getPrefixCls('popover');
    var usedTitle = (0, is_1.isFunction)(title) ? title() : title;
    var usedContent = (0, is_1.isFunction)(content) ? content() : content;
    var renderContent = (0, is_1.isEmptyReactNode)(usedTitle, true) && (0, is_1.isEmptyReactNode)(usedContent, true) ? null : (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-inner", (_a = {}, _a[prefixCls + "-inner-rtl"] = rtl, _a)) },
        usedTitle ? react_1.default.createElement("div", { className: prefixCls + "-title" }, usedTitle) : null,
        react_1.default.createElement("div", { className: prefixCls + "-inner-content" }, usedContent)));
    return (react_1.default.createElement(Tooltip_1.default, __assign({}, rest, { ref: ref, style: __assign({ maxWidth: 350 }, style), className: className, prefixCls: prefixCls, getPopupContainer: getPopupContainer, position: position, trigger: trigger, content: renderContent, popupHoverStay: true, unmountOnExit: unmountOnExit, triggerProps: triggerProps, defaultPopupVisible: defaultPopupVisible, onVisibleChange: onVisibleChange || (triggerProps ? triggerProps.onVisibleChange : undefined), childrenPrefix: prefixCls }, ('popupVisible' in props ? { popupVisible: popupVisible } : {})), typeof children === 'string' ? react_1.default.createElement("span", null, children) : children));
}
var PopoverComponent = (0, react_1.forwardRef)(Popover);
PopoverComponent.displayName = 'Popover';
exports.default = PopoverComponent;
