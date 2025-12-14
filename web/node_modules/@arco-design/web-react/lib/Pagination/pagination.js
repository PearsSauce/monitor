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
var page_item_1 = __importStar(require("./page-item"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var page_options_1 = __importDefault(require("./page-options"));
var page_jumper_1 = __importDefault(require("./page-jumper"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
var _defaultCurrent = 1;
var _defaultPageSize = 10;
function getAllPages(pageSize, total) {
    if (pageSize === void 0) { pageSize = _defaultPageSize; }
    return Math.ceil(total / pageSize);
}
function getBufferSize(bufferSize, allPages) {
    var min = 0;
    var max = Math.floor(allPages / 2) - 1;
    var newBufferSize = Math.max(bufferSize, min);
    return Math.min(newBufferSize, max);
}
function getAdjustPageSize(sizeOptions) {
    if (sizeOptions && sizeOptions.length) {
        return sizeOptions[0];
    }
    return _defaultPageSize;
}
var defaultProps = {
    total: 0,
    pageSizeChangeResetCurrent: true,
    bufferSize: 2,
};
function Pagination(baseProps, ref) {
    var _a;
    var _b;
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, ctxSize = _c.size, locale = _c.locale, componentConfig = _c.componentConfig, rtl = _c.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Pagination);
    var propTotal = props.total, propPageSize = props.pageSize, propCurrent = props.current, propShowMore = props.showMore, propSizeOptions = props.sizeOptions, pageSizeChangeResetCurrent = props.pageSizeChangeResetCurrent, defaultCurrent = props.defaultCurrent, defaultPageSize = props.defaultPageSize;
    var _d = __read((0, useMergeValue_1.default)(_defaultCurrent, {
        defaultValue: defaultCurrent,
        value: propCurrent,
    }), 2), current = _d[0], setCurrent = _d[1];
    var _e = __read((0, useMergeValue_1.default)(getAdjustPageSize(propSizeOptions), {
        defaultValue: defaultPageSize,
        value: propPageSize,
    }), 2), pageSize = _e[0], setPageSize = _e[1];
    var total = propTotal;
    var showMore = !!propShowMore;
    if (propCurrent && !props.onChange) {
        console.warn('Warning: you have provide current prop for pagination but without onChange handler ,' +
            ' this will cause no-change when you change page. ');
    }
    function getAdjustedCurrent(newPageSize, newTotal) {
        var newAllPages = getAllPages(newPageSize, newTotal);
        var newCurrent = current > newAllPages ? newAllPages : current;
        return newCurrent;
    }
    (0, react_1.useEffect)(function () {
        // adjust pageSize after sizeOption changes
        var needAdjust = propSizeOptions && !propSizeOptions.includes(pageSize);
        // trigged when currentPageSize not in the options;
        if (needAdjust) {
            var adjustPageSize = getAdjustPageSize(propSizeOptions);
            if (!('pageSize' in props)) {
                setPageSize(adjustPageSize);
            }
        }
    }, [propSizeOptions]);
    (0, react_1.useEffect)(function () {
        // adjust currentPage after total and pageSize changes
        var newCurrent = getAdjustedCurrent(pageSize, total);
        if (newCurrent !== current && !('current' in props)) {
            setCurrent(newCurrent);
        }
    }, [total, current, pageSize]);
    var onChange = function (pageNumber, size) {
        if (pageNumber === void 0) { pageNumber = current; }
        if (size === void 0) { size = pageSize; }
        var onChange = props.onChange;
        onChange && onChange(pageNumber, size);
    };
    var onPageSizeChange = function (pageSize) {
        var onPageSizeChange = props.onPageSizeChange;
        var allPages = getAllPages(pageSize, total);
        var newState = {
            pageSize: pageSize,
        };
        if (pageSizeChangeResetCurrent) {
            newState.current = 1;
        }
        else {
            newState.current = current > allPages ? allPages : current;
        }
        if (!('pageSize' in props)) {
            setPageSize(newState.pageSize);
        }
        if (!('current' in props) && current !== newState.current) {
            setCurrent(newState.current);
        }
        onPageSizeChange && onPageSizeChange(pageSize, newState.current);
        onChange(pageSizeChangeResetCurrent ? 1 : newState.current, pageSize);
    };
    var onPageNumberChange = function (pageNumber) {
        if (!('current' in props)) {
            setCurrent(pageNumber);
        }
        onChange(pageNumber);
    };
    var className = props.className, style = props.style, pageItemStyle = props.pageItemStyle, activePageItemStyle = props.activePageItemStyle, showTotal = props.showTotal, sizeCanChange = props.sizeCanChange, sizeOptions = props.sizeOptions, simple = props.simple, mini = props.mini, showJumper = props.showJumper, selectProps = props.selectProps, icons = props.icons, disabled = props.disabled, itemRender = props.itemRender, hideOnSinglePage = props.hideOnSinglePage;
    var size = props.size || ctxSize;
    var prefixCls = getPrefixCls('pagination');
    // compatible 1.0
    var innerSize = mini ? 'mini' : size;
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-size-" + innerSize, (_a = {},
        _a[prefixCls + "-simple"] = simple,
        _a[prefixCls + "-disabled"] = disabled,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var renderPager;
    var pageList = [];
    var allPages = getAllPages(pageSize, total);
    var bufferSize = getBufferSize(props.bufferSize, allPages);
    if (hideOnSinglePage && allPages <= 1) {
        return null;
    }
    var pagerProps = {
        onClick: onPageNumberChange,
        rootPrefixCls: prefixCls,
        simple: simple,
        current: current,
        allPages: allPages,
        icons: icons,
        disabled: disabled,
        pageItemStyle: pageItemStyle,
        activePageItemStyle: activePageItemStyle,
        itemRender: itemRender,
    };
    // simple mode, no pager list
    if (simple) {
        var prefix = prefixCls + "-item-simple";
        renderPager = (react_1.default.createElement("ul", { className: prefixCls + "-list" },
            react_1.default.createElement(page_item_1.StepPager, __assign({ key: "previous" }, pagerProps, { type: page_item_1.StepType.previous })),
            react_1.default.createElement("li", { className: prefix + "-pager" },
                react_1.default.createElement(page_jumper_1.default, { disabled: disabled, rootPrefixCls: prefixCls, totalPages: allPages, current: current, onPageChange: onPageNumberChange, simple: { showJumper: typeof showJumper === 'boolean' ? showJumper : true }, size: innerSize })),
            react_1.default.createElement(page_item_1.StepPager, __assign({ key: "next" }, pagerProps, { type: page_item_1.StepType.next }))));
    }
    else {
        // fold = ... >= 2pages;
        var beginFoldPage = 1 + 2 + bufferSize;
        var endFoldPage = allPages - 2 - bufferSize;
        if (
        // beginPage(1 page) + bufferSize * 2 + endPage(1 page) + ...(2 pages)
        allPages <= 4 + bufferSize * 2 ||
            (current === beginFoldPage && current === endFoldPage)) {
            for (var i = 1; i <= allPages; i++) {
                pageList.push(react_1.default.createElement(page_item_1.default, __assign({}, pagerProps, { key: i, pageNum: i })));
            }
        }
        else {
            var left = 1;
            var right = allPages;
            var hasJumpPre = true;
            var hasJumpNext = true;
            // fold front and back
            if (current > beginFoldPage && current < endFoldPage) {
                right = current + bufferSize;
                left = current - bufferSize;
                // fold back
            }
            else if (current <= beginFoldPage) {
                hasJumpPre = false;
                left = 1;
                right = Math.max(beginFoldPage, bufferSize + current);
                // fold begin
            }
            else if (current >= endFoldPage) {
                hasJumpNext = false;
                right = allPages;
                left = Math.min(endFoldPage, current - bufferSize);
            }
            for (var i = left; i <= right; i++) {
                pageList.push(react_1.default.createElement(page_item_1.default, __assign({ key: i, pageNum: i }, pagerProps)));
            }
            var JumpPre = (react_1.default.createElement(page_item_1.JumpPager, __assign({}, pagerProps, { key: left - 1, type: page_item_1.StepType.previous, jumpPage: -(bufferSize * 2 + 1) })));
            var JumpNext = (react_1.default.createElement(page_item_1.JumpPager, __assign({}, pagerProps, { key: right + 1, type: page_item_1.StepType.next, jumpPage: bufferSize * 2 + 1 })));
            var FirstPager = react_1.default.createElement(page_item_1.default, __assign({ key: 1, pageNum: 1 }, pagerProps));
            var LastPager = react_1.default.createElement(page_item_1.default, __assign({}, pagerProps, { key: allPages, pageNum: allPages }));
            if (hasJumpPre) {
                pageList[0] = react_1.default.cloneElement(pageList[0], {
                    className: prefixCls + "-item-after-pre",
                });
                // TODO:
                pageList.unshift(JumpPre);
                pageList.unshift(FirstPager);
            }
            if (hasJumpNext) {
                pageList[pageList.length - 1] = react_1.default.cloneElement(pageList[pageList.length - 1], {
                    className: prefixCls + "-item-before-next",
                });
                pageList.push(JumpNext);
                pageList.push(LastPager);
            }
        }
        renderPager = (react_1.default.createElement("ul", { className: prefixCls + "-list" },
            react_1.default.createElement(page_item_1.StepPager, __assign({}, pagerProps, { key: "previous", type: page_item_1.StepType.previous })),
            pageList,
            showMore && (react_1.default.createElement(page_item_1.JumpPager, __assign({}, pagerProps, { key: allPages + 1, type: page_item_1.StepType.next, jumpPage: bufferSize * 2 + 1 }))),
            react_1.default.createElement(page_item_1.StepPager, __assign({ key: "next" }, pagerProps, { type: page_item_1.StepType.next }))));
    }
    var totalElement = null;
    if (typeof showTotal === 'boolean' && showTotal) {
        totalElement = (react_1.default.createElement("div", { className: prefixCls + "-total-text" }, (_b = locale.Pagination.total) === null || _b === void 0 ? void 0 : _b.replace('{0}', total)));
    }
    if (typeof showTotal === 'function') {
        totalElement = (react_1.default.createElement("div", { className: prefixCls + "-total-text" }, showTotal(total, [(current - 1) * pageSize + 1, current * pageSize])));
    }
    return (react_1.default.createElement("div", __assign({}, (0, pick_1.pickDataAttributes)(props), { className: classNames, style: style, ref: ref }),
        totalElement,
        renderPager,
        react_1.default.createElement(page_options_1.default, { disabled: disabled, rootPrefixCls: prefixCls, sizeCanChange: sizeCanChange, sizeOptions: sizeOptions, onPageSizeChange: onPageSizeChange, pageSize: pageSize, size: innerSize, selectProps: selectProps }),
        !simple && showJumper && (react_1.default.createElement(page_jumper_1.default, { disabled: disabled, rootPrefixCls: prefixCls, totalPages: allPages, current: current, onPageChange: onPageNumberChange, size: innerSize }))));
}
var PaginationComponent = (0, react_1.forwardRef)(Pagination);
PaginationComponent.displayName = 'Pagination';
exports.default = PaginationComponent;
