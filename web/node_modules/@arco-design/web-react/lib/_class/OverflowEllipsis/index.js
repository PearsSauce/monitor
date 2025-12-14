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
var resizeObserver_1 = __importDefault(require("../../_util/resizeObserver"));
var OverflowItem_1 = __importDefault(require("./OverflowItem"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var ConfigProvider_1 = require("../../ConfigProvider");
function OverflowEllipsis(props) {
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('overflow');
    var items = props.items, suffixItems = props.suffixItems;
    var ellipsisNode = props.ellipsisNode || (function (_a) {
        var ellipsisCount = _a.ellipsisCount;
        return "+" + ellipsisCount;
    });
    var _a = __read((0, react_1.useState)(), 2), containerWidth = _a[0], setContainerWidth = _a[1];
    var _b = __read((0, react_1.useState)(), 2), maxCount = _b[0], setMaxCount = _b[1];
    var _c = __read((0, react_1.useState)({}), 2), overflowItems = _c[0], setOverflowItems = _c[1];
    var _d = __read((0, react_1.useState)({}), 2), suffixOverflowItems = _d[0], setSuffixOverflowItems = _d[1];
    var ellipsisCount = items.length - maxCount;
    var maxTag = ellipsisCount > 0 ? ellipsisNode({ ellipsisCount: ellipsisCount }) : null;
    (0, react_1.useLayoutEffect)(function () {
        var total = Object.values(overflowItems).length;
        var totalWidth = Object.values(suffixOverflowItems).reduce(function (t, n) {
            return t + ((n === null || n === void 0 ? void 0 : n.width) || 0);
        }, 0);
        var newMaxCount = total;
        Object.keys(overflowItems).some(function (key, index) {
            var target = overflowItems[key];
            if (target && totalWidth + target.width > containerWidth) {
                newMaxCount = index;
                return true;
            }
            totalWidth += (target === null || target === void 0 ? void 0 : target.width) || 0;
        });
        setMaxCount(Math.max(newMaxCount, 0));
    }, [overflowItems, containerWidth, suffixOverflowItems]);
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: function (entry) {
            var _a;
            setContainerWidth(((_a = entry === null || entry === void 0 ? void 0 : entry[0]) === null || _a === void 0 ? void 0 : _a.target.clientWidth) || 0);
        } },
        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls, props.className) },
            items.map(function (item, index) {
                var _a;
                var key = (((_a = item) === null || _a === void 0 ? void 0 : _a.key) || index) + "_overflow_item_" + index;
                return (react_1.default.createElement(OverflowItem_1.default, { key: key, onResize: function (node) {
                        setOverflowItems(function (overflowItems) {
                            overflowItems[key] = { node: node, width: node.clientWidth };
                            return overflowItems;
                        });
                    }, unregister: function () {
                        setOverflowItems(function (overflowItems) {
                            delete overflowItems[key];
                            return overflowItems;
                        });
                    }, hidden: maxCount < index + 1 }, item));
            }),
            __spreadArray([maxTag], __read(suffixItems), false).map(function (item, index) {
                if (!item) {
                    return null;
                }
                var key = ((item === null || item === void 0 ? void 0 : item.key) || index) + "_overflow_suffix_item";
                return (react_1.default.createElement(OverflowItem_1.default, { key: key, className: prefixCls + "-suffix-item", onResize: function (node) {
                        setSuffixOverflowItems(function (suffixOverflowItems) {
                            var _a;
                            return __assign(__assign({}, suffixOverflowItems), (_a = {}, _a["" + key] = { node: node, width: node.clientWidth }, _a));
                        });
                    }, unregister: function () {
                        setSuffixOverflowItems(function (suffixOverflowItems) {
                            delete suffixOverflowItems[key];
                            return __assign({}, suffixOverflowItems);
                        });
                    } }, item));
            }))));
}
exports.default = OverflowEllipsis;
