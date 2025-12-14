"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyDownEvent = exports.updateScrollOffset = exports.getRectDiff = void 0;
var keycode_1 = require("../_util/keycode");
var getRectDiff = function (node, parentNode) {
    var nodeRect = node.getBoundingClientRect();
    var parentRect = parentNode.getBoundingClientRect();
    var scaleX = parentNode.offsetWidth / parentRect.width;
    var scaleY = parentNode.offsetHeight / parentRect.height;
    return {
        left: (nodeRect.left - parentRect.left) * scaleX,
        top: (nodeRect.top - parentRect.top) * scaleY,
        right: (nodeRect.right - parentRect.right) * scaleX,
        bottom: (nodeRect.bottom - parentRect.bottom) * scaleY,
    };
};
exports.getRectDiff = getRectDiff;
// 浏览器默认行为影响，比如说input的autofocus，会导致wrapper自动滚动到focus元素
// 需要手动校准一下
// https://github.com/arco-design/arco-design/issues/422
var updateScrollOffset = function (parentNode, direction) {
    var scrollLeft = parentNode.scrollLeft;
    var scrollTop = parentNode.scrollTop;
    if (direction === 'horizontal' && scrollLeft) {
        parentNode.scrollTo({ left: -1 * scrollLeft });
    }
    if (direction === 'vertical' && scrollTop) {
        parentNode.scrollTo({ top: -1 * scrollTop });
    }
};
exports.updateScrollOffset = updateScrollOffset;
var getKeyDownEvent = function (_a) {
    var onPressEnter = _a.onPressEnter;
    return {
        onKeyDown: function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === keycode_1.Enter.code) {
                onPressEnter(e);
            }
        },
    };
};
exports.getKeyDownEvent = getKeyDownEvent;
