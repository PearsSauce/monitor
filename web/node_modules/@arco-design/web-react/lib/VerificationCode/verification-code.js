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
exports.VerificationCodeComponent = void 0;
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var input_element_1 = __importDefault(require("../Input/input-element"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useVerificationCode_1 = __importDefault(require("../_hooks/useVerificationCode"));
var defaultProps = {
    length: 6,
};
function VerificationCodeComponent(baseProps, _) {
    var _a;
    var _b;
    var ctx = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, (_b = ctx.componentConfig) === null || _b === void 0 ? void 0 : _b.VerificationCode);
    var size = props.size, separator = props.separator, status = props.status, length = props.length, masked = props.masked, disabled = props.disabled;
    var focusEleRefList = (0, react_1.useRef)([]);
    var _c = (0, useVerificationCode_1.default)({
        defaultValue: props.defaultValue,
        value: props.value,
        length: length,
        getInputRefList: function () { return focusEleRefList.current; },
        onChange: props.onChange,
        onFinish: props.onFinish,
    }), value = _c.value, filledValue = _c.filledValue, getInputProps = _c.getInputProps;
    var prefix = ctx.getPrefixCls('verification-code');
    var prefixInput = ctx.getPrefixCls('input');
    return (react_1.default.createElement("div", { className: (0, classNames_1.default)("" + prefix, props.className, (_a = {},
            _a[prefix + "-rtl"] = ctx.rtl,
            _a)), style: props.style }, filledValue.map(function (v, index) {
        var _a;
        var _b = getInputProps(index), onChange = _b.onChange, onClick = _b.onClick, onPaste = _b.onPaste, onKeyDown = _b.onKeyDown, restInputProps = __rest(_b, ["onChange", "onClick", "onPaste", "onKeyDown"]);
        return (react_1.default.createElement(react_1.Fragment, { key: index },
            react_1.default.createElement(input_element_1.default, __assign({ disabled: props.disabled, readOnly: props.readOnly, className: (0, classNames_1.default)(prefixInput, prefix + "-input", (_a = {},
                    _a[prefixInput + "-size-" + size] = size,
                    _a[prefixInput + "-" + status] = status,
                    _a[prefixInput + "-disabled"] = disabled,
                    _a[prefixInput + "-rtl"] = ctx.rtl,
                    _a)), ref: function (node) {
                    focusEleRefList.current[index] = node === null || node === void 0 ? void 0 : node.dom;
                } }, restInputProps, { onClick: !props.readOnly ? onClick : undefined, onPaste: !props.readOnly ? onPaste : undefined, onKeyDown: !props.readOnly ? onKeyDown : undefined, onChange: !props.readOnly
                    ? function (inputValue) {
                        if (props.validate) {
                            var result = props === null || props === void 0 ? void 0 : props.validate({ inputValue: inputValue, index: index, value: value });
                            if (result !== false) {
                                onChange(typeof result === 'string' ? result : inputValue);
                            }
                        }
                        else {
                            onChange(inputValue);
                        }
                    }
                    : undefined, type: masked ? 'password' : 'text' })), separator === null || separator === void 0 ? void 0 :
            separator({ index: index, character: v })));
    })));
}
exports.VerificationCodeComponent = VerificationCodeComponent;
var VerificationCode = (0, react_1.forwardRef)(VerificationCodeComponent);
exports.default = VerificationCode;
