"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var dom_1 = require("../../_util/dom");
function useHeaderScroll(props) {
    var headerWrapperRef = props.headerWrapperRef, headerOffset = props.headerOffset, align = props.align, isScrollable = props.isScrollable, direction = props.direction, onScroll = props.onScroll;
    function onOffset(offsetX, offsetY) {
        var offset = 0;
        if (direction === 'vertical') {
            offset = headerOffset + offsetY;
        }
        else {
            offset = align === 'left' ? headerOffset + offsetX : headerOffset - offsetX;
        }
        onScroll && onScroll(offset);
    }
    // wheel
    var lastWheelDirectionRef = (0, react_1.useRef)('x');
    function onWheel(e) {
        if (!isScrollable)
            return;
        e.preventDefault();
        var deltaX = e.deltaX, deltaY = e.deltaY;
        var offset = 0;
        var absX = Math.abs(deltaX);
        var absY = Math.abs(deltaY);
        if (absX === absY) {
            offset = lastWheelDirectionRef.current === 'x' ? deltaX : deltaY;
        }
        else if (absX > absY) {
            offset = deltaX;
            lastWheelDirectionRef.current = 'x';
        }
        else {
            offset = deltaY;
            lastWheelDirectionRef.current = 'y';
        }
        onOffset(offset, offset);
    }
    // touch
    var positionRef = (0, react_1.useRef)({
        clientX: 0,
        clientY: 0,
    });
    var getPosition = function (e) {
        return e && e.touches && e.touches.length && e.touches[0];
    };
    var onTouchMove = function (e) {
        if (e.cancelable)
            e.preventDefault();
        var position = getPosition(e);
        if (!position)
            return;
        var _a = positionRef.current, clientX = _a.clientX, clientY = _a.clientY;
        // 往右移动的距离
        var offsetX = position.clientX - clientX;
        // 往下移动的距离
        var offsetY = position.clientY - clientY;
        onOffset(-offsetX, -offsetY);
    };
    var onTouchMoveEnd = function () {
        (0, dom_1.off)(document.documentElement, 'touchmove', onTouchMove);
        (0, dom_1.off)(document.documentElement, 'touchend', onTouchMoveEnd);
    };
    var onTouchStart = function (e) {
        if (!isScrollable)
            return;
        var position = getPosition(e);
        if (!position)
            return;
        positionRef.current = {
            clientX: position.clientX,
            clientY: position.clientY,
        };
        (0, dom_1.on)(document.documentElement, 'touchmove', onTouchMove, { passive: false });
        (0, dom_1.on)(window, 'touchend', onTouchMoveEnd, { passive: false });
    };
    var eventProxy = (0, react_1.useRef)(null);
    eventProxy.current = { onWheel: onWheel, onTouchStart: onTouchStart };
    (0, react_1.useEffect)(function () {
        (0, dom_1.on)(headerWrapperRef.current, 'wheel', function (e) {
            eventProxy.current.onWheel(e);
        }, { passive: false });
        (0, dom_1.on)(headerWrapperRef.current, 'touchstart', function (e) {
            eventProxy.current.onTouchStart(e);
        }, { passive: true });
    }, [headerWrapperRef.current]);
}
exports.default = useHeaderScroll;
