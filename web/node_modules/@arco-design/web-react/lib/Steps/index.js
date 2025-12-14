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
var step_1 = __importDefault(require("./step"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
var defaultProps = {
    current: 1,
    type: 'default',
    size: 'default',
    direction: 'horizontal',
    labelPlacement: 'horizontal',
};
function Steps(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Steps);
    var className = props.className, style = props.style, children = props.children, _c = props.current, current = _c === void 0 ? 1 : _c, status = props.status, onChange = props.onChange, type = props.type, size = props.size, direction = props.direction, labelPlacement = props.labelPlacement, customDot = props.customDot, lineless = props.lineless;
    var prefixCls = getPrefixCls('steps');
    var innerLabelPlacement = labelPlacement;
    if (type === 'dot') {
        innerLabelPlacement = direction === 'vertical' ? 'horizontal' : 'vertical';
    }
    if (type === 'navigation') {
        innerLabelPlacement = 'horizontal';
    }
    var innerDirection = direction;
    if (type === 'navigation' || type === 'arrow') {
        innerDirection = 'horizontal';
    }
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-" + innerDirection, prefixCls + "-label-" + innerLabelPlacement, prefixCls + "-size-" + size, (_a = {},
        _a[prefixCls + "-change-onclick"] = typeof onChange === 'function',
        _a[prefixCls + "-mode-" + type] = type !== 'default',
        _a[prefixCls + "-lineless"] = lineless,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    return (react_1.default.createElement("div", __assign({ ref: ref, style: style, className: classNames }, (0, pick_1.pickDataAttributes)(props)), react_1.default.Children.toArray(children)
        .filter(function (child) {
        return child && child.type && child.type.displayName === 'Step';
    })
        .map(function (child, index) {
        // step 的 index 从 1 开始
        index += 1;
        if (child) {
            var childProps = __assign({ prefixCls: prefixCls, type: type, index: index, current: current, status: current === index ? status : undefined, customDot: customDot, labelPlacement: innerLabelPlacement, direction: innerDirection, onChange: onChange, lineless: lineless }, child.props);
            if (status === 'error' && current === index + 1) {
                childProps.nextStepError = true;
            }
            return react_1.default.cloneElement(child, childProps);
        }
        return null;
    })));
}
var ForwardRefSteps = (0, react_1.forwardRef)(Steps);
var StepsComponent = ForwardRefSteps;
StepsComponent.displayName = 'Steps';
StepsComponent.Step = step_1.default;
exports.default = StepsComponent;
