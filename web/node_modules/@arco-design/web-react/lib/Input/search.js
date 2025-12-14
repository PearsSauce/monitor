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
var input_1 = __importStar(require("./input"));
var Button_1 = __importDefault(require("../Button"));
var IconSearch_1 = __importDefault(require("../../icon/react-icon-cjs/IconSearch"));
var omit_1 = __importDefault(require("../_util/omit"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var is_1 = require("../_util/is");
var Search = react_1.default.forwardRef(function (props, ref) {
    var _a;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var className = props.className, style = props.style, placeholder = props.placeholder, disabled = props.disabled, searchButton = props.searchButton, loading = props.loading, defaultValue = props.defaultValue, addAfter = props.addAfter, suffix = props.suffix, rest = __rest(props, ["className", "style", "placeholder", "disabled", "searchButton", "loading", "defaultValue", "addAfter", "suffix"]);
    var trueMaxLength = (0, is_1.isObject)(props.maxLength) ? props.maxLength.length : props.maxLength;
    var mergedMaxLength = (0, is_1.isObject)(props.maxLength) && props.maxLength.errorOnly ? undefined : trueMaxLength;
    var _b = __read((0, useMergeValue_1.default)('', {
        defaultValue: 'defaultValue' in props ? (0, input_1.formatValue)(props.defaultValue, mergedMaxLength) : undefined,
        value: 'value' in props ? (0, input_1.formatValue)(props.value, mergedMaxLength) : undefined,
    }), 2), value = _b[0], setValue = _b[1];
    var prefixCls = getPrefixCls('input-search');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-button"] = searchButton,
        _a), className);
    var onSearch = function () {
        !disabled && props.onSearch && props.onSearch(value);
    };
    return (react_1.default.createElement(input_1.default, __assign({}, (0, omit_1.default)(rest, ['onSearch']), { disabled: disabled, className: classNames, style: style, ref: ref, placeholder: placeholder, addAfter: addAfter !== undefined ? (addAfter) : searchButton ? (react_1.default.createElement(Button_1.default, { disabled: disabled, size: rest.size, className: prefixCls + "-btn", type: "primary", onClick: onSearch, loading: loading, loadingFixedWidth: true, icon: searchButton === true && !loading && react_1.default.createElement(IconSearch_1.default, null) }, searchButton !== true && searchButton)) : null, suffix: suffix !== undefined
            ? suffix
            : !searchButton && (loading ? react_1.default.createElement(IconLoading_1.default, null) : react_1.default.createElement(IconSearch_1.default, { onClick: onSearch })), onChange: function (value, e) {
            setValue(value);
            props.onChange && props.onChange(value, e);
        }, defaultValue: defaultValue, onPressEnter: function (e) {
            onSearch();
            props.onPressEnter && props.onPressEnter(e);
        } })));
});
Search.displayName = 'Search';
exports.default = Search;
