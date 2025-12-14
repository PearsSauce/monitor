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
var IconLink_1 = __importDefault(require("../../icon/react-icon-cjs/IconLink"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var defaultProps = {
    hoverable: true,
};
function Link(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Link);
    var className = props.className, style = props.style, children = props.children, icon = props.icon, status = props.status, disabled = props.disabled, hoverable = props.hoverable, rest = __rest(props, ["className", "style", "children", "icon", "status", "disabled", "hoverable"]);
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)({ onKeyDown: props.onKeyDown });
    var prefixCls = getPrefixCls('link');
    var TagWrapper = 'href' in props ? 'a' : 'span';
    var handleClick = function (e) {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
        }
        else {
            props.onClick && props.onClick(e);
        }
    };
    return (react_1.default.createElement(TagWrapper, __assign({ className: (0, classNames_1.default)(prefixCls, (_a = {},
            _a[prefixCls + "-disabled"] = disabled,
            _a[prefixCls + "-is-" + status] = status,
            _a[prefixCls + "-with-icon"] = icon,
            _a[prefixCls + "-hoverless"] = !hoverable,
            _a[prefixCls + "-rtl"] = rtl,
            _a), className), ref: ref, tabIndex: disabled ? -1 : undefined }, rest, { style: style, onClick: handleClick }, getKeyboardEvents({
        onPressEnter: handleClick,
    })),
        icon ? (react_1.default.createElement("span", { className: prefixCls + "-icon" }, icon === true ? react_1.default.createElement(IconLink_1.default, null) : icon)) : null,
        children));
}
var LinkRef = (0, react_1.forwardRef)(Link);
LinkRef.displayName = 'Link';
exports.default = LinkRef;
