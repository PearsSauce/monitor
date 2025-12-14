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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// just to resolve CssTransition findDOMNode
var react_1 = __importStar(require("react"));
var react_transition_group_1 = require("react-transition-group");
var is_1 = require("./is");
var react_dom_1 = require("./react-dom");
function ArcoCSSTransition(props) {
    var children = props.children, rest = __rest(props, ["children"]);
    var nodeRef = (0, react_1.useRef)();
    var flagRef = (0, react_1.useRef)();
    var dom = (0, react_1.useMemo)(function () {
        // 只处理 div， span 之类的 children 即可
        if (props.nodeRef === undefined && (0, is_1.supportRef)(children) && (0, react_1.isValidElement)(children)) {
            flagRef.current = true;
            return (0, react_1.cloneElement)(children, {
                ref: function (node) {
                    nodeRef.current = (0, react_dom_1.findDOMNode)(node);
                    (0, react_dom_1.callbackOriginRef)(children, node);
                },
            });
        }
        flagRef.current = false;
        return children;
    }, [children, props.nodeRef]);
    if (flagRef.current) {
        ['onEnter', 'onEntering', 'onEntered', 'onExit', 'onExiting', 'onExited'].forEach(function (key) {
            if (props[key]) {
                rest[key] = function (_maybeNode) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    props[key].apply(props, __spreadArray([nodeRef.current], __read(args), false));
                };
            }
        });
    }
    return (react_1.default.createElement(react_transition_group_1.CSSTransition, __assign({}, rest, { nodeRef: flagRef.current ? nodeRef : undefined }), dom));
}
exports.default = ArcoCSSTransition;
