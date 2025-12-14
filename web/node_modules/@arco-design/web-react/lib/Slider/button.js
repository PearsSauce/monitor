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
var classNames_1 = __importDefault(require("../_util/classNames"));
var dom_1 = require("../_util/dom");
var is_1 = require("../_util/is");
var Trigger_1 = __importDefault(require("../Trigger"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var triggerStyle = { maxWidth: 350 };
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
var SliderButton = function (props) {
    var _a;
    // props
    var style = props.style, disabled = props.disabled, prefixCls = props.prefixCls, value = props.value, vertical = props.vertical, tooltipVisible = props.tooltipVisible, tooltipPosition = props.tooltipPosition, formatTooltip = props.formatTooltip, getTooltipContainer = props.getTooltipContainer, onMoving = props.onMoving, onMoveEnd = props.onMoveEnd, onMoveBegin = props.onMoveBegin;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    // state
    var _b = __read((0, react_1.useState)(false), 2), isActive = _b[0], setIsActive = _b[1];
    var _c = __read((0, useMergeValue_1.default)(false, { value: tooltipVisible }), 2), popupVisible = _c[0], setPopupVisible = _c[1];
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var position = (0, react_1.useMemo)(function () { return tooltipPosition || (vertical ? 'right' : 'top'); }, [tooltipPosition, vertical]);
    var delayTimer = (0, react_1.useRef)(null);
    var inButtonOrPopup = (0, react_1.useRef)(false);
    var isDragging = (0, react_1.useRef)(false);
    var tooltip = (0, react_1.useRef)(null);
    function handleMouseDown(e) {
        e.stopPropagation();
        if (disabled)
            return;
        moveStart(e);
        setIsActive(true);
        (0, dom_1.on)(window, 'mousemove', moving);
        (0, dom_1.on)(window, 'touchmove', moving);
        (0, dom_1.on)(window, 'mouseup', moveEnd);
        (0, dom_1.on)(window, 'touchend', moveEnd);
        (0, dom_1.on)(window, 'contextmenu', moveEnd);
    }
    // 鼠标移入
    function handleMouseEnter() {
        inButtonOrPopup.current = true;
        clearDelayTimer();
        if (!popupVisible) {
            delayTimer.current = setTimeout(function () {
                updatePopupVisible(true);
            }, 50);
        }
    }
    // 鼠标移出
    function handleMouseLeave() {
        inButtonOrPopup.current = false;
        if (!isDragging.current) {
            clearDelayTimer();
            delayTimer.current = setTimeout(function () {
                updatePopupVisible(false);
            }, 200);
        }
    }
    function moveStart(e) {
        // 如果不阻止默认行为可能会在拖动时产生鼠标选中状态，所以手动处理元素失焦
        e.preventDefault();
        var activeElement = document.activeElement;
        activeElement && activeElement.blur && activeElement.blur();
        (0, is_1.isFunction)(onMoveBegin) && onMoveBegin();
    }
    function moving(e) {
        isDragging.current = true;
        if (e.type === 'touchstart') {
            e.clientY = e.touches[0].clientY;
            e.clientX = e.touches[0].clientX;
        }
        (0, is_1.isFunction)(onMoving) && onMoving(e.clientX, e.clientY);
    }
    function moveEnd() {
        isDragging.current = false;
        setIsActive(false);
        offEvents();
        updatePopupVisible(inButtonOrPopup.current);
        (0, is_1.isFunction)(onMoveEnd) && onMoveEnd();
    }
    function offEvents() {
        clearDelayTimer();
        (0, dom_1.off)(window, 'mousemove', moving);
        (0, dom_1.off)(window, 'touchmove', moving);
        (0, dom_1.off)(window, 'mouseup', moveEnd);
        (0, dom_1.off)(window, 'touchend', moveEnd);
        (0, dom_1.off)(window, 'contextmenu', moveEnd);
    }
    // 清除定时器
    function clearDelayTimer() {
        if (delayTimer.current) {
            clearTimeout(delayTimer.current);
            delayTimer.current = null;
        }
    }
    // 设置 tooltip 显示状态
    function updatePopupVisible(value) {
        if (isDragging.current)
            return;
        var newPopupVisible = 'tooltipVisible' in props ? tooltipVisible : value;
        setPopupVisible(newPopupVisible);
    }
    function handlePopupMouseEnter() {
        inButtonOrPopup.current = true;
        clearDelayTimer();
    }
    var tooltipText = (0, react_1.useMemo)(function () {
        return (0, is_1.isFunction)(formatTooltip) ? formatTooltip(value) : value;
    }, [formatTooltip, value]);
    function renderTooltipContent(position) {
        var tooltipPrefixCls = getPrefixCls('tooltip');
        return (react_1.default.createElement("div", { className: (0, classNames_1.default)(tooltipPrefixCls + "-content", tooltipPrefixCls + "-content-" + position), onMouseLeave: handleMouseLeave, onMouseEnter: handlePopupMouseEnter, onClick: function (e) {
                e.stopPropagation();
            } },
            react_1.default.createElement("div", { className: tooltipPrefixCls + "-content-inner" }, tooltipText)));
    }
    (0, react_1.useEffect)(function () {
        tooltip && tooltip.current && tooltip.current.updatePopupPosition();
    }, [value]);
    return (react_1.default.createElement(Trigger_1.default, { style: triggerStyle, classNames: "zoomInFadeOut", duration: triggerDuration, showArrow: true, popupAlign: triggerPopupAlign, ref: tooltip, popup: function () { return renderTooltipContent(position); }, popupVisible: popupVisible, disabled: tooltipVisible === false, getPopupContainer: getTooltipContainer, position: position, childrenPrefix: getPrefixCls('tooltip') },
        react_1.default.createElement("div", __assign({ className: (0, classNames_1.default)(prefixCls + "-button", (_a = {}, _a[prefixCls + "-button-active"] = isActive, _a)), onMouseDown: handleMouseDown, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, style: style, role: "slider", "aria-valuemax": props.maxValue, "aria-valuemin": props.minValue, "aria-valuenow": value, "aria-disabled": !!disabled, tabIndex: disabled ? -1 : 0, "aria-valuetext": (0, is_1.isString)(tooltipText) || (0, is_1.isNumber)(tooltipText) ? String(tooltipText) : undefined }, getKeyboardEvents({
            onArrowRight: function (e) {
                var _a;
                e.preventDefault();
                (_a = props.onArrowEvent) === null || _a === void 0 ? void 0 : _a.call(props, 'addition');
            },
            onArrowUp: function (e) {
                var _a;
                e.preventDefault();
                (_a = props.onArrowEvent) === null || _a === void 0 ? void 0 : _a.call(props, 'addition');
            },
            onArrowLeft: function (e) {
                var _a;
                e.preventDefault();
                (_a = props.onArrowEvent) === null || _a === void 0 ? void 0 : _a.call(props, 'subtraction');
            },
            onArrowDown: function (e) {
                var _a;
                e.preventDefault();
                (_a = props.onArrowEvent) === null || _a === void 0 ? void 0 : _a.call(props, 'subtraction');
            },
        })))));
};
exports.default = (0, react_1.memo)(SliderButton);
