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
var react_focus_lock_1 = __importDefault(require("react-focus-lock"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var Tooltip_1 = __importDefault(require("../Tooltip"));
var Button_1 = __importDefault(require("../Button"));
var IconExclamationCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamationCircleFill"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var is_1 = require("../_util/is");
var defaultProps = {
    position: 'top',
    okType: 'primary',
    icon: react_1.default.createElement(IconExclamationCircleFill_1.default, null),
    blurToHide: true,
    unmountOnExit: true,
    trigger: 'click',
    escToClose: true,
};
function Popconfirm(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, locale = _b.locale, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Popconfirm);
    var style = props.style, className = props.className, children = props.children, position = props.position, getPopupContainer = props.getPopupContainer, blurToHide = props.blurToHide, unmountOnExit = props.unmountOnExit, trigger = props.trigger, escToClose = props.escToClose, onVisibleChange = props.onVisibleChange, triggerProps = props.triggerProps, title = props.title, icon = props.icon, okText = props.okText, cancelText = props.cancelText, okType = props.okType, okButtonProps = props.okButtonProps, cancelButtonProps = props.cancelButtonProps, autoFocus = props.autoFocus, focusLock = props.focusLock, content = props.content, rest = __rest(props, ["style", "className", "children", "position", "getPopupContainer", "blurToHide", "unmountOnExit", "trigger", "escToClose", "onVisibleChange", "triggerProps", "title", "icon", "okText", "cancelText", "okType", "okButtonProps", "cancelButtonProps", "autoFocus", "focusLock", "content"]);
    var _c = __read((0, useMergeValue_1.default)(false, {
        defaultValue: props.defaultPopupVisible,
        value: props.popupVisible,
    }), 2), popupVisible = _c[0], setPopupVisible = _c[1];
    var _d = __read((0, react_1.useState)(false), 2), buttonLoading = _d[0], setLoading = _d[1];
    var prefixCls = getPrefixCls('popconfirm');
    var hasContent = !(0, is_1.isNullOrUndefined)(content);
    var handleVisibleChange = function (visible) {
        if (!('popupVisible' in props)) {
            setPopupVisible(visible);
        }
        if (triggerProps && triggerProps.onVisibleChange) {
            triggerProps.onVisibleChange(visible);
        }
        onVisibleChange && onVisibleChange(visible);
    };
    var closePopconfirm = function () {
        handleVisibleChange(false);
    };
    var onCancelPopconfirm = function (e) {
        closePopconfirm();
        props.onCancel && props.onCancel(e);
    };
    var onConfirmPopconfirm = function (e) {
        var _onConfirm = props.onOk || props.onConfirm;
        var ret;
        if (_onConfirm) {
            ret = _onConfirm(e);
        }
        if (ret && ret.then) {
            setLoading(true);
            ret.then(function () {
                closePopconfirm();
            }, function (e) {
                setLoading(false);
                console.error(e);
            });
        }
        if (!ret) {
            closePopconfirm();
        }
    };
    var renderPopconfirmContent = function () {
        var element = (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(Button_1.default, __assign({ onClick: onCancelPopconfirm, size: "mini" }, cancelButtonProps), cancelText || locale.Popconfirm.cancelText),
            react_1.default.createElement(Button_1.default, __assign({ loading: buttonLoading, onClick: onConfirmPopconfirm, size: "mini", type: okType }, okButtonProps), okText || locale.Popconfirm.okText)));
        return (react_1.default.createElement("div", { className: prefixCls + "-wrapper" },
            react_1.default.createElement("div", { className: prefixCls + "-title" },
                icon && react_1.default.createElement("span", { className: prefixCls + "-title-icon" }, icon),
                react_1.default.createElement("div", { className: prefixCls + "-title-text" }, (0, is_1.isFunction)(title) ? title() : title)),
            hasContent && (react_1.default.createElement("div", { className: prefixCls + "-inner-content" }, (0, is_1.isFunction)(content) ? content() : content)),
            focusLock ? (react_1.default.createElement(react_focus_lock_1.default, { returnFocus: true, as: "div", className: prefixCls + "-btn", crossFrame: false, disabled: !popupVisible, autoFocus: !!autoFocus }, element)) : (react_1.default.createElement("div", { className: prefixCls + "-btn" }, element))));
    };
    (0, react_1.useEffect)(function () {
        if (!popupVisible && buttonLoading) {
            setLoading(false);
        }
        return function () {
            setLoading(false);
        };
    }, [popupVisible]);
    return (react_1.default.createElement(Tooltip_1.default, __assign({}, rest, { ref: ref, style: __assign({ maxWidth: 350 }, style), className: (0, classNames_1.default)(className, (_a = {},
            _a[prefixCls + "-rtl"] = rtl,
            _a[prefixCls + "-has-content"] = hasContent,
            _a)), prefixCls: prefixCls, getPopupContainer: getPopupContainer, position: position, trigger: trigger, escToClose: escToClose, popupVisible: popupVisible, content: renderPopconfirmContent, unmountOnExit: unmountOnExit, blurToHide: blurToHide, popupHoverStay: true, triggerProps: triggerProps, onVisibleChange: handleVisibleChange, childrenPrefix: prefixCls }), typeof children === 'string' ? react_1.default.createElement("span", null, children) : children));
}
var PopconfirmComponent = (0, react_1.forwardRef)(Popconfirm);
PopconfirmComponent.displayName = 'Popconfirm';
exports.default = PopconfirmComponent;
