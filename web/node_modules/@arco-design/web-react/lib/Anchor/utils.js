"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainerElement = exports.getContainer = exports.slide = exports.findNode = void 0;
var b_tween_1 = __importDefault(require("b-tween"));
var is_1 = require("../_util/is");
function findNode(dom, selector) {
    // handle id start with number
    // e.g. id #123
    var s = (0, is_1.isString)(selector) && selector[0] === '#' ? "[id='" + selector.replace('#', '') + "']" : selector;
    try {
        return dom.querySelector(s);
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
exports.findNode = findNode;
function slide(el, top, cb) {
    var tween = new b_tween_1.default({
        from: {
            scrollTop: el.scrollTop,
        },
        to: {
            scrollTop: top,
        },
        easing: 'quartOut',
        duration: 300,
        onUpdate: function (keys) {
            el.scrollTop = keys.scrollTop;
        },
        onFinish: function () {
            cb === null || cb === void 0 ? void 0 : cb();
        },
    });
    tween.start();
}
exports.slide = slide;
function getContainer(targetContainer) {
    if ((0, is_1.isString)(targetContainer)) {
        return findNode(document, targetContainer);
    }
    return targetContainer || window;
}
exports.getContainer = getContainer;
function getContainerElement(scrollContainer) {
    return (0, is_1.isWindow)(scrollContainer) ? document.documentElement || document.body : scrollContainer;
}
exports.getContainerElement = getContainerElement;
