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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var omit_1 = __importDefault(require("../_util/omit"));
var ConfigProvider_1 = require("../ConfigProvider");
var responsiveObserve_1 = __importStar(require("../_util/responsiveObserve"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var context_1 = require("./context");
var defaultProps = {
    gutter: 0,
    align: 'start',
    justify: 'start',
};
function Row(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Grid.Row']);
    var className = props.className, style = props.style, children = props.children, div = props.div, align = props.align, justify = props.justify, gutter = props.gutter, rest = __rest(props, ["className", "style", "children", "div", "align", "justify", "gutter"]);
    var _c = __read((0, react_1.useState)({
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true,
        xxl: true,
        xxxl: true,
    }), 2), screens = _c[0], setScreens = _c[1];
    var token = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        token.current = responsiveObserve_1.default.subscribe(function (screens) {
            // Responsive Gutter
            if ((!Array.isArray(gutter) && typeof gutter === 'object') ||
                (Array.isArray(gutter) && (typeof gutter[0] === 'object' || typeof gutter[1] === 'object'))) {
                setScreens(screens);
            }
        });
        return function () {
            responsiveObserve_1.default.unsubscribe(token.current);
        };
    }, []);
    function getGutter(gutter) {
        var result = 0;
        if (typeof gutter === 'object') {
            for (var i = 0; i < responsiveObserve_1.responsiveArray.length; i++) {
                var breakpoint = responsiveObserve_1.responsiveArray[i];
                if (screens[breakpoint] && gutter[breakpoint] !== undefined) {
                    result = gutter[breakpoint];
                    break;
                }
            }
        }
        else {
            result = gutter;
        }
        return result;
    }
    var prefixCls = getPrefixCls('row');
    var classNames = (0, classNames_1.default)((_a = {},
        _a["" + prefixCls] = !div,
        _a[prefixCls + "-align-" + align] = align,
        _a[prefixCls + "-justify-" + justify] = justify,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var marginStyle = {};
    var gutterHorizontal = getGutter(Array.isArray(gutter) ? gutter[0] : gutter);
    var gutterVertical = getGutter(Array.isArray(gutter) ? gutter[1] : 0);
    if ((gutterHorizontal || gutterVertical) && !div) {
        var marginHorizontal = -gutterHorizontal / 2;
        var marginVertical = -gutterVertical / 2;
        if (marginHorizontal) {
            marginStyle.marginLeft = marginHorizontal;
            marginStyle.marginRight = marginHorizontal;
        }
        if (marginVertical) {
            marginStyle.marginTop = marginVertical;
            marginStyle.marginBottom = marginVertical;
        }
    }
    return (react_1.default.createElement("div", __assign({ ref: ref }, (0, omit_1.default)(rest, ['gutter']), { style: __assign(__assign({}, style), marginStyle), className: classNames }),
        react_1.default.createElement(context_1.RowContext.Provider, { value: { gutter: [gutterHorizontal, gutterVertical], div: div } }, children)));
}
var RowComponent = (0, react_1.forwardRef)(Row);
RowComponent.displayName = 'Row';
exports.default = RowComponent;
