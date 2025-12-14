"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function useIsFirstRender() {
    var isFirst = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(function () {
        isFirst.current = false;
    }, []);
    return isFirst.current;
}
exports.default = useIsFirstRender;
