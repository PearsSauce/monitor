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
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var line_progess_1 = __importDefault(require("./line-progess"));
var circle_progress_1 = __importDefault(require("./circle-progress"));
var steps_progress_1 = __importDefault(require("./steps-progress"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var omit_1 = __importDefault(require("../_util/omit"));
var defaultProps = {
    type: 'line',
    showText: true,
    percent: 0,
    size: 'default',
};
function Progress(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Progress);
    var className = props.className, style = props.style, size = props.size, width = props.width, strokeWidth = props.strokeWidth, steps = props.steps, percent = props.percent, rest = __rest(props, ["className", "style", "size", "width", "strokeWidth", "steps", "percent"]);
    var type = steps && props.type !== 'circle' ? 'steps' : props.type;
    var prefixCls = getPrefixCls('progress');
    var status = 'status' in props ? props.status : percent >= 100 ? 'success' : 'normal';
    var widthStyle = { width: width };
    if (size === 'mini' && type === 'line') {
        widthStyle.width = width || 16;
        widthStyle.height = width || 16;
    }
    return (react_1.default.createElement("div", __assign({ ref: ref, className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + type, prefixCls + "-" + size, (_a = {},
            _a[prefixCls + "-is-" + status] = status !== 'normal',
            _a[prefixCls + "-rtl"] = rtl,
            _a), className), style: __assign(__assign({}, widthStyle), style) }, (0, omit_1.default)(rest, [
        'type',
        'animation',
        'status',
        'color',
        'trailColor',
        'showText',
        'formatText',
        'buffer',
        'bufferColor',
    ])),
        type === 'steps' && (react_1.default.createElement(steps_progress_1.default, __assign({}, props, { type: type, status: status, prefixCls: prefixCls }))),
        type === 'circle' && (react_1.default.createElement(circle_progress_1.default, __assign({ width: props.width }, props, { pathStrokeColor: props.trailColor, status: status, prefixCls: prefixCls }))),
        type === 'line' &&
            (size === 'mini' ? (react_1.default.createElement(circle_progress_1.default, __assign({ pathStrokeColor: props.trailColor }, props, { pathStrokeWidth: strokeWidth || 4, width: width || 16, strokeWidth: strokeWidth || 4, prefixCls: prefixCls, status: status }))) : (react_1.default.createElement(line_progess_1.default, __assign({}, props, { status: status, prefixCls: prefixCls }))))));
}
var ProgressRef = (0, react_1.forwardRef)(Progress);
ProgressRef.displayName = 'Progress';
exports.default = ProgressRef;
