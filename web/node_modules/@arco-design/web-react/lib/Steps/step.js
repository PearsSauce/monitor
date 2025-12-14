"use strict";
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
var IconCheck_1 = __importDefault(require("../../icon/react-icon-cjs/IconCheck"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
function Step(props, ref) {
    var _a;
    var style = props.style, className = props.className, prefixCls = props.prefixCls, _b = props.index, index = _b === void 0 ? 1 : _b, _c = props.current, current = _c === void 0 ? 1 : _c, status = props.status, title = props.title, description = props.description, icon = props.icon, nextStepError = props.nextStepError, type = props.type, customDot = props.customDot, labelPlacement = props.labelPlacement, disabled = props.disabled, onClick = props.onClick, onChange = props.onChange, direction = props.direction, id = props.id, lineless = props.lineless;
    function renderIconNode(currentStatus) {
        if (type === 'dot') {
            return null;
        }
        var content = index;
        if (icon) {
            content = icon;
        }
        else if (currentStatus === 'finish') {
            content = react_1.default.createElement(IconCheck_1.default, null);
        }
        else if (currentStatus === 'error') {
            content = react_1.default.createElement(IconClose_1.default, null);
        }
        return react_1.default.createElement("div", { className: prefixCls + "-icon" }, content);
    }
    function onClickStep(e) {
        if (!disabled) {
            // Step.onChange
            onChange && current !== index && onChange(index, id);
            // props.onClick
            onClick && onClick(index, id, e);
        }
    }
    var currentStatus;
    if (status) {
        currentStatus = status;
    }
    else {
        if (current < index) {
            currentStatus = 'wait';
        }
        if (current === index) {
            currentStatus = 'process';
        }
        if (current > index) {
            currentStatus = 'finish';
        }
    }
    var classNames = (0, classNames_1.default)(prefixCls + "-item", prefixCls + "-item-" + currentStatus, (_a = {},
        _a[prefixCls + "-item-custom"] = !!icon,
        _a[prefixCls + "-item-next-error"] = nextStepError,
        _a[prefixCls + "-item-disabled"] = disabled,
        _a[prefixCls + "-item-active"] = index === current,
        _a), className);
    var iconNode = renderIconNode(currentStatus);
    var iconNodeWrapped = react_1.default.createElement("div", { className: prefixCls + "-item-icon" }, iconNode);
    var customDotElement = customDot
        ? customDot(iconNodeWrapped, {
            index: index,
            status: currentStatus,
            title: title,
            description: description,
        })
        : iconNodeWrapped;
    return (react_1.default.createElement("div", { ref: ref, className: classNames, style: style, onClick: onClickStep },
        !lineless && (labelPlacement === 'vertical' || direction === 'vertical') && (react_1.default.createElement("div", { className: prefixCls + "-item-tail" })),
        type !== 'arrow' && customDotElement,
        react_1.default.createElement("div", { className: prefixCls + "-item-content" },
            react_1.default.createElement("div", { className: prefixCls + "-item-title" }, title),
            description && react_1.default.createElement("div", { className: prefixCls + "-item-description" }, description))));
}
var StepComponent = (0, react_1.forwardRef)(Step);
StepComponent.displayName = 'Step';
exports.default = StepComponent;
