"use strict";
/**
 * 该组件用来切换tree 展开收起时的动画
 */
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
var context_1 = require("./context");
var VirtualList_1 = __importDefault(require("../_class/VirtualList"));
var ConfigProvider_1 = require("../ConfigProvider");
var node_1 = __importDefault(require("./node"));
var is_1 = require("../_util/is");
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
function getKey(option) {
    return option.key || option._key;
}
var TreeAnimation = function (props) {
    var _a;
    var treeContext = (0, react_1.useContext)(context_1.TreeContext);
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('tree-node');
    var _b = treeContext.getTreeState(), expandedKeys = _b.expandedKeys, currentExpandKeys = _b.currentExpandKeys;
    var expanded = props.expanded;
    var propsChildrenDataRef = (0, react_1.useRef)(props.childrenData);
    propsChildrenDataRef.current = props.childrenData;
    (0, react_1.useEffect)(function () {
        return function () {
            treeContext.onExpandEnd && treeContext.onExpandEnd(props._key);
        };
    }, []);
    var childrenPropsList = (0, react_1.useMemo)(function () {
        var result = [];
        var loop = function (list) {
            list.forEach(function (item) {
                var data = treeContext.getFieldInfo(item);
                result.push(data);
                if (data.children && data.children.length) {
                    loop(data.children);
                }
            });
        };
        loop(propsChildrenDataRef.current || []);
        return result;
    }, [expanded]);
    var filtedData = (0, react_1.useMemo)(function () {
        var result = [];
        if (childrenPropsList.length) {
            var expandedKeysSet_1 = new Set(expandedKeys || []);
            childrenPropsList.forEach(function (data) {
                var _a;
                var isShow;
                var itemProps = __assign({}, treeContext.key2nodeProps[data.key]);
                if (expanded) {
                    // 只有在每一个父节点都是展开状态时，自己才会展示出来
                    isShow =
                        itemProps.parentKey === props._key ||
                            ((_a = itemProps.pathParentKeys) === null || _a === void 0 ? void 0 : _a.every(function (key) {
                                return expandedKeysSet_1.has(key);
                            }));
                }
                else if (itemProps.pathParentKeys) {
                    // 收起时，只有在props._key 对应的位置之后的所有的自己的父节点都是展开状态，才会展示自己
                    var index = itemProps.pathParentKeys.indexOf(props._key);
                    isShow = itemProps.pathParentKeys.slice(index + 1).every(function (key) {
                        return expandedKeysSet_1.has(key);
                    });
                }
                if (isShow) {
                    result.push(__assign(__assign({}, itemProps), { key: data.key }));
                }
            });
        }
        return treeContext.getNodeProps(result);
    }, [childrenPropsList, props._key, expanded, expandedKeys]);
    var realHeight = (_a = treeContext.virtualListProps) === null || _a === void 0 ? void 0 : _a.height;
    realHeight = (0, is_1.isNumber)(realHeight) ? realHeight : 0;
    (0, react_1.useEffect)(function () {
        // node set loadingMore but has no child nodes.
        // Animation will not be triggered and needs to be removed manually
        if (currentExpandKeys.indexOf(props._key) > -1 && filtedData.length === 0) {
            treeContext.onExpandEnd(props._key);
        }
    }, [filtedData, currentExpandKeys]);
    return (react_1.default.createElement(CSSTransition_1.default, { in: currentExpandKeys.indexOf(props._key) > -1 && filtedData.length > 0, unmountOnExit: true, classNames: "tree-slide-expand", timeout: {
            enter: 200,
            exit: 0,
        }, onEnter: function (e) {
            if (!e)
                return;
            var scrollHeight = e.scrollHeight;
            e.style.height = expanded ? 0 : Math.min(realHeight || scrollHeight, e.scrollHeight) + "px";
        }, onEntering: function (e) {
            if (!e)
                return;
            var scrollHeight = e.scrollHeight;
            e.style.height = expanded ? Math.min(realHeight || scrollHeight, scrollHeight) + "px" : 0;
        }, onEntered: function (e) {
            if (!e)
                return;
            e.style.height = props.expanded ? '' : 0;
            treeContext.onExpandEnd(props._key);
        }, onExit: function (e) {
            if (!e)
                return;
            e.style.display = 'none';
        } },
        react_1.default.createElement(VirtualList_1.default, __assign({ itemKey: getKey, className: prefixCls + "-list", isStaticItemHeight: false }, treeContext.virtualListProps, { data: filtedData, "aria-hidden": true, style: { overflow: 'hidden' } }), function (child) {
            return react_1.default.createElement(node_1.default, __assign({}, child));
        })));
};
exports.default = TreeAnimation;
