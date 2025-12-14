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
exports.ClearRadioGroupContext = exports.RadioGroupContext = void 0;
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var radio_1 = __importDefault(require("./radio"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
var constant_1 = require("../_util/constant");
var defaultContextValue = {
    type: 'radio',
};
var defaultProps = {
    type: 'radio',
    mode: 'outline',
    direction: 'horizontal',
};
exports.RadioGroupContext = (0, react_1.createContext)(defaultContextValue);
var ClearRadioGroupContext = function (_a) {
    var children = _a.children;
    return react_1.default.createElement(exports.RadioGroupContext.Provider, { children: children, value: defaultContextValue });
};
exports.ClearRadioGroupContext = ClearRadioGroupContext;
function Group(baseProps) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, ctxSize = _b.size, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Radio.Group']);
    var style = props.style, className = props.className, name = props.name, children = props.children, direction = props.direction, type = props.type, mode = props.mode, options = props.options, disabled = props.disabled;
    var _c = __read((0, useMergeValue_1.default)(undefined, {
        defaultValue: props.defaultValue,
        value: props.value,
    }), 2), value = _c[0], setValue = _c[1];
    var size = props.size || ctxSize;
    var prefixCls = getPrefixCls('radio');
    var classNames = (0, classNames_1.default)(prefixCls + "-group", (_a = {},
        _a[prefixCls + "-group-type-button"] = type !== 'radio',
        _a[prefixCls + "-size-" + size] = !!size,
        _a[prefixCls + "-mode-" + mode] = !!mode,
        _a[prefixCls + "-group-disabled"] = disabled,
        _a[prefixCls + "-group-direction-vertical"] = direction === 'vertical',
        _a[prefixCls + "-group-rtl"] = rtl,
        _a), className);
    var onChangeValue = function (v, event) {
        var onChange = props.onChange;
        if (v !== value) {
            if (!('value' in props)) {
                setValue(v);
            }
            onChange && onChange(v, event);
        }
    };
    var contextProp = {
        onChangeValue: onChangeValue,
        type: type,
        value: value,
        disabled: disabled,
        group: true,
        name: name,
    };
    return (react_1.default.createElement(exports.RadioGroupContext.Provider, { value: contextProp },
        react_1.default.createElement("div", __assign({ className: classNames, role: "radiogroup", style: style }, (0, constant_1.pickTriggerPropsFromRest)(props), (0, pick_1.pickDataAttributes)(props)), options && (0, is_1.isArray)(options)
            ? options.map(function (option, index) {
                if ((0, is_1.isObject)(option)) {
                    return (react_1.default.createElement(radio_1.default, { key: option.value, disabled: disabled || option.disabled, value: option.value }, option.label));
                }
                return (react_1.default.createElement(radio_1.default, { key: index, value: option, disabled: disabled }, option));
            })
            : children)));
}
Group.displayName = 'RadioGroup';
exports.default = Group;
