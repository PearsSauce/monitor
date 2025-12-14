"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportIntersectionObserver = void 0;
var react_1 = require("react");
var dom_1 = require("../dom");
var is_1 = require("../is");
exports.supportIntersectionObserver = !dom_1.isServerRendering && !(0, is_1.isUndefined)(window === null || window === void 0 ? void 0 : window.IntersectionObserver);
function useIntersectionObserver(callback, options) {
    if (options === void 0) { options = {}; }
    var intersectionObserver = (0, react_1.useRef)();
    var destroyObserver = function () {
        if (intersectionObserver.current) {
            intersectionObserver.current.disconnect();
            intersectionObserver.current = null;
        }
    };
    var createObserver = function (elem) {
        if (elem) {
            destroyObserver();
            if (exports.supportIntersectionObserver) {
                intersectionObserver.current = new IntersectionObserver(callback, options);
                intersectionObserver.current.observe(elem);
            }
        }
    };
    return {
        observer: intersectionObserver.current,
        cor: createObserver,
        dor: destroyObserver,
    };
}
exports.default = useIntersectionObserver;
