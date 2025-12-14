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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var index_1 = __importDefault(require("./index"));
var dom_1 = require("../_util/dom");
var scriptUrlCache = [];
function addFromIconFontCn(options) {
    if (options === void 0) { options = {}; }
    var src = options.src, _a = options.extraProps, extraProps = _a === void 0 ? {} : _a;
    if (!dom_1.isServerRendering &&
        typeof src === 'string' &&
        src.length &&
        scriptUrlCache.indexOf(src) === -1) {
        var script = document.createElement('script');
        script.setAttribute('src', src);
        script.setAttribute('data-namespace', src);
        scriptUrlCache.push(src);
        document.body.appendChild(script);
    }
    var Iconfont = React.forwardRef(function (props, ref) {
        var type = props.type, children = props.children, restProps = __rest(props, ["type", "children"]);
        var iconRef = React.useRef();
        React.useImperativeHandle(ref, function () { return iconRef.current; });
        var content;
        if (type) {
            content = React.createElement("use", { xlinkHref: "#" + type });
        }
        if (children) {
            content = children;
        }
        return (React.createElement(index_1.default, __assign({ type: type }, restProps, extraProps, { ref: function (node) {
                iconRef.current = node;
            } }), content));
    });
    Iconfont.displayName = 'Iconfont';
    return Iconfont;
}
exports.default = addFromIconFontCn;
