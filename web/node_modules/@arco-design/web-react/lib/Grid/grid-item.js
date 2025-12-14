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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useResponsiveState_1 = require("./hooks/useResponsiveState");
var context_1 = require("./context");
var utils_1 = require("./utils");
var is_1 = require("../_util/is");
var defaultProps = {
    suffix: false,
    offset: 0,
    span: 1,
};
function GridItem(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Grid.GridItem']);
    var children = props.children, className = props.className, style = props.style, propOffset = props.offset, propSpan = props.span, computedIndex = props.__index__;
    var gridContext = (0, react_1.useContext)(context_1.GridContext);
    var _c = (0, react_1.useContext)(context_1.GridDataCollectorContext), collectItemData = _c.collectItemData, removeItemData = _c.removeItemData;
    var colGap = gridContext.colGap, cols = gridContext.cols, displayIndexList = gridContext.displayIndexList, overflow = gridContext.overflow;
    var offset = (0, useResponsiveState_1.useResponsiveState)(propOffset, 0);
    var span = (0, useResponsiveState_1.useResponsiveState)(propSpan, 1);
    var prefixCls = getPrefixCls('grid-item');
    var visible = displayIndexList === null || displayIndexList === void 0 ? void 0 : displayIndexList.includes(computedIndex);
    var mergeClassName = (_a = {},
        _a["" + prefixCls] = true,
        _a[prefixCls + "-rtl"] = rtl,
        _a);
    var classNames = (0, classNames_1.default)(mergeClassName, className);
    var itemData = (0, react_1.useMemo)(function () {
        return (0, utils_1.resolveItemData)(gridContext.cols, {
            suffix: !!props.suffix,
            span: span,
            offset: offset,
        });
    }, [gridContext.cols, props.suffix, span, offset]);
    (0, react_1.useEffect)(function () {
        collectItemData(computedIndex, itemData);
        return function () {
            removeItemData(computedIndex);
        };
    }, [computedIndex, itemData]);
    var offsetStyle = (0, react_1.useMemo)(function () {
        var offset = itemData.offset, span = itemData.span;
        if (offset > 0) {
            var oneSpan = "(100% - " + colGap * (span - 1) + "px) / " + span;
            return {
                marginLeft: "calc((" + oneSpan + " * " + offset + ") + " + colGap * offset + "px)",
            };
        }
        return {};
    }, [itemData, colGap]);
    var columnStart = (0, react_1.useMemo)(function () {
        var suffix = itemData.suffix, span = itemData.span;
        if (suffix) {
            return "" + (cols - span + 1);
        }
        return "span " + span;
    }, [itemData, cols]);
    var visibleStyle = !visible || span === 0 ? { display: 'none' } : {};
    var gridItemStyle = __assign(__assign({ gridColumn: columnStart + " / span " + span }, offsetStyle), visibleStyle);
    return (react_1.default.createElement("div", { ref: ref, className: classNames, style: __assign(__assign({}, gridItemStyle), style) }, (0, is_1.isFunction)(children)
        ? children({ overflow: overflow })
        : react_1.default.Children.map(children, function (child) {
            if (child &&
                gridContext.collapsed &&
                react_1.default.isValidElement(child) &&
                !(0, is_1.isString)(child.type)) {
                // 排除原生 dom 标签，避免 overflow 属性透传到 dom 标签上
                return react_1.default.cloneElement(child, __assign({ overflow: overflow }, child.props));
            }
            return child;
        })));
}
var ForwardRefGridItem = (0, react_1.forwardRef)(GridItem);
var GridItemComponent = ForwardRefGridItem;
GridItemComponent.displayName = 'GridItem';
GridItemComponent.__ARCO_GRID_ITEM__ = true;
exports.default = GridItemComponent;
