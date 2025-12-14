"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var keycode_1 = require("../keycode");
function useKeyboardEvent(props) {
    var getEventListeners = (0, react_1.useCallback)(function (callbacks) {
        return {
            onKeyDown: function (e) {
                var _a, _b, _c, _d, _e, _f;
                var keyCode = e.keyCode || e.which;
                if (keyCode === keycode_1.Enter.code) {
                    (_a = callbacks.onPressEnter) === null || _a === void 0 ? void 0 : _a.call(callbacks, e);
                }
                if (keyCode === keycode_1.ArrowDown.code) {
                    (_b = callbacks.onArrowDown) === null || _b === void 0 ? void 0 : _b.call(callbacks, e);
                }
                if (keyCode === keycode_1.ArrowLeft.code) {
                    (_c = callbacks.onArrowLeft) === null || _c === void 0 ? void 0 : _c.call(callbacks, e);
                }
                if (keyCode === keycode_1.ArrowRight.code) {
                    (_d = callbacks.onArrowRight) === null || _d === void 0 ? void 0 : _d.call(callbacks, e);
                }
                if (keyCode === keycode_1.ArrowUp.code) {
                    (_e = callbacks.onArrowUp) === null || _e === void 0 ? void 0 : _e.call(callbacks, e);
                }
                (_f = props === null || props === void 0 ? void 0 : props.onKeyDown) === null || _f === void 0 ? void 0 : _f.call(props, e);
            },
        };
    }, []);
    return getEventListeners;
}
exports.default = useKeyboardEvent;
