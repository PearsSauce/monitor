"use strict";
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
var sub_menu_1 = __importDefault(require("./sub-menu"));
var style_1 = require("../_util/style");
var context_1 = __importDefault(require("./context"));
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var OVERFLOW_THRESHOLD = 5;
function getNodeWidth(node) {
    // getBoundingClientRect will get a result like 20.45
    // Use Math.ceil to avoid menu item wrap in specific menu-width
    return node && Math.ceil(+node.getBoundingClientRect().width);
}
function translatePxToNumber(str) {
    var result = Number(str.replace('px', ''));
    return isNaN(result) ? 0 : result;
}
var OverflowWrap = function (props) {
    var children = props.children, _a = props.ellipsisText, ellipsisText = _a === void 0 ? '···' : _a, onEllipsisChange = props.onEllipsisChange;
    var prefixCls = (0, react_1.useContext)(context_1.default).prefixCls;
    var refUl = (0, react_1.useRef)(null);
    var _b = __read((0, react_1.useState)(null), 2), lastVisibleIndex = _b[0], setLastVisibleIndex = _b[1];
    var overflowSubMenuClass = prefixCls + "-overflow-sub-menu";
    var overflowMenuItemClass = prefixCls + "-overflow-hidden-menu-item";
    var overflowSubMenuMirrorClass = prefixCls + "-overflow-sub-menu-mirror";
    var tryUpdateEllipsisStatus = function (_lastVisibleIndex) {
        if (_lastVisibleIndex !== lastVisibleIndex) {
            var childNodes = react_1.default.Children.toArray(children);
            var noOverflow = _lastVisibleIndex === null;
            onEllipsisChange === null || onEllipsisChange === void 0 ? void 0 : onEllipsisChange({
                lastVisibleIndex: noOverflow ? childNodes.length - 1 : _lastVisibleIndex,
                overflowNodes: noOverflow ? [] : childNodes.slice(_lastVisibleIndex + 1),
            });
            setLastVisibleIndex(_lastVisibleIndex);
        }
    };
    function computeLastVisibleIndex() {
        if (!refUl.current) {
            return;
        }
        var ulElement = refUl.current;
        var maxWidth = getNodeWidth(ulElement) - OVERFLOW_THRESHOLD;
        var childNodeList = [].slice.call(ulElement.children);
        var menuItemIndex = 0;
        var currentItemRight = 0;
        var overflowSubMenuWidth = 0;
        // 注意 childrenNodeList.length !== React.Children.count(children) 所以需要用 menuItemIndex 来标记真实的 MenuItem 下标
        for (var i = 0; i < childNodeList.length; i++) {
            var node = childNodeList[i];
            var classNames = node.className.split(' ');
            var isOverflowSubMenu = classNames.indexOf(overflowSubMenuClass) > -1;
            var isOverflowSubMenuMirror = classNames.indexOf(overflowSubMenuMirrorClass) > -1;
            // 忽略 overflowSubMenu 的宽度，其宽度测量交由 overflowSubMenuMirror
            if (isOverflowSubMenu) {
                continue;
            }
            var nodeWidth = getNodeWidth(node) +
                translatePxToNumber((0, style_1.getStyle)(node, 'marginLeft')) +
                translatePxToNumber((0, style_1.getStyle)(node, 'marginRight'));
            if (isOverflowSubMenuMirror) {
                overflowSubMenuWidth = nodeWidth;
                continue;
            }
            currentItemRight += nodeWidth;
            // 将要溢出的菜单项
            if (currentItemRight > maxWidth) {
                tryUpdateEllipsisStatus(
                // 判断如果将最后一个菜单项换为 ... 是否会超出宽度
                menuItemIndex - (currentItemRight - nodeWidth + overflowSubMenuWidth <= maxWidth ? 1 : 2));
                return;
            }
            menuItemIndex++;
        }
        // 全部可见
        tryUpdateEllipsisStatus(null);
    }
    var renderOverflowSubMenu = function (children, isMirror) {
        if (isMirror === void 0) { isMirror = false; }
        return (react_1.default.createElement(sub_menu_1.default, { title: react_1.default.createElement("span", null, ellipsisText), key: "arco-menu-overflow-sub-menu" + (isMirror ? '-mirror' : ''), className: isMirror ? overflowSubMenuMirrorClass : overflowSubMenuClass, children: children }));
    };
    var renderChildren = function () {
        var overflowSubMenu = null;
        var overflowSubMenuMirror = renderOverflowSubMenu(null, true);
        var originMenuItems = react_1.default.Children.map(children, function (child, index) {
            var _a, _b;
            var item = child;
            if (lastVisibleIndex !== null) {
                if (index > lastVisibleIndex) {
                    item = react_1.default.cloneElement(child, {
                        className: (0, classNames_1.default)(overflowMenuItemClass, (_b = (_a = child) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.className),
                    });
                }
                if (index === lastVisibleIndex + 1) {
                    var overflowedItems = react_1.default.Children.toArray(children)
                        .slice(lastVisibleIndex + 1)
                        .map(function (child) {
                        return react_1.default.cloneElement(child, { key: child.props._key });
                    });
                    overflowSubMenu = renderOverflowSubMenu(overflowedItems);
                }
            }
            return item;
        });
        return __spreadArray(__spreadArray([overflowSubMenuMirror], __read(originMenuItems), false), [overflowSubMenu], false);
    };
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: computeLastVisibleIndex, getTargetDOMNode: function () { return refUl.current; } },
        react_1.default.createElement("div", { className: prefixCls + "-overflow-wrap", ref: refUl }, renderChildren())));
};
exports.default = OverflowWrap;
