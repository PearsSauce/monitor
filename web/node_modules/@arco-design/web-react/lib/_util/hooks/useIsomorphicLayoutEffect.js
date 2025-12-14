"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var dom_1 = require("../dom");
// Because useLayoutEffect in the ssr environment will report a warning
// So when you need to use useLayoutEffect, use useIsomorphicLayoutEffect instead, it will use useEffect in the ssr environment to avoid this problem
var useIsomorphicLayoutEffect = dom_1.isServerRendering ? react_1.useEffect : react_1.useLayoutEffect;
exports.default = useIsomorphicLayoutEffect;
