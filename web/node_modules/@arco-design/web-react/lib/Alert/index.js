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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var IconCheckCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconCheckCircleFill"));
var IconCloseCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconCloseCircleFill"));
var IconInfoCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconInfoCircleFill"));
var IconExclamationCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamationCircleFill"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var defaultProps = {
    showIcon: true,
    type: 'info',
};
function Alert(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Alert);
    var style = props.style, className = props.className, action = props.action, _c = props.type, type = _c === void 0 ? 'info' : _c, title = props.title, content = props.content, icon = props.icon, showIcon = props.showIcon, closable = props.closable, closeable = props.closeable, afterClose = props.afterClose, onClose = props.onClose, closeElement = props.closeElement, banner = props.banner, rest = __rest(props, ["style", "className", "action", "type", "title", "content", "icon", "showIcon", "closable", "closeable", "afterClose", "onClose", "closeElement", "banner"]);
    var prefixCls = getPrefixCls('alert');
    var _d = __read((0, react_1.useState)(true), 2), visible = _d[0], setVisible = _d[1];
    function renderIcon(type) {
        if (icon) {
            return icon;
        }
        switch (type) {
            case 'info':
                return react_1.default.createElement(IconInfoCircleFill_1.default, null);
            case 'success':
                return react_1.default.createElement(IconCheckCircleFill_1.default, null);
            case 'warning':
                return react_1.default.createElement(IconExclamationCircleFill_1.default, null);
            case 'error':
                return react_1.default.createElement(IconCloseCircleFill_1.default, null);
            default:
                return null;
        }
    }
    function onHandleClose(e) {
        setVisible(false);
        onClose === null || onClose === void 0 ? void 0 : onClose(e);
    }
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-" + type, (_a = {},
        _a[prefixCls + "-with-title"] = title,
        _a[prefixCls + "-banner"] = banner,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var _closable = 'closeable' in props ? closeable : closable;
    return (react_1.default.createElement(CSSTransition_1.default, { in: visible, timeout: 300, classNames: "zoomInTop", unmountOnExit: true, onExited: function () {
            afterClose === null || afterClose === void 0 ? void 0 : afterClose();
        } },
        react_1.default.createElement("div", __assign({ ref: ref, style: style, className: classNames, role: "alert" }, rest),
            showIcon && react_1.default.createElement("div", { className: prefixCls + "-icon-wrapper" }, renderIcon(type)),
            react_1.default.createElement("div", { className: prefixCls + "-content-wrapper" },
                title && react_1.default.createElement("div", { className: prefixCls + "-title" }, title),
                content && react_1.default.createElement("div", { className: prefixCls + "-content" }, content)),
            action && react_1.default.createElement("div", { className: prefixCls + "-action" }, action),
            _closable && (react_1.default.createElement("button", { type: "button", onClick: onHandleClose, className: prefixCls + "-close-btn" }, closeElement || react_1.default.createElement(IconClose_1.default, null))))));
}
var AlertComponent = (0, react_1.forwardRef)(Alert);
AlertComponent.displayName = 'Alert';
exports.default = AlertComponent;
