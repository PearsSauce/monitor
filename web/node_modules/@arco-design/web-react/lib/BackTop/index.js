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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var b_tween_1 = __importDefault(require("b-tween"));
var pick_1 = require("../_util/pick");
var classNames_1 = __importDefault(require("../_util/classNames"));
var IconToTop_1 = __importDefault(require("../../icon/react-icon-cjs/IconToTop"));
var ConfigProvider_1 = require("../ConfigProvider");
var dom_1 = require("../_util/dom");
var throttleByRaf_1 = __importDefault(require("../_util/throttleByRaf"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var defaultProps = {
    visibleHeight: 400,
    easing: 'quartOut',
    duration: 400,
    target: function () { return window; },
};
function BackTop(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.BackTop);
    var prefixCls = getPrefixCls('backtop');
    var _c = __read((0, react_1.useState)(false), 2), visible = _c[0], setVisible = _c[1];
    var getTarget = function (target) {
        return target === window ? document.documentElement : target;
    };
    (0, react_1.useEffect)(function () {
        var target = props.target && props.target();
        var scrollHandler = (0, throttleByRaf_1.default)(function () {
            var visibleHeight = props.visibleHeight;
            var scrollTop = getTarget(target).scrollTop;
            setVisible(scrollTop >= visibleHeight);
        });
        (0, dom_1.on)(target, 'scroll', scrollHandler);
        scrollHandler();
        return function () {
            scrollHandler.cancel && scrollHandler.cancel();
            (0, dom_1.off)(target, 'scroll', scrollHandler);
        };
    }, [props.target, props.visibleHeight]);
    var scrollToTop = function () {
        var targetDom = props.target && props.target();
        var t = getTarget(targetDom);
        var scrollTop = t.scrollTop;
        var tween = new b_tween_1.default({
            from: { scrollTop: scrollTop },
            to: { scrollTop: 0 },
            easing: props.easing,
            duration: props.duration,
            onUpdate: function (keys) {
                t.scrollTop = keys.scrollTop;
            },
        });
        tween.start();
        props.onClick && props.onClick();
    };
    return (react_1.default.createElement("div", __assign({}, (0, pick_1.pickDataAttributes)(props), { ref: ref, className: (0, classNames_1.default)("" + prefixCls, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), props.className), style: props.style, onClick: scrollToTop }, getKeyboardEvents({
        onPressEnter: scrollToTop,
    })),
        react_1.default.createElement(CSSTransition_1.default, { in: visible, timeout: 100, classNames: "fadeIn", unmountOnExit: true }, props.children || (react_1.default.createElement("button", { className: prefixCls + "-button" },
            react_1.default.createElement(IconToTop_1.default, null))))));
}
var BackTopRef = (0, react_1.forwardRef)(BackTop);
BackTopRef.displayName = 'BackTop';
exports.default = (0, react_1.memo)(BackTopRef);
