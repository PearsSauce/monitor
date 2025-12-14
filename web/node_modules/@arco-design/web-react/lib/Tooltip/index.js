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
var Trigger_1 = __importStar(require("../Trigger"));
var ConfigProvider_1 = require("../ConfigProvider");
var pick_1 = __importStar(require("../_util/pick"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var is_1 = require("../_util/is");
var defaultProps = {
    position: 'top',
    trigger: 'hover',
    escToClose: false,
    unmountOnExit: true,
    blurToHide: true,
    popupHoverStay: true,
};
var triggerDuration = {
    enter: 300,
    exit: 100,
};
var triggerPopupAlign = {
    left: 12,
    right: 12,
    top: 12,
    bottom: 12,
};
function Tooltip(baseProps, ref) {
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _a.getPrefixCls, componentConfig = _a.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Tooltip);
    var style = props.style, className = props.className, children = props.children, trigger = props.trigger, escToClose = props.escToClose, defaultPopupVisible = props.defaultPopupVisible, position = props.position, unmountOnExit = props.unmountOnExit, popupVisible = props.popupVisible, tooltipPrefixCls = props.prefixCls, blurToHide = props.blurToHide, popupHoverStay = props.popupHoverStay, disabled = props.disabled, onVisibleChange = props.onVisibleChange, triggerProps = props.triggerProps, childrenPrefix = props.childrenPrefix, getPopupContainer = props.getPopupContainer, content = props.content, mini = props.mini, color = props.color, rest = __rest(props, ["style", "className", "children", "trigger", "escToClose", "defaultPopupVisible", "position", "unmountOnExit", "popupVisible", "prefixCls", "blurToHide", "popupHoverStay", "disabled", "onVisibleChange", "triggerProps", "childrenPrefix", "getPopupContainer", "content", "mini", "color"]);
    var refTrigger = (0, react_1.useRef)();
    var updatePopupPosition = function (delay, callback) {
        if (delay === void 0) { delay = 0; }
        refTrigger.current && refTrigger.current.updatePopupPosition(delay, callback);
    };
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        updatePopupPosition: updatePopupPosition,
        getRootDOMNode: function () {
            var _a, _b;
            return (_b = (_a = refTrigger.current) === null || _a === void 0 ? void 0 : _a.getRootDOMNode) === null || _b === void 0 ? void 0 : _b.call(_a);
        },
    }); }, []);
    var prefixCls = tooltipPrefixCls || getPrefixCls('tooltip');
    var otherProps = __assign(__assign(__assign(__assign({}, (0, pick_1.default)(rest, Trigger_1.EventsByTriggerNeed)), (0, pick_1.pickDataAttributes)(rest)), triggerProps), { className: (0, classNames_1.default)(className, triggerProps === null || triggerProps === void 0 ? void 0 : triggerProps.className) });
    var renderedContent = (0, is_1.isFunction)(content) ? content() : content;
    if ('popupVisible' in props) {
        otherProps.popupVisible = popupVisible;
    }
    else if ((0, is_1.isEmptyReactNode)(renderedContent, true)) {
        // hide if empty content
        otherProps.popupVisible = false;
    }
    if (otherProps.showArrow !== false || otherProps.arrowProps) {
        otherProps.arrowProps = otherProps.arrowProps || {};
        if (color) {
            otherProps.arrowProps.style = __assign({ backgroundColor: color }, otherProps.arrowProps.style);
        }
    }
    return (react_1.default.createElement(Trigger_1.default, __assign({ style: __assign({ maxWidth: 350 }, style), ref: refTrigger, classNames: "zoomInFadeOut", duration: triggerDuration, popup: function () {
            var _a;
            return (react_1.default.createElement("div", { style: { backgroundColor: color }, className: (0, classNames_1.default)(prefixCls + "-content", prefixCls + "-content-" + position, (_a = {},
                    _a[prefixCls + "-mini"] = mini,
                    _a)), role: "tooltip" },
                react_1.default.createElement("div", { className: prefixCls + "-content-inner" }, renderedContent)));
        }, position: position, disabled: disabled, trigger: trigger, escToClose: escToClose, showArrow: true, popupAlign: triggerPopupAlign, mouseEnterDelay: 200, mouseLeaveDelay: 200, unmountOnExit: unmountOnExit, popupHoverStay: popupHoverStay, blurToHide: blurToHide, childrenPrefix: childrenPrefix || prefixCls, getPopupContainer: getPopupContainer, onVisibleChange: onVisibleChange, defaultPopupVisible: defaultPopupVisible }, otherProps), children));
}
var TooltipComponent = (0, react_1.forwardRef)(Tooltip);
TooltipComponent.displayName = 'Tooltip';
exports.default = TooltipComponent;
