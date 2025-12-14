"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var is_1 = require("../_util/is");
var useIsomorphicLayoutEffect_1 = __importDefault(require("../_util/hooks/useIsomorphicLayoutEffect"));
function useSelectionRange(_a) {
    var inputElement = _a.inputElement, inputValue = _a.inputValue;
    // Selection position from the tail (e.g. 1234|56, this value will be 2)
    var refSelectionPosition = (0, react_1.useRef)(null);
    (0, useIsomorphicLayoutEffect_1.default)(function () {
        try {
            var position = refSelectionPosition.current;
            if (inputElement && inputValue && (0, is_1.isNumber)(position)) {
                var start = Math.max(0, inputValue.length - position);
                inputElement.setSelectionRange(start, start);
            }
        }
        catch (err) {
            console.warn('Failed to reset input selection range position', err);
        }
    }, [inputValue]);
    return function (event) {
        var _a = event.target, end = _a.selectionEnd, value = _a.value;
        if ((0, is_1.isNumber)(end)) {
            refSelectionPosition.current = value.length - end;
        }
    };
}
exports.default = useSelectionRange;
