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
var react_1 = __importStar(require("react"));
var Input_1 = __importDefault(require("../Input"));
var is_1 = require("../_util/is");
var ConfigProvider_1 = require("../ConfigProvider");
function PageJumper(props) {
    var defaultInputText = props.simple ? props.current : undefined;
    var locale = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).locale;
    var _a = __read((0, react_1.useState)(defaultInputText), 2), inputText = _a[0], setInputText = _a[1];
    var inputRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        if (props.simple) {
            setInputText(props.current);
        }
    }, [props.simple, props.current]);
    var handleChange = function (val) {
        var value = parseInt(val, 10);
        setInputText(isNaN(value) ? undefined : value);
    };
    var handleJump = function () {
        var onPageChange = props.onPageChange, totalPages = props.totalPages, current = props.current, simple = props.simple;
        if ((0, is_1.isUndefined)(inputText)) {
            return;
        }
        if (inputText === current) {
            if (!simple) {
                setInputText(undefined);
            }
            return;
        }
        var page = isNaN(Number(inputText)) ? current : Number(inputText);
        if (page < 1) {
            page = 1;
        }
        else if (page > totalPages) {
            page = totalPages;
        }
        setInputText(simple ? page : undefined);
        (0, is_1.isFunction)(onPageChange) && onPageChange(page);
    };
    var onFocus = function () {
        var input = inputRef.current.dom;
        if (String(inputText) && input) {
            input.setSelectionRange(0, String(inputText).length);
        }
    };
    var rootPrefixCls = props.rootPrefixCls, totalPages = props.totalPages, simple = props.simple, size = props.size, disabled = props.disabled;
    var prefixCls = rootPrefixCls + "-jumper";
    var inputConfig = __assign({ showJumper: true }, ((0, is_1.isObject)(simple) ? simple : {}));
    return (react_1.default.createElement("div", { className: "" + prefixCls },
        !simple && react_1.default.createElement("span", { className: prefixCls + "-text-goto" }, locale.Pagination.goto),
        inputConfig.showJumper ? (react_1.default.createElement(Input_1.default, { _ignorePropsFromGlobal: true, ref: function (ref) { return (inputRef.current = ref); }, className: prefixCls + "-input", value: !(0, is_1.isUndefined)(inputText) ? inputText.toString() : undefined, size: size, disabled: disabled || !totalPages, onChange: handleChange, onPressEnter: handleJump, onFocus: onFocus, onBlur: handleJump })) : (react_1.default.createElement("span", null, inputText)),
        !simple && react_1.default.createElement("span", { className: prefixCls + "-text-goto-suffix" }, locale.Pagination.page),
        simple && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("span", { className: prefixCls + "-separator" }, "/"),
            react_1.default.createElement("span", null, totalPages)))));
}
exports.default = PageJumper;
