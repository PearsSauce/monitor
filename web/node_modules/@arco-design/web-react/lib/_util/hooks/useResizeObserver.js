"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var resize_observer_polyfill_1 = __importDefault(require("resize-observer-polyfill"));
function useResizeObserver(onResize) {
    var resizeObserver = (0, react_1.useRef)();
    var destroyObserver = function () {
        if (resizeObserver.current) {
            resizeObserver.current.disconnect();
            resizeObserver.current = null;
        }
    };
    var createObserver = function (elem) {
        if (elem) {
            if (resizeObserver.current) {
                destroyObserver();
            }
            resizeObserver.current = new resize_observer_polyfill_1.default(onResize);
            resizeObserver.current.observe(elem);
        }
    };
    return {
        currentOr: resizeObserver.current,
        cor: createObserver,
        dor: destroyObserver,
    };
}
exports.default = useResizeObserver;
