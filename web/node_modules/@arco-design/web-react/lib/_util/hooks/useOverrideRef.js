"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_dom_1 = require("../react-dom");
var is_1 = require("../is");
function useOverrideRef() {
    var ref = react_1.default.useRef(null);
    var overrideNode = (0, react_1.useCallback)(function (originNode) {
        if ((0, react_1.isValidElement)(originNode) && (0, is_1.supportRef)(originNode)) {
            return (0, react_1.cloneElement)(originNode, {
                ref: function (node) {
                    ref.current = node;
                    (0, react_dom_1.callbackOriginRef)(originNode, node);
                },
            });
        }
        return originNode;
    }, []);
    return [overrideNode, ref];
}
exports.default = useOverrideRef;
