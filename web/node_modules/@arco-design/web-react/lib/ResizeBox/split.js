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
var resize_trigger_1 = __importDefault(require("./resize-trigger"));
var ConfigProvider_1 = require("../ConfigProvider");
var dom_1 = require("../_util/dom");
var useIsomorphicLayoutEffect_1 = __importDefault(require("../_util/hooks/useIsomorphicLayoutEffect"));
var DIRECTION_HORIZONTAL = 'horizontal';
var DIRECTION_VERTICAL = 'vertical';
function Split(props, ref) {
    var _a;
    var style = props.style, className = props.className, _b = props.component, component = _b === void 0 ? 'div' : _b, _c = props.direction, direction = _c === void 0 ? 'horizontal' : _c, icon = props.icon, _d = props.size, size = _d === void 0 ? 0.5 : _d, min = props.min, max = props.max, panes = props.panes, disabled = props.disabled, trigger = props.trigger;
    var _e = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _e.getPrefixCls, rtl = _e.rtl;
    var prefixCls = getPrefixCls('resizebox-split');
    var isHorizontal = direction.includes(DIRECTION_HORIZONTAL);
    var isReverse = direction.includes('reverse');
    var rtlReverse = isHorizontal && rtl;
    var isTriggerHorizontal = !isHorizontal;
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-" + (isHorizontal ? DIRECTION_HORIZONTAL : DIRECTION_VERTICAL), (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), className);
    var _f = __read(panes, 2), firstPane = _f[0], secondPane = _f[1];
    var isPxSize = typeof size === 'string';
    var _g = __read((0, react_1.useState)(parseFloat(size)), 2), offset = _g[0], setOffset = _g[1];
    var _h = __read((0, react_1.useState)(0), 2), triggerSize = _h[0], setTriggerSize = _h[1];
    var recordRef = (0, react_1.useRef)({
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        startOffset: 0,
        moving: false,
    });
    var wrapperRef = (0, react_1.useRef)();
    var paneContainers = (0, react_1.useRef)([]);
    (0, react_1.useImperativeHandle)(ref, function () { return wrapperRef.current; }, []);
    function px2percent(numerator, denominator) {
        return parseFloat(numerator) / parseFloat(denominator);
    }
    // startSize:  size of the total ResizeBox
    // startOffset: size of the first Panel
    // startPosition: position at the end of last moving
    // currentPosition: position at the end of current moving
    function getOffset(startSize, startOffset, startPosition, currentPosition) {
        //  0 < minOffsetRatio, maxOffsetRatio <1
        var minOffsetRatio = typeof min === 'string' ? px2percent(parseFloat(min), startSize) : min || 0;
        var maxOffsetRatio = typeof max === 'string' ? px2percent(parseFloat(max), startSize) : max || 1;
        var ratio = isReverse ? -1 : 1;
        var rtlRatio = rtlReverse ? -1 : 1;
        ratio *= rtlRatio;
        var moveOffset = isPxSize
            ? startOffset + (currentPosition - startPosition) * ratio
            : px2percent(startSize * startOffset + (currentPosition - startPosition) * ratio, startSize);
        var minOffset = isPxSize ? minOffsetRatio * startSize : minOffsetRatio;
        var maxOffset = isPxSize ? maxOffsetRatio * startSize : maxOffsetRatio;
        moveOffset = Math.max(moveOffset, minOffset);
        moveOffset = Math.min(moveOffset, maxOffset);
        return moveOffset;
    }
    // 移动开始，记录初始值，绑定移动事件
    function onTriggerMouseDown(e) {
        var _a, _b;
        props.onMovingStart && props.onMovingStart();
        recordRef.current.moving = true;
        recordRef.current.startX = e.pageX;
        recordRef.current.startY = e.pageY;
        recordRef.current.startWidth = (_a = wrapperRef.current) === null || _a === void 0 ? void 0 : _a.offsetWidth;
        recordRef.current.startHeight = (_b = wrapperRef.current) === null || _b === void 0 ? void 0 : _b.offsetHeight;
        recordRef.current.startOffset = offset;
        (0, dom_1.on)(window, 'mousemove', moving);
        (0, dom_1.on)(window, 'touchmove', moving);
        (0, dom_1.on)(window, 'mouseup', moveEnd);
        (0, dom_1.on)(window, 'touchend', moveEnd);
        (0, dom_1.on)(window, 'contextmenu', moveEnd);
        document.body.style.cursor = isTriggerHorizontal ? 'row-resize' : 'col-resize';
    }
    // 移动中，更新 firstPane 的占位大小
    function moving(e) {
        if (recordRef.current.moving) {
            /* eslint-disable */
            var newOffset = isHorizontal
                ? getOffset(recordRef.current.startWidth, recordRef.current.startOffset, recordRef.current.startX, e.pageX)
                : getOffset(recordRef.current.startHeight, recordRef.current.startOffset, recordRef.current.startY, e.pageY);
            setOffset(newOffset);
            props.onMoving && props.onMoving(e, isPxSize ? newOffset + "px" : newOffset);
        }
    }
    // 移动结束，解除事件绑定
    function moveEnd() {
        recordRef.current.moving = false;
        (0, dom_1.off)(window, 'mousemove', moving);
        (0, dom_1.off)(window, 'touchmove', moving);
        (0, dom_1.off)(window, 'mouseup', moveEnd);
        (0, dom_1.off)(window, 'touchend', moveEnd);
        (0, dom_1.off)(window, 'contextmenu', moveEnd);
        document.body.style.cursor = 'default';
        props.onMovingEnd && props.onMovingEnd();
    }
    // 更新 trigger 大小
    function onTriggerResize(e) {
        var contentRect = e[0].contentRect;
        var newTriggerSize = contentRect[isTriggerHorizontal ? 'height' : 'width'];
        setTriggerSize(newTriggerSize);
    }
    // 根据 offset 和 triggerSize 计算 firstPane 的样式
    function getFirstPaneSize() {
        var unit = isPxSize ? 'px' : '%';
        if (!offset)
            return "0" + unit;
        var baseVal = isPxSize ? offset : offset * 100;
        return "calc(" + baseVal + unit + " - " + triggerSize / 2 + "px)";
    }
    (0, react_1.useEffect)(function () {
        props.onPaneResize && props.onPaneResize(paneContainers.current);
    }, [offset, triggerSize]);
    (0, useIsomorphicLayoutEffect_1.default)(function () {
        var newOffset = parseFloat(size);
        if (offset !== newOffset) {
            setOffset(newOffset);
        }
    }, [size]);
    var Tag = component;
    var firstPaneNode = (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-pane", 'first-pane'), style: { flexBasis: getFirstPaneSize() }, ref: function (el) {
            paneContainers.current[0] = el;
        } }, firstPane));
    var secondPaneNode = (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-pane", 'second-pane'), ref: function (el) {
            paneContainers.current[1] = el;
        } }, secondPane));
    var paneNodeArr = isReverse ? [secondPaneNode, firstPaneNode] : [firstPaneNode, secondPaneNode];
    return (react_1.default.createElement(Tag, { style: style, className: classNames, ref: wrapperRef },
        paneNodeArr[0],
        !disabled && (react_1.default.createElement(resize_trigger_1.default, { className: prefixCls + "-trigger", direction: isTriggerHorizontal ? DIRECTION_HORIZONTAL : DIRECTION_VERTICAL, icon: icon, onMouseDown: onTriggerMouseDown, onResize: onTriggerResize }, trigger)),
        paneNodeArr[1]));
}
var SplitComponent = (0, react_1.forwardRef)(Split);
SplitComponent.displayName = 'ResizeBoxSplit';
exports.default = SplitComponent;
