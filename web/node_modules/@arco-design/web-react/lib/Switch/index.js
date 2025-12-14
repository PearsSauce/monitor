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
var react_transition_group_1 = require("react-transition-group");
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var omit_1 = __importDefault(require("../_util/omit"));
var ConfigProvider_1 = require("../ConfigProvider");
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var defaultProps = {
    type: 'circle',
};
function Switch(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, ctxSize = _b.size, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Switch);
    var className = props.className, children = props.children, _c = props.style, style = _c === void 0 ? {} : _c, disabled = props.disabled, propSize = props.size, loading = props.loading, onChange = props.onChange, type = props.type, checkedText = props.checkedText, uncheckedText = props.uncheckedText, checkedIcon = props.checkedIcon, uncheckedIcon = props.uncheckedIcon, rest = __rest(props, ["className", "children", "style", "disabled", "size", "loading", "onChange", "type", "checkedText", "uncheckedText", "checkedIcon", "uncheckedIcon"]);
    var prefixCls = getPrefixCls('switch');
    var size = propSize || ctxSize;
    var _d = __read((0, react_1.useState)(props.defaultChecked), 2), checked = _d[0], setChecked = _d[1];
    var mergedChecked = 'checked' in props ? props.checked : checked;
    var onHandleClick = function (event) {
        if (loading) {
            return;
        }
        props.onClick && props.onClick(event);
        if (!('checked' in props)) {
            setChecked(!mergedChecked);
        }
        onChange && onChange(!mergedChecked, event);
    };
    var classNames = (0, classNames_1.default)(prefixCls, size === 'small' ? prefixCls + "-" + size : undefined, (_a = {},
        _a[prefixCls + "-type-" + type] = type,
        _a[prefixCls + "-checked"] = mergedChecked,
        _a[prefixCls + "-loading"] = loading,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var checkedElement = checkedText;
    var unCheckedElement = uncheckedText;
    // 支持通过 children 传入 checkedText 和 uncheckedText，不过建议直接使用参数 checkedText 和 uncheckedText
    if (children && (0, is_1.isArray)(children)) {
        checkedElement = children.find(function (child) { return child.key === 'open'; });
        unCheckedElement = children.find(function (child) { return child.key === 'close'; });
    }
    else if (children && (0, is_1.isObject)(children)) {
        if (children.key === 'open') {
            checkedElement = children;
        }
        else if (children.key === 'close') {
            unCheckedElement = children;
        }
    }
    var extraProps = (0, omit_1.default)(rest, ['onChange', 'checked', 'error']);
    return (react_1.default.createElement("button", __assign({ ref: ref, role: "switch", "aria-checked": !!mergedChecked, tabIndex: loading ? -1 : undefined }, extraProps, { style: style, className: classNames, disabled: disabled, onClick: onHandleClick, type: "button" }),
        react_1.default.createElement("div", { className: prefixCls + "-dot" },
            !loading && (checkedIcon || uncheckedIcon) && (react_1.default.createElement(react_transition_group_1.SwitchTransition, null,
                react_1.default.createElement(CSSTransition_1.default, { key: mergedChecked ? 'checked' : 'unchecked', classNames: "fadeIn", timeout: 200 },
                    react_1.default.createElement("span", { className: prefixCls + "-dot-icon" }, mergedChecked ? checkedIcon : uncheckedIcon)))),
            loading && (react_1.default.createElement("span", { className: prefixCls + "-dot-icon" },
                react_1.default.createElement(IconLoading_1.default, null)))),
        size !== 'small' && type !== 'line' && (checkedElement || unCheckedElement) && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: prefixCls + "-text-holder" },
                checkedElement && mergedChecked && checkedElement,
                unCheckedElement && !mergedChecked && unCheckedElement),
            react_1.default.createElement(CSSTransition_1.default, { in: mergedChecked, classNames: "switchSlideText", timeout: 200 },
                react_1.default.createElement("div", { className: prefixCls + "-text" },
                    checkedElement && mergedChecked && checkedElement,
                    unCheckedElement && !mergedChecked && unCheckedElement))))));
}
var ForwardRefSwitch = (0, react_1.forwardRef)(Switch);
var SwitchComponent = ForwardRefSwitch;
SwitchComponent.__BYTE_SWITCH = true;
SwitchComponent.displayName = 'Switch';
exports.default = SwitchComponent;
