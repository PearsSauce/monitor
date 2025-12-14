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
exports.WatermarkComponent = void 0;
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useWatermark_1 = __importDefault(require("../_hooks/useWatermark"));
var defaultProps = {};
var watermarkOptionsKey = [
    'zIndex',
    'width',
    'height',
    'rotate',
    'image',
    'content',
    'fontStyle',
    'gap',
    'offset',
    'getContainer',
];
function WatermarkComponent(baseProps, _) {
    var _a;
    var _b;
    var ctx = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, (_b = ctx.componentConfig) === null || _b === void 0 ? void 0 : _b.Watermark);
    var containerRef = (0, react_1.useRef)();
    var getContainer = (0, react_1.useCallback)(function () {
        var _a;
        return containerRef.current || ((_a = props.getContainer) === null || _a === void 0 ? void 0 : _a.call(props));
    }, [containerRef.current, props.getContainer]);
    var watermarkOptions = watermarkOptionsKey.reduce(function (t, key) {
        if (key in props) {
            t[key] = props[key];
        }
        return t;
    }, {});
    var setWatermark = (0, useWatermark_1.default)(__assign(__assign({}, watermarkOptions), { getContainer: getContainer })).setWatermark;
    (0, react_1.useEffect)(function () {
        setWatermark(__assign(__assign({}, watermarkOptions), { getContainer: getContainer }));
    }, [
        props.zIndex,
        props.width,
        props.height,
        props.rotate,
        props.image,
        props.content,
        JSON.stringify(props.fontStyle),
        JSON.stringify(props.gap),
        JSON.stringify(props.offset),
        getContainer,
    ]);
    var prefix = ctx.getPrefixCls('watermark');
    return props.children ? (react_1.default.createElement("div", { className: (0, classNames_1.default)("" + prefix, props.className, (_a = {},
            _a[prefix + "-rtl"] = ctx.rtl,
            _a)), style: props.style, ref: containerRef }, props.children)) : null;
}
exports.WatermarkComponent = WatermarkComponent;
var Watermark = (0, react_1.forwardRef)(WatermarkComponent);
exports.default = Watermark;
