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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var Select_1 = __importDefault(require("../Select"));
var ConfigProvider_1 = require("../ConfigProvider");
var noop = function () { };
var Option = Select_1.default.Option;
var _SizeOptions = [10, 20, 30, 40, 50];
function PageOption(props) {
    var selectRef = (0, react_1.useRef)();
    var locale = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).locale;
    var _a = props.sizeCanChange, sizeCanChange = _a === void 0 ? false : _a, _b = props.onPageSizeChange, onPageSizeChange = _b === void 0 ? noop : _b, rootPrefixCls = props.rootPrefixCls, _c = props.sizeOptions, sizeOptions = _c === void 0 ? _SizeOptions : _c, _d = props.pageSize, pageSize = _d === void 0 ? 10 : _d, size = props.size, selectProps = props.selectProps, disabled = props.disabled;
    return (sizeCanChange && (react_1.default.createElement("div", { ref: selectRef, className: rootPrefixCls + "-option", "aria-label": locale.Pagination.pageSize },
        react_1.default.createElement(Select_1.default, __assign({ value: sizeOptions.indexOf(pageSize) !== -1 ? pageSize : sizeOptions[0], onChange: function (value) {
                onPageSizeChange(value);
            }, size: size, getPopupContainer: function () { return selectRef.current; }, disabled: disabled }, selectProps), sizeOptions.map(function (num) {
            return (react_1.default.createElement(Option, { key: num, value: num }, num + " " + locale.Pagination.countPerPage));
        })))));
}
exports.default = PageOption;
