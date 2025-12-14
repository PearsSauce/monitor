"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function useUpdate(fn, deps) {
    if (deps === void 0) { deps = []; }
    var isDidMount = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (isDidMount.current) {
            fn();
        }
        else {
            isDidMount.current = true;
        }
    }, deps);
}
exports.default = useUpdate;
