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
var ConfigProvider_1 = require("../ConfigProvider");
var classNames_1 = __importDefault(require("../_util/classNames"));
var index_1 = require("../index");
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var throttleByRaf_1 = __importDefault(require("../_util/throttleByRaf"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var is_1 = require("../_util/is");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var dom_1 = require("../_util/dom");
var defaultProps = {
    rows: 1,
    expandable: true,
    defaultExpanded: false,
};
var EllipsisComponent = function (baseProps, _) {
    var _a, _b;
    var ctx = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, (_a = ctx.componentConfig) === null || _a === void 0 ? void 0 : _a['Typography.Ellipsis']);
    var className = props.className, style = props.style, rows = props.rows, disabled = props.disabled, showTooltip = props.showTooltip, children = props.children, expandable = props.expandable, expandRender = props.expandRender, onExpand = props.onExpand, onEllipsis = props.onEllipsis;
    var locale = ctx.locale;
    var isSafari = dom_1.isServerRendering
        ? false
        : /^((?!chrome|android).)*safari/i.test((_b = navigator === null || navigator === void 0 ? void 0 : navigator.userAgent) !== null && _b !== void 0 ? _b : '');
    var wrapperRef = (0, react_1.useRef)(null);
    var textRef = (0, react_1.useRef)(null);
    var _c = __read((0, react_1.useState)(''), 2), text = _c[0], setText = _c[1];
    var _d = __read((0, react_1.useState)(false), 2), visible = _d[0], setVisible = _d[1];
    var mirrorContentRef = (0, react_1.useRef)(null);
    var mirrorTextRef = (0, react_1.useRef)(null);
    var _e = __read((0, useMergeValue_1.default)(false, {
        defaultValue: props.defaultExpanded,
        value: props.expanded,
    }), 2), expanded = _e[0], setExpanded = _e[1];
    var _f = __read((0, react_1.useState)(false), 2), overflow = _f[0], setOverflow = _f[1];
    var single = (0, react_1.useMemo)(function () {
        if ((0, is_1.isObject)(expandable)) {
            return !expandable.single && rows === 1;
        }
        return rows === 1;
    }, [rows, expandable]);
    var tooltipData = (0, react_1.useMemo)(function () {
        if ((0, is_1.isObject)(showTooltip)) {
            return {
                tooltip: true,
                tooltipProps: showTooltip,
            };
        }
        return {
            tooltip: Boolean(showTooltip),
            tooltipProps: showTooltip,
        };
    }, [showTooltip]);
    (0, react_1.useEffect)(function () {
        if (textRef.current) {
            var content = textRef.current.textContent;
            if (content) {
                setText(content);
            }
        }
    }, [children, textRef]);
    var prefix = ctx.getPrefixCls('ellipsis');
    var renderActionContent = function () {
        if (expandRender) {
            return expandRender(expanded);
        }
        return (react_1.default.createElement("span", { className: prefix + "-action-text" }, expanded ? locale.Typography.fold : locale.Typography.unfold));
    };
    var renderAction = function () {
        var _a;
        if (expandable && overflow) {
            return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefix + "-action", (_a = {},
                    _a[prefix + "-action-collapsed"] = !expanded,
                    _a)), onClick: function (ev) {
                    if (expanded) {
                        setExpanded(false);
                        // @ts-ignore
                        onExpand === null || onExpand === void 0 ? void 0 : onExpand(false, ev);
                    }
                    else {
                        setExpanded(true);
                        setVisible(false);
                        // @ts-ignore
                        onExpand === null || onExpand === void 0 ? void 0 : onExpand(true, ev);
                    }
                } }, renderActionContent()));
        }
        return null;
    };
    var onResize = (0, react_1.useCallback)((0, throttleByRaf_1.default)(function () {
        if (mirrorTextRef.current && mirrorContentRef.current) {
            var isOverflow = single
                ? mirrorTextRef.current.offsetWidth > mirrorContentRef.current.offsetWidth
                : mirrorTextRef.current.offsetHeight > mirrorContentRef.current.offsetHeight;
            if (isOverflow) {
                if (overflow === false) {
                    setOverflow(true);
                    onEllipsis === null || onEllipsis === void 0 ? void 0 : onEllipsis(true);
                }
            }
            else if (overflow === true) {
                setOverflow(false);
                onEllipsis === null || onEllipsis === void 0 ? void 0 : onEllipsis(false);
            }
        }
    }), [overflow, single]);
    var renderMirror = function () {
        if (disabled) {
            return null;
        }
        return (react_1.default.createElement(resizeObserver_1.default, { onResize: onResize },
            react_1.default.createElement("div", { className: single
                    ? (0, classNames_1.default)(prefix + "-content-mirror", prefix + "-single")
                    : (0, classNames_1.default)(prefix + "-content-mirror", prefix + "-multiple", prefix + "-collapsed"), style: {
                    WebkitBoxOrient: 'vertical',
                    MozBoxOrient: 'vertical',
                    WebkitLineClamp: rows,
                }, ref: mirrorContentRef },
                react_1.default.createElement(resizeObserver_1.default, { onResize: onResize },
                    react_1.default.createElement("span", { ref: mirrorTextRef, className: prefix + "-text" }, children)))));
    };
    var renderContent = function () {
        var _a, _b;
        if (single) {
            return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefix + "-content", prefix + "-single") },
                react_1.default.createElement("span", { ref: textRef, className: prefix + "-text" }, children)));
        }
        if (isSafari) {
            return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefix + "-content", prefix + "-multiple"), title: !tooltipData.tooltip && overflow && !expanded ? text : undefined },
                !expanded && renderAction(),
                react_1.default.createElement("span", { ref: textRef, className: (0, classNames_1.default)(prefix + "-text", (_a = {},
                        _a[prefix + "-collapsed"] = !expanded,
                        _a)), style: {
                        WebkitBoxOrient: 'vertical',
                        MozBoxOrient: 'vertical',
                        WebkitLineClamp: rows,
                    } }, children),
                expanded && renderAction()));
        }
        return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefix + "-content", prefix + "-multiple", (_b = {},
                _b[prefix + "-collapsed"] = !expanded,
                _b)), style: {
                WebkitBoxOrient: 'vertical',
                MozBoxOrient: 'vertical',
                WebkitLineClamp: rows,
            }, title: !tooltipData.tooltip && overflow && !expanded ? text : undefined },
            !expanded && renderAction(),
            react_1.default.createElement("span", { ref: textRef, className: prefix + "-text" }, children),
            expanded && renderAction()));
    };
    var renderWrapper = function () {
        if (disabled) {
            return (react_1.default.createElement("div", { className: prefix + "-content" },
                react_1.default.createElement("span", { ref: textRef, className: prefix + "-text" }, children)));
        }
        if (tooltipData.tooltip) {
            return (react_1.default.createElement(index_1.Tooltip, __assign({ content: text, popupVisible: visible, disabled: !overflow || expanded, triggerProps: {
                    mouseEnterDelay: 100,
                }, onVisibleChange: function (visible) {
                    if (visible) {
                        if (overflow && !expanded) {
                            setVisible(true);
                        }
                    }
                    else {
                        setVisible(false);
                    }
                } }, tooltipData.tooltipProps), renderContent()));
        }
        return renderContent();
    };
    return (react_1.default.createElement("div", { ref: wrapperRef, className: (0, classNames_1.default)(prefix, className), style: style },
        renderMirror(),
        renderWrapper()));
};
var Ellipsis = (0, react_1.forwardRef)(EllipsisComponent);
exports.default = Ellipsis;
