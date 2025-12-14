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
var react_1 = __importStar(require("react"));
var IconEmpty_1 = __importDefault(require("../../icon/react-icon-cjs/IconEmpty"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
function Empty(baseProps, ref) {
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _a.getPrefixCls, globalLocale = _a.locale, componentConfig = _a.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, {}, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Empty);
    var style = props.style, className = props.className, description = props.description, icon = props.icon, imgSrc = props.imgSrc, rest = __rest(props, ["style", "className", "description", "icon", "imgSrc"]);
    var prefixCls = getPrefixCls('empty');
    var classNames = (0, classNames_1.default)(prefixCls, className);
    var noData = globalLocale.Empty.noData;
    var alt = typeof description === 'string' ? description : 'empty';
    return (react_1.default.createElement("div", __assign({ ref: ref, className: classNames, style: style }, rest),
        react_1.default.createElement("div", { className: prefixCls + "-wrapper" },
            react_1.default.createElement("div", { className: prefixCls + "-image" }, imgSrc ? react_1.default.createElement("img", { alt: alt, src: imgSrc }) : icon || react_1.default.createElement(IconEmpty_1.default, null)),
            react_1.default.createElement("div", { className: prefixCls + "-description" }, description || noData))));
}
var EmptyComponent = (0, react_1.forwardRef)(Empty);
EmptyComponent.displayName = 'Empty';
exports.default = (0, react_1.memo)(EmptyComponent);
