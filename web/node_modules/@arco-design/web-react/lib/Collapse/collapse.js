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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapseContext = void 0;
var react_1 = __importStar(require("react"));
var is_1 = require("../_util/is");
var classNames_1 = __importDefault(require("../_util/classNames"));
var item_1 = __importDefault(require("./item"));
var omit_1 = __importDefault(require("../_util/omit"));
var ConfigProvider_1 = require("../ConfigProvider");
var IconCaretRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconCaretRight"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var IconCaretLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconCaretLeft"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var getActiveKeys = function (keys, accordion) {
    var res = [].concat(keys);
    if (accordion) {
        return res.slice(0, 1);
    }
    return res;
};
var defaultProps = {
    bordered: true,
    lazyload: true,
    expandIconPosition: 'left',
};
exports.CollapseContext = (0, react_1.createContext)({
    expandIconPosition: 'left',
    expandIcon: react_1.default.createElement(IconCaretRight_1.default, null),
    activeKeys: [],
    onToggle: function () { },
});
function Collapse(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Collapse);
    var _c = __read((0, useMergeValue_1.default)([], {
        defaultValue: 'defaultActiveKey' in props
            ? getActiveKeys(props.defaultActiveKey, props.accordion)
            : undefined,
        value: 'activeKey' in props ? getActiveKeys(props.activeKey, props.accordion) : undefined,
    }), 2), activeKeys = _c[0], setActiveKeys = _c[1];
    var children = props.children, className = props.className, style = props.style, bordered = props.bordered, lazyload = props.lazyload, expandIcon = props.expandIcon, expandIconPosition = props.expandIconPosition, destroyOnHide = props.destroyOnHide, accordion = props.accordion, triggerRegion = props.triggerRegion, onChange = props.onChange, rest = __rest(props, ["children", "className", "style", "bordered", "lazyload", "expandIcon", "expandIconPosition", "destroyOnHide", "accordion", "triggerRegion", "onChange"]);
    var prefixCls = getPrefixCls('collapse');
    var onItemClick = function (key, e) {
        var newActiveKeys = __spreadArray([], __read((activeKeys || [])), false);
        var index = activeKeys === null || activeKeys === void 0 ? void 0 : activeKeys.indexOf(key);
        if (index > -1) {
            newActiveKeys.splice(index, 1);
        }
        else if (accordion) {
            newActiveKeys = [key];
        }
        else {
            newActiveKeys.push(key);
        }
        if (!('activeKey' in props)) {
            setActiveKeys(newActiveKeys);
        }
        (0, is_1.isFunction)(onChange) && onChange(key, newActiveKeys, e);
    };
    return (react_1.default.createElement(exports.CollapseContext.Provider, { value: {
            activeKeys: activeKeys,
            triggerRegion: triggerRegion,
            lazyload: lazyload,
            destroyOnHide: destroyOnHide,
            expandIconPosition: expandIconPosition,
            onToggle: onItemClick,
            expandIcon: 'expandIcon' in props ? (expandIcon) : expandIconPosition === 'right' ? (react_1.default.createElement(IconCaretLeft_1.default, null)) : (react_1.default.createElement(IconCaretRight_1.default, null)),
        } },
        react_1.default.createElement("div", __assign({ ref: ref }, (0, omit_1.default)(rest, ['activeKey', 'defaultActiveKey']), { className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + (bordered ? 'border' : 'borderless'), (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), className), style: style }), children)));
}
var ForwardRefCollapse = react_1.default.forwardRef(Collapse);
var CollapseComponent = ForwardRefCollapse;
CollapseComponent.displayName = 'Collapse';
CollapseComponent.Item = item_1.default;
exports.default = CollapseComponent;
