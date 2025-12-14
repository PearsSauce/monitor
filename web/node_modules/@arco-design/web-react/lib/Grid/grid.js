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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var react_1 = __importStar(require("react"));
var get_1 = __importDefault(require("lodash/get"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useResponsiveState_1 = require("./hooks/useResponsiveState");
var context_1 = require("./context");
var utils_1 = require("./utils");
var defaultProps = {
    collapsed: false,
    collapsedRows: 1,
    cols: 24,
    colGap: 0,
    rowGap: 0,
};
function Grid(baseProps, ref) {
    var _a;
    var _b = __read((0, react_1.useState)(new Map()), 2), itemDataMap = _b[0], setItemDataMap = _b[1];
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, componentConfig = _c.componentConfig, rtl = _c.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Grid);
    var children = props.children, className = props.className, style = props.style, propCols = props.cols, propColGap = props.colGap, propRowGap = props.rowGap, collapsed = props.collapsed, collapsedRows = props.collapsedRows;
    var cols = (0, useResponsiveState_1.useResponsiveState)(propCols, 24);
    var colGap = (0, useResponsiveState_1.useResponsiveState)(propColGap, 0);
    var rowGap = (0, useResponsiveState_1.useResponsiveState)(propRowGap, 0);
    var gridStyle = {
        gap: rowGap + "px " + colGap + "px",
        gridTemplateColumns: "repeat(" + cols + ", minmax(0px, 1fr))",
    };
    var prefixCls = getPrefixCls('grid');
    var mergeClassName = (_a = {},
        _a["" + prefixCls] = true,
        _a[prefixCls + "-rtl"] = rtl,
        _a);
    var classNames = (0, classNames_1.default)(mergeClassName, className);
    var getItemDataList = function () {
        var e_1, _a;
        var list = [];
        try {
            for (var _b = __values(itemDataMap.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), index = _d[0], itemData = _d[1];
                list[index] = itemData;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return list;
    };
    var itemDataList = getItemDataList();
    var displayInfo = (0, utils_1.setItemVisible)({
        cols: cols,
        collapsed: collapsed,
        collapsedRows: collapsedRows,
        itemDataList: itemDataList,
    });
    return (react_1.default.createElement("div", { ref: ref, className: classNames, style: __assign(__assign({}, gridStyle), style) },
        react_1.default.createElement(context_1.GridDataCollectorContext.Provider, { value: {
                collectItemData: function (index, itemData) {
                    itemDataMap.set(index, itemData);
                    setItemDataMap(new Map(__spreadArray([], __read(itemDataMap), false)));
                },
                removeItemData: function (index) {
                    itemDataMap.delete(index);
                    setItemDataMap(new Map(__spreadArray([], __read(itemDataMap), false)));
                },
            } },
            react_1.default.createElement(context_1.GridContext.Provider, { value: {
                    cols: cols,
                    colGap: colGap,
                    collapsed: collapsed,
                    overflow: displayInfo.overflow,
                    displayIndexList: displayInfo.displayIndexList,
                } }, react_1.default.Children.map(children, function (child, index) {
                if (child) {
                    var childProps = __assign({ __index__: index }, child.props);
                    return react_1.default.cloneElement(child, childProps);
                }
                return null;
            }).filter(function (child) { return (0, get_1.default)(child, 'type.__ARCO_GRID_ITEM__'); })))));
}
var GridComponent = (0, react_1.forwardRef)(Grid);
GridComponent.displayName = 'Grid';
exports.default = GridComponent;
