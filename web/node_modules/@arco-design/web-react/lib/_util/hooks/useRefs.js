"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 保存一个ref列表
var react_1 = require("react");
function useRefs(defaultValue) {
    if (defaultValue === void 0) { defaultValue = []; }
    var listRef = (0, react_1.useRef)(defaultValue);
    var setListRef = function (element, index) {
        if (index !== undefined) {
            listRef.current[index] = element;
        }
        else {
            listRef.current.push(element);
        }
    };
    return [listRef.current, setListRef];
}
exports.default = useRefs;
