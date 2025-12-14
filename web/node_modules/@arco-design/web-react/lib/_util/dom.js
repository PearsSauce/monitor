"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScrollElements = exports.isScrollElement = exports.contains = exports.off = exports.on = exports.isServerRendering = void 0;
var constant_1 = require("./constant");
exports.isServerRendering = (function () {
    try {
        return !(typeof window !== 'undefined' && document !== undefined);
    }
    catch (e) {
        return true;
    }
})();
exports.on = (function () {
    if (exports.isServerRendering) {
        return constant_1.NOOP;
    }
    return function (element, event, handler, options) {
        element && element.addEventListener(event, handler, options || false);
    };
})();
exports.off = (function () {
    if (exports.isServerRendering) {
        return constant_1.NOOP;
    }
    return function (element, event, handler, options) {
        element && element.removeEventListener(event, handler, options || false);
    };
})();
var contains = function (root, ele) {
    if (!root) {
        return false;
    }
    if (root.contains) {
        return root.contains(ele);
    }
    var node = ele;
    while (node) {
        if (node === root) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};
exports.contains = contains;
var isScrollElement = function (element) {
    var clientHeight = element === document.documentElement ? element.clientHeight : element.offsetHeight;
    var clientWidth = element === document.documentElement ? element.clientWidth : element.offsetWidth;
    return element.scrollHeight > clientHeight || element.scrollWidth > clientWidth;
};
exports.isScrollElement = isScrollElement;
/**
 * 从当前节点向上查找所有的滚动元素
 * @param container 当前节点
 * @param top 查找到 top 节点就终止，不再继续查找
 * @returns
 */
var getScrollElements = function (container, top) {
    if (top === void 0) { top = document.documentElement; }
    var scrollElements = [];
    var element = container;
    while (element && element !== top) {
        if ((0, exports.isScrollElement)(element)) {
            scrollElements.push(element);
        }
        element = element.parentElement;
    }
    return scrollElements;
};
exports.getScrollElements = getScrollElements;
