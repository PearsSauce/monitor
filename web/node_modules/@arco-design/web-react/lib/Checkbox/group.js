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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearCheckboxGroupContext = exports.CheckboxGroupContext = void 0;
var react_1 = __importStar(require("react"));
var checkbox_1 = __importDefault(require("./checkbox"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var is_1 = require("../_util/is");
var constant_1 = require("../_util/constant");
var defaultContextValue = {
    isCheckboxGroup: false,
    checkboxGroupValue: [],
    onGroupChange: function () { },
    registerValue: function () { },
    unRegisterValue: function () { },
};
exports.CheckboxGroupContext = (0, react_1.createContext)(defaultContextValue);
var ClearCheckboxGroupContext = function (_a) {
    var children = _a.children;
    return react_1.default.createElement(exports.CheckboxGroupContext.Provider, { children: children, value: defaultContextValue });
};
exports.ClearCheckboxGroupContext = ClearCheckboxGroupContext;
function Group(props) {
    var _a;
    var _b = __read((0, useMergeValue_1.default)([], {
        defaultValue: 'defaultValue' in props ? props.defaultValue || [] : undefined,
        value: 'value' in props ? props.value || [] : undefined,
    }), 2), value = _b[0], setValue = _b[1];
    var _c = __read((0, react_1.useState)([]), 2), allOptionValues = _c[0], setAllOptionValues = _c[1];
    var _d = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _d.getPrefixCls, rtl = _d.rtl;
    var disabled = props.disabled, options = props.options, style = props.style, className = props.className, error = props.error, children = props.children, _e = props.direction, direction = _e === void 0 ? 'horizontal' : _e;
    var prefixCls = getPrefixCls('checkbox');
    var classNames = (0, classNames_1.default)(prefixCls + "-group", (_a = {},
        _a[prefixCls + "-group-is-error"] = error,
        _a[prefixCls + "-group-direction-" + direction] = direction,
        _a[prefixCls + "-group-rtl"] = rtl,
        _a), className);
    var onChange = (0, react_1.useCallback)(function (optionValue, checked, e) {
        var newVal = value.slice();
        if (checked) {
            newVal.push(optionValue);
        }
        else {
            newVal.splice(value.indexOf(optionValue), 1);
        }
        setValue(newVal);
        props.onChange &&
            props.onChange(newVal.filter(function (v) { return allOptionValues.indexOf(v) > -1; }), e);
    }, [value, props.onChange, allOptionValues]);
    return (react_1.default.createElement("span", __assign({ className: classNames, style: style }, (0, constant_1.pickTriggerPropsFromRest)(props)),
        react_1.default.createElement(exports.CheckboxGroupContext.Provider, { value: {
                isCheckboxGroup: true,
                checkboxGroupValue: value,
                onGroupChange: onChange,
                disabled: disabled,
                registerValue: function (value) {
                    setAllOptionValues(function (allOptionValues) {
                        return Array.from(new Set(__spreadArray(__spreadArray([], __read(allOptionValues), false), [value], false)));
                    });
                },
                unRegisterValue: function (value) {
                    setAllOptionValues(function (allOptionValues) {
                        return allOptionValues.filter(function (x) { return x !== value; });
                    });
                },
            } }, (0, is_1.isArray)(options)
            ? options.map(function (option) {
                var label = (0, is_1.isObject)(option) ? option.label : option;
                var checkValue = (0, is_1.isObject)(option) ? option.value : option;
                var icon = (0, is_1.isObject)(option) ? option.icon : undefined;
                return (react_1.default.createElement(checkbox_1.default, { disabled: disabled || ((0, is_1.isObject)(option) && option.disabled), key: checkValue, value: checkValue, icon: icon }, label));
            })
            : children)));
}
Group.displayName = 'CheckboxGroup';
exports.default = Group;
