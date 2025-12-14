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
var classNames_1 = __importDefault(require("../_util/classNames"));
var group_1 = __importStar(require("./group"));
var ConfigProvider_1 = require("../ConfigProvider");
var omit_1 = __importDefault(require("../_util/omit"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var icon_hover_1 = __importDefault(require("../_class/icon-hover"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var is_1 = require("../_util/is");
function Radio(baseProps) {
    var _a;
    var inputRef = (0, react_1.useRef)(null);
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, {}, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Radio);
    var context = (0, react_1.useContext)(group_1.RadioGroupContext);
    var prefixCls = getPrefixCls('radio');
    var mergeProps = __assign({}, props);
    if (context.group) {
        mergeProps.checked = context.value === props.value;
        mergeProps.disabled = 'disabled' in props ? props.disabled : context.disabled;
    }
    var disabled = mergeProps.disabled, children = mergeProps.children, value = mergeProps.value, style = mergeProps.style, className = mergeProps.className, rest = __rest(mergeProps, ["disabled", "children", "value", "style", "className"]);
    var _c = __read((0, useMergeValue_1.default)(false, {
        value: mergeProps.checked,
        defaultValue: mergeProps.defaultChecked,
    }), 2), checked = _c[0], setChecked = _c[1];
    var classNames = (0, classNames_1.default)("" + prefixCls + (context.type === 'button' ? '-button' : ''), (_a = {},
        _a[prefixCls + "-checked"] = checked,
        _a[prefixCls + "-disabled"] = disabled,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var onChange = function (event) {
        var onChange = mergeProps.onChange, value = mergeProps.value;
        if (disabled) {
            return;
        }
        if (context.group) {
            context.onChangeValue && context.onChangeValue(value, event);
        }
        else if (!('checked' in props) && !checked) {
            setChecked(true);
        }
        !checked && onChange && onChange(true, event);
    };
    var onLabelClick = react_1.default.useCallback(function (e) {
        if ((0, is_1.isFunction)(props.children)) {
            // 避免children中含有表单元素造成label无法触发input的onchange的情况
            e.preventDefault();
            inputRef.current && inputRef.current.click();
        }
        rest.onClick && rest.onClick(e);
    }, [props.children, rest.onClick]);
    return (react_1.default.createElement("label", __assign({}, (0, omit_1.default)(rest, ['checked', 'onChange']), { onClick: onLabelClick, style: style, className: classNames }),
        react_1.default.createElement("input", __assign({ ref: inputRef, disabled: disabled, value: value || '', type: "radio" }, (context.name ? { name: context.name } : {}), { checked: checked, onChange: function (event) {
                event.persist();
                onChange(event);
            }, onClick: function (e) {
                e.stopPropagation();
            } })),
        (0, is_1.isFunction)(children) ? (children({ checked: checked })) : context.type === 'radio' ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(icon_hover_1.default, { prefix: prefixCls, className: prefixCls + "-mask-wrapper", disabled: checked || disabled },
                react_1.default.createElement("div", { className: prefixCls + "-mask" })),
            !(0, is_1.isNullOrUndefined)(children) && react_1.default.createElement("span", { className: prefixCls + "-text" }, children))) : (context.type === 'button' && react_1.default.createElement("span", { className: prefixCls + "-button-inner" }, children))));
}
Radio.__BYTE_RADIO = true;
Radio.displayName = 'Radio';
Radio.Group = group_1.default;
Radio.GroupContext = group_1.RadioGroupContext;
exports.default = Radio;
