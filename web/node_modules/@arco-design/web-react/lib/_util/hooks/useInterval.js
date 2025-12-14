"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInterval = void 0;
var react_1 = require("react");
function useInterval(callback, delay) {
    var refIntervalId = (0, react_1.useRef)(null);
    var refSavedCallback = (0, react_1.useRef)();
    var setUpInterval = function () {
        if (delay !== null) {
            refIntervalId.current = setInterval(function () {
                refSavedCallback.current();
            }, delay);
        }
    };
    var cleanUpInterval = function () {
        refIntervalId.current && clearInterval(refIntervalId.current);
    };
    var resetInterval = function () {
        cleanUpInterval();
        setUpInterval();
    };
    // Remember the latest function.
    (0, react_1.useEffect)(function () {
        refSavedCallback.current = callback;
    }, [callback]);
    // Set up the interval.
    (0, react_1.useEffect)(function () {
        setUpInterval();
        return cleanUpInterval;
    }, [delay]);
    return resetInterval;
}
exports.useInterval = useInterval;
