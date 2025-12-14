"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var React = __importStar(require("react"));
/**
 * Create visual height for content
 */
var Filler = function (_a) {
    var height = _a.height, offset = _a.offset, children = _a.children, propsOuterStyle = _a.outerStyle, propsInnerStyle = _a.innerStyle;
    var outerStyle = {};
    var innerStyle = {
        display: 'flex',
        flexDirection: 'column',
    };
    if (offset !== undefined) {
        outerStyle = __assign({ height: height, position: 'relative', overflow: 'hidden', zIndex: 0 }, propsOuterStyle);
        innerStyle = __assign(__assign(__assign({}, innerStyle), { transform: "translateY(" + offset + "px)", position: 'absolute', left: 0, right: 0, top: 0 }), propsInnerStyle);
    }
    else {
        outerStyle = __assign({}, propsOuterStyle);
        innerStyle = __assign(__assign({}, innerStyle), propsInnerStyle);
    }
    return (React.createElement("div", { style: outerStyle },
        React.createElement("div", { style: innerStyle }, children)));
};
exports.default = Filler;
