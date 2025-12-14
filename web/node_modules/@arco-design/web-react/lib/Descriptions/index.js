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
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var responsiveObserve_1 = __importStar(require("../_util/responsiveObserve"));
var is_1 = require("../_util/is");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var getLength = function (arr) {
    return (0, is_1.isArray)(arr) ? arr.reduce(function (p, n) { return p + (n.span || 1); }, 0) : 0;
};
var defaultProps = {
    layout: 'horizontal',
    column: 3,
    tableLayout: 'auto',
};
function Descriptions(baseProps) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl, ctxSize = _b.size;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Descriptions);
    var style = props.style, className = props.className, column = props.column, title = props.title, data = props.data, border = props.border, labelStyle = props.labelStyle, valueStyle = props.valueStyle, colon = props.colon, layout = props.layout, size = props.size, tableLayout = props.tableLayout;
    var prefixCls = getPrefixCls('descriptions');
    var _c = __read((0, react_1.useState)(), 2), screen = _c[0], setScreen = _c[1];
    var responsiveToken = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        responsiveToken.current = responsiveObserve_1.default.subscribe(function (screens) {
            for (var i = 0; i < responsiveObserve_1.responsiveArray.length; i++) {
                var breakpoint = responsiveObserve_1.responsiveArray[i];
                if (screens[breakpoint]) {
                    setScreen(breakpoint);
                    break;
                }
            }
        });
        return function () {
            responsiveObserve_1.default.unsubscribe(responsiveToken.current);
        };
    }, []);
    // get current column number
    var currentColumn = 3;
    if ((0, is_1.isObject)(column)) {
        currentColumn = column[screen] || 3;
    }
    if ((0, is_1.isNumber)(column) && column > 0) {
        currentColumn = column;
    }
    var renderData = [];
    if ((0, is_1.isArray)(data) && data.length > 0 && currentColumn) {
        data.forEach(function (d) {
            var lastOne = renderData[renderData.length - 1];
            var length = getLength(lastOne);
            if (length === 0) {
                renderData.push([
                    __assign(__assign({}, d), { span: d.span ? (d.span > currentColumn ? currentColumn : d.span) : 1 }),
                ]);
            }
            else if (length === currentColumn) {
                renderData.push([
                    __assign(__assign({}, d), { span: d.span ? (d.span > currentColumn ? currentColumn : d.span) : 1 }),
                ]);
            }
            else {
                lastOne.push(__assign(__assign({}, d), { span: d.span ? (d.span + length > currentColumn ? currentColumn - length : d.span) : 1 }));
            }
        });
        var lastOne = renderData[renderData.length - 1];
        var lastLength = getLength(lastOne);
        if (lastLength < currentColumn) {
            lastOne[lastOne.length - 1].span =
                lastOne[lastOne.length - 1].span + currentColumn - lastLength;
        }
    }
    function renderVerticalItems(d, i) {
        return (react_1.default.createElement(react_1.Fragment, { key: i },
            react_1.default.createElement("tr", { className: prefixCls + "-row" }, d.map(function (_d, _i) {
                var colSpanProps = _d.span > 1 ? { colSpan: _d.span } : {};
                return (react_1.default.createElement("td", __assign({ key: (_d.key || _i) + "_label", className: prefixCls + "-item-label" }, colSpanProps, { style: labelStyle }),
                    _d.label,
                    colon));
            })),
            react_1.default.createElement("tr", { className: prefixCls + "-row" }, d.map(function (_d, _i) {
                var colSpanProps = _d.span > 1 ? { colSpan: _d.span } : {};
                return (react_1.default.createElement("td", __assign({ key: (_d.key || _i) + "_value", className: prefixCls + "-item-value" }, colSpanProps, { style: valueStyle }), _d.value));
            }))));
    }
    function renderHorizontalItems(d, i) {
        return (react_1.default.createElement("tr", { key: i, className: prefixCls + "-row" }, d.map(function (_d, _i) {
            var colSpanProps = _d.span > 1 ? { colSpan: _d.span * 2 - 1 } : {};
            return (react_1.default.createElement(react_1.Fragment, { key: _d.key || _i },
                react_1.default.createElement("td", { className: prefixCls + "-item-label", style: labelStyle },
                    _d.label,
                    colon),
                react_1.default.createElement("td", __assign({ className: prefixCls + "-item-value" }, colSpanProps, { style: valueStyle }), _d.value)));
        })));
    }
    function renderInlineItems(d, i) {
        return (react_1.default.createElement("tr", { key: i, className: prefixCls + "-row" }, d.map(function (_d, _i) {
            var colSpanProps = _d.span > 1 ? { colSpan: _d.span } : {};
            return (react_1.default.createElement("td", __assign({ key: _d.key || _i }, colSpanProps, { className: prefixCls + "-item" }),
                react_1.default.createElement("div", { className: prefixCls + "-item-label-inline", style: labelStyle },
                    _d.label,
                    colon),
                react_1.default.createElement("div", { className: prefixCls + "-item-value-inline", style: valueStyle }, _d.value)));
        })));
    }
    function renderItems(d, i) {
        if (layout === 'inline-vertical' || layout === 'inline-horizontal') {
            return renderInlineItems(d, i);
        }
        return layout === 'vertical' ? renderVerticalItems(d, i) : renderHorizontalItems(d, i);
    }
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-border"] = border,
        _a[prefixCls + "-layout-" + layout] = layout,
        _a[prefixCls + "-size-" + (size || ctxSize)] = size || ctxSize,
        _a[prefixCls + "-table-layout-fixed"] = tableLayout === 'fixed',
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    return (react_1.default.createElement("div", { className: classNames, style: style },
        title && react_1.default.createElement("div", { className: prefixCls + "-title" }, title),
        react_1.default.createElement("div", { className: prefixCls + "-body" },
            react_1.default.createElement("table", { className: prefixCls + "-table", cellPadding: 0, cellSpacing: 0 },
                react_1.default.createElement("tbody", null, renderData.map(function (d, i) { return renderItems(d, i); }))))));
}
Descriptions.displayName = 'Descriptions';
exports.default = Descriptions;
