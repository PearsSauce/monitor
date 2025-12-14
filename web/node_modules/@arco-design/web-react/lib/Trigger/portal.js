"use strict";
// only used by trigger. Plan to replace ../Portal
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_dom_1 = __importDefault(require("react-dom"));
var dom_1 = require("../_util/dom");
var useIsFirstRender_1 = __importDefault(require("../_util/hooks/useIsFirstRender"));
var Portal = function (props) {
    var getContainer = props.getContainer, children = props.children;
    var containerRef = (0, react_1.useRef)();
    var isFirstRender = (0, useIsFirstRender_1.default)();
    if ((isFirstRender || containerRef.current === null) && !dom_1.isServerRendering) {
        containerRef.current = getContainer();
    }
    (0, react_1.useEffect)(function () {
        return function () {
            var container = containerRef.current;
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
                containerRef.current = null;
            }
        };
    }, []);
    return containerRef.current ? react_dom_1.default.createPortal(children, containerRef.current) : null;
};
exports.default = Portal;
