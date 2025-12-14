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
var throttle_1 = __importDefault(require("lodash/throttle"));
var Pagination_1 = __importDefault(require("../Pagination"));
var Spin_1 = __importDefault(require("../Spin"));
var item_1 = __importDefault(require("./item"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var row_1 = __importDefault(require("../Grid/row"));
var col_1 = __importDefault(require("../Grid/col"));
var ConfigProvider_1 = require("../ConfigProvider");
var omit_1 = __importDefault(require("../_util/omit"));
var VirtualList_1 = __importDefault(require("../_class/VirtualList"));
var scrollIntoView_1 = __importDefault(require("../_util/scrollIntoView"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
var DEFAULT_PAGE_SIZE = 10;
var DEFAULT_PAGE_CURRENT = 1;
var SizeList = ['small', 'default', 'large'];
var defaultProps = {
    split: true,
    bordered: true,
    defaultCurrent: 1,
    offsetBottom: 0,
    throttleDelay: 500,
};
function List(baseProps, ref) {
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _a.getPrefixCls, loadingElement = _a.loadingElement, ctxSize = _a.size, renderEmpty = _a.renderEmpty, componentConfig = _a.componentConfig, rtl = _a.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.List);
    var style = props.style, wrapperStyle = props.wrapperStyle, className = props.className, wrapperClassName = props.wrapperClassName, _b = props.children, children = _b === void 0 ? [] : _b, _c = props.dataSource, dataSource = _c === void 0 ? [] : _c, propSize = props.size, footer = props.footer, header = props.header, pagination = props.pagination, bordered = props.bordered, split = props.split, render = props.render, grid = props.grid, loading = props.loading, hoverable = props.hoverable, scrollLoading = props.scrollLoading, paginationInFooter = props.paginationInFooter, offsetBottom = props.offsetBottom, throttleDelay = props.throttleDelay, defaultCurrent = props.defaultCurrent, noDataElement = props.noDataElement, listRef = props.listRef, onReachBottom = props.onReachBottom, onListScroll = props.onListScroll;
    var size = propSize || (SizeList.indexOf(ctxSize) > -1 ? ctxSize : 'default');
    var prefixCls = getPrefixCls('list');
    var refDom = (0, react_1.useRef)(null);
    var refVirtualList = (0, react_1.useRef)(null);
    var refScrollElement = (0, react_1.useRef)(null);
    var refItemListWrapper = (0, react_1.useRef)(null);
    var refCanTriggerReachBottom = (0, react_1.useRef)(true);
    var _d = __read((0, react_1.useState)(pagination && typeof pagination === 'object'
        ? pagination.pageSize || pagination.defaultPageSize || DEFAULT_PAGE_SIZE
        : DEFAULT_PAGE_SIZE), 2), pageSize = _d[0], setPageSize = _d[1];
    var _e = __read((0, react_1.useState)(pagination && typeof pagination === 'object'
        ? pagination.current || pagination.defaultCurrent || DEFAULT_PAGE_CURRENT
        : DEFAULT_PAGE_CURRENT), 2), paginationCurrent = _e[0], setPaginationCurrent = _e[1];
    var _f = __read((0, react_1.useState)(defaultCurrent), 2), pageCurrentForScroll = _f[0], setPageCurrentForScroll = _f[1];
    var childrenCount = react_1.default.Children.count(children);
    (0, react_1.useImperativeHandle)(listRef, function () {
        return {
            dom: refDom.current,
            scrollIntoView: function (index, options) {
                if (refVirtualList.current) {
                    refVirtualList.current.scrollTo({ index: index, options: options });
                }
                else if (refItemListWrapper.current) {
                    var node = refItemListWrapper.current.children[index];
                    node &&
                        (0, scrollIntoView_1.default)(node, __assign({ boundary: refScrollElement.current }, options));
                }
            },
            getRootDOMNode: function () { return refDom.current; },
        };
    });
    // compatible with old API: height
    var virtualListProps = props.virtualListProps
        ? props.virtualListProps
        : props.height
            ? { height: props.height }
            : undefined;
    // pagination props
    var paginationProps = __assign(__assign({ pageSize: pageSize, current: paginationCurrent, total: dataSource.length > 0 ? dataSource.length : childrenCount }, (typeof pagination === 'object' ? pagination : {})), { onPageSizeChange: function (size, current) {
            setPageSize(size);
            pagination &&
                typeof pagination === 'object' &&
                pagination.onPageSizeChange &&
                pagination.onPageSizeChange(size, current);
        }, onChange: function (pageNumber, pageSize) {
            setPaginationCurrent(pageNumber);
            pagination &&
                typeof pagination === 'object' &&
                pagination.onChange &&
                pagination.onChange(pageNumber, pageSize);
        } });
    paginationProps.current = Math.min(paginationProps.current, Math.ceil(paginationProps.total / paginationProps.pageSize));
    var needHandleScroll = !!(onListScroll || onReachBottom);
    var throttledScrollHandler = (0, react_1.useCallback)((0, throttle_1.default)(function () {
        if (onListScroll) {
            onListScroll(refScrollElement.current);
            return;
        }
        if (!refScrollElement.current)
            return;
        var _a = refScrollElement.current, scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
        var scrollBottom = scrollHeight - (scrollTop + clientHeight);
        // https://github.com/arco-design/arco-design/issues/850
        // offsetBottom + 1: scrollTop is a non-rounded number, while scrollHeight and clientHeight are both rounded
        if (Math.abs(scrollBottom) < offsetBottom + 1) {
            if (refCanTriggerReachBottom.current) {
                setPageCurrentForScroll(pageCurrentForScroll + 1);
                onReachBottom && onReachBottom(pageCurrentForScroll + 1);
                refCanTriggerReachBottom.current = false;
            }
        }
        else {
            refCanTriggerReachBottom.current = true;
        }
    }, throttleDelay), [throttleDelay, pageCurrentForScroll, onListScroll, onReachBottom]);
    // render content of list
    var renderListItems = function () {
        // get the data source to render current page
        var getCurrentPageItems = function (items) {
            var current = paginationProps.current, pageSize = paginationProps.pageSize;
            var startIndex = (current - 1) * pageSize;
            return pagination && items.length > startIndex
                ? items.slice(startIndex, startIndex + pageSize)
                : items;
        };
        // The current page of the normal list children
        var getItems = function (originItems, render) {
            var currentPageItems = getCurrentPageItems(originItems);
            return render ? currentPageItems.map(render) : currentPageItems;
        };
        // The current page of the Grid list children
        var getGrid = function (originItems, render) {
            var currentPageItems = getCurrentPageItems(originItems);
            if (grid.column || grid.span) {
                var items = [];
                var gutter = grid.gutter, justify = grid.justify, align = grid.align, gridRowSize = grid.column, colProps_1 = __rest(grid, ["gutter", "justify", "align", "column"]);
                var rowSize = gridRowSize || Math.floor(24 / grid.span);
                var span_1 = colProps_1.span || Math.floor(24 / rowSize);
                var startNum_1 = 0;
                var _loop_1 = function () {
                    var nextStartNum = startNum_1 + rowSize;
                    var currentRow = ~~(startNum_1 / rowSize);
                    items.push(react_1.default.createElement(row_1.default, { key: currentRow, className: prefixCls + "-row", gutter: gutter, justify: justify, align: align }, currentPageItems.slice(startNum_1, nextStartNum).map(function (item, index) { return (react_1.default.createElement(col_1.default, __assign({ key: currentRow + "_" + index, className: prefixCls + "-row-col" }, colProps_1, { span: span_1 }), render ? render(item, startNum_1 + index) : item)); })));
                    startNum_1 = nextStartNum;
                };
                while (startNum_1 < currentPageItems.length) {
                    _loop_1();
                }
                return items;
            }
            return (react_1.default.createElement(row_1.default, { className: prefixCls + "-row", gutter: grid.gutter }, currentPageItems.map(function (item, index) { return (react_1.default.createElement(col_1.default, __assign({ className: prefixCls + "-row-col" }, (0, omit_1.default)(grid, ['gutter']), { key: index }), render ? render(item, index) : item)); })));
        };
        if (dataSource.length > 0 && render) {
            return grid ? getGrid(dataSource, render) : getItems(dataSource, render);
        }
        if (childrenCount > 0) {
            return grid ? getGrid(children) : getItems(children);
        }
        if (!scrollLoading) {
            return noDataElement || renderEmpty('List');
        }
        return null;
    };
    var renderList = function () {
        var _a, _b;
        var listItems = renderListItems();
        var isVirtual = virtualListProps && virtualListProps.threshold !== null && Array.isArray(listItems);
        var paginationElement = pagination ? (react_1.default.createElement(Pagination_1.default, __assign({}, paginationProps, { className: (0, classNames_1.default)(prefixCls + "-pagination", paginationProps && paginationProps.className) }))) : null;
        var paginationElementInsideFooter = paginationInFooter ? paginationElement : null;
        var paginationElementOutsideFooter = paginationInFooter ? null : paginationElement;
        var scrollLoadingEle = scrollLoading !== undefined && scrollLoading !== null ? (react_1.default.createElement("div", { className: prefixCls + "-item " + prefixCls + "-scroll-loading" }, scrollLoading)) : null;
        return (react_1.default.createElement("div", { ref: function (_ref) {
                ref = _ref;
                refDom.current = ref;
            }, style: wrapperStyle, className: (0, classNames_1.default)(prefixCls + "-wrapper", (_a = {}, _a[prefixCls + "-wrapper-rtl"] = rtl, _a), wrapperClassName) },
            react_1.default.createElement("div", __assign({}, (0, pick_1.pickDataAttributes)(props), { style: style, className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + size, (_b = {},
                    _b[prefixCls + "-no-border"] = !bordered,
                    _b[prefixCls + "-no-split"] = !split,
                    _b[prefixCls + "-hoverable"] = hoverable,
                    _b[prefixCls + "-rtl"] = rtl,
                    _b), className), ref: function (ref) {
                    if (!isVirtual) {
                        refScrollElement.current = ref;
                    }
                }, onScroll: !isVirtual && needHandleScroll ? throttledScrollHandler : undefined }),
                header ? react_1.default.createElement("div", { className: prefixCls + "-header" }, header) : null,
                isVirtual ? (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(VirtualList_1.default, __assign({ role: "list", ref: function (ref) {
                            if (ref) {
                                refVirtualList.current = ref;
                                refScrollElement.current = ref.dom;
                            }
                        }, className: prefixCls + "-content " + prefixCls + "-virtual", data: scrollLoadingEle ? listItems.concat(scrollLoadingEle) : listItems, isStaticItemHeight: false, onScroll: needHandleScroll ? throttledScrollHandler : undefined }, virtualListProps), function (child) { return child; }))) : (react_1.default.createElement("div", { role: "list", className: prefixCls + "-content", ref: refItemListWrapper },
                    listItems,
                    scrollLoadingEle)),
                footer || paginationElementInsideFooter ? (react_1.default.createElement("div", { className: prefixCls + "-footer" },
                    footer,
                    paginationElementInsideFooter)) : null),
            paginationElementOutsideFooter));
    };
    return 'loading' in props ? (react_1.default.createElement(Spin_1.default, { style: { display: 'block' }, loading: loading, element: loadingElement || react_1.default.createElement(Spin_1.default, null) }, renderList())) : (renderList());
}
var ListComponent = react_1.default.forwardRef(List);
ListComponent.displayName = 'List';
ListComponent.Item = item_1.default;
exports.default = ListComponent;
