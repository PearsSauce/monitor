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
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var text_1 = __importDefault(require("./text"));
var image_1 = __importDefault(require("./image"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
function getComponentProps(prop) {
    return (0, is_1.isObject)(prop) ? prop : {};
}
var defaultProps = {
    text: true,
    loading: true,
};
function Skeleton(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Skeleton);
    var style = props.style, className = props.className, animation = props.animation, loading = props.loading, image = props.image, text = props.text, children = props.children;
    var imageProps = getComponentProps(image);
    var textProps = getComponentProps(text);
    var prefixCls = getPrefixCls('skeleton');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-animate"] = animation,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    function renderImage() {
        return (image && (react_1.default.createElement("div", { className: prefixCls + "-header" },
            react_1.default.createElement(image_1.default, __assign({ prefixCls: prefixCls }, imageProps)))));
    }
    function renderText() {
        return (text && (react_1.default.createElement("div", { className: prefixCls + "-content" },
            react_1.default.createElement(text_1.default, __assign({ prefixCls: prefixCls }, textProps)))));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null, loading ? (react_1.default.createElement("div", __assign({}, (0, pick_1.pickDataAttributes)(props), { className: classNames, style: style, ref: ref }),
        imageProps.position !== 'right' && renderImage(),
        renderText(),
        imageProps.position === 'right' && renderImage())) : (children)));
}
var SkeletonComponent = (0, react_1.forwardRef)(Skeleton);
SkeletonComponent.displayName = 'Skeleton';
exports.default = SkeletonComponent;
