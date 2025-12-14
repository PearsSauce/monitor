import { useRef, useEffect } from 'react';
import { on, off } from '../../_util/dom';
export default function useHeaderScroll(props) {
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
    var lastWheelDirectionRef = useRef('x');
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
    var positionRef = useRef({
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
        off(document.documentElement, 'touchmove', onTouchMove);
        off(document.documentElement, 'touchend', onTouchMoveEnd);
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
        on(document.documentElement, 'touchmove', onTouchMove, { passive: false });
        on(window, 'touchend', onTouchMoveEnd, { passive: false });
    };
    var eventProxy = useRef(null);
    eventProxy.current = { onWheel: onWheel, onTouchStart: onTouchStart };
    useEffect(function () {
        on(headerWrapperRef.current, 'wheel', function (e) {
            eventProxy.current.onWheel(e);
        }, { passive: false });
        on(headerWrapperRef.current, 'touchstart', function (e) {
            eventProxy.current.onTouchStart(e);
        }, { passive: true });
    }, [headerWrapperRef.current]);
}
