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
exports.TabsContext = void 0;
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var tab_pane_1 = __importDefault(require("./tab-pane"));
var index_1 = __importDefault(require("./tab-header/index"));
var tab_content_1 = __importDefault(require("./tab-content"));
var omit_1 = __importDefault(require("../_util/omit"));
var ConfigProvider_1 = require("../ConfigProvider");
var is_1 = require("../_util/is");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useId_1 = __importDefault(require("../_util/hooks/useId"));
var sizeList = ['mini', 'small', 'default', 'large'];
var getPaneChildren = function (props) {
    var children = props.children;
    var paneChildren = [];
    react_1.default.Children.forEach(children, function (child) {
        if (child && child.type && child.type.isTabPane) {
            paneChildren.push(child);
        }
    });
    return paneChildren;
};
var getTabPaneAnimation = function (props) {
    var direction = props.direction, tabPosition = props.tabPosition, animation = props.animation;
    if (direction === 'vertical' || tabPosition === 'left' || tabPosition === 'right') {
        return false;
    }
    if ((0, is_1.isObject)(animation)) {
        return 'tabPane' in animation ? animation.tabPane : false;
    }
    return animation;
};
var defaultProps = {
    tabPosition: 'top',
    type: 'line',
    overflow: 'scroll',
    showAddButton: true,
    lazyload: true,
    headerPadding: true,
    scrollPosition: 'auto',
};
exports.TabsContext = react_1.default.createContext({});
function Tabs(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, ctxSize = _b.size, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Tabs);
    var paneChildren = getPaneChildren(props);
    var tabsRef = (0, react_1.useRef)();
    var _c = __read((0, useMergeValue_1.default)((paneChildren[0] && paneChildren[0].key), {
        defaultValue: 'defaultActiveTab' in props ? props.defaultActiveTab : undefined,
        value: 'activeTab' in props ? props.activeTab : undefined,
    }), 2), activeTab = _c[0], setActiveTab = _c[1];
    var prefixCls = getPrefixCls('tabs');
    var size = props.size || (sizeList.indexOf(ctxSize) > -1 ? ctxSize : 'default');
    var animation = props.animation, className = props.className, direction = props.direction, style = props.style, type = props.type, justify = props.justify, destroyOnHide = props.destroyOnHide, lazyload = props.lazyload, onChange = props.onChange, onClickTab = props.onClickTab, onDeleteTab = props.onDeleteTab, renderTabHeader = props.renderTabHeader, rest = __rest(props, ["animation", "className", "direction", "style", "type", "justify", "destroyOnHide", "lazyload", "onChange", "onClickTab", "onDeleteTab", "renderTabHeader"]);
    var idPrefix = (0, useId_1.default)(prefixCls + "-");
    var tabPosition = direction === 'vertical' ? 'left' : props.tabPosition;
    var tabHeaderProps = {
        animation: (0, is_1.isObject)(animation) && 'inkBar' in animation ? animation.inkBar : true,
        activeTab: activeTab,
        tabPosition: tabPosition,
        direction: ['left', 'right'].indexOf(tabPosition) > -1 ? 'vertical' : 'horizontal',
        paneChildren: paneChildren,
        onClickTab: function (key) {
            (0, is_1.isFunction)(onClickTab) && onClickTab(key);
            if (key !== activeTab) {
                if (!('activeTab' in props)) {
                    setActiveTab(key);
                }
                (0, is_1.isFunction)(onChange) && onChange(key);
            }
        },
        onDeleteTab: onDeleteTab,
        prefixCls: prefixCls,
    };
    (0, react_1.useImperativeHandle)(ref, function () { return tabsRef; }, []);
    var TabContentDom = (react_1.default.createElement(tab_content_1.default, { direction: ['left', 'right'].indexOf(tabPosition) > -1 ? 'vertical' : 'horizontal', animation: getTabPaneAnimation(props), activeTab: activeTab, paneChildren: paneChildren, prefixCls: prefixCls, destroyOnHide: destroyOnHide, lazyload: lazyload }));
    return (react_1.default.createElement("div", __assign({}, (0, omit_1.default)(rest, [
        'headerPadding',
        'tabPosition',
        'defaultActiveTab',
        'showAddButton',
        'extra',
        'onAddTab',
        'activeTab',
        'overflow',
        'editable',
        'renderTabTitle',
        'addButton',
        'deleteButton',
        'icons',
        'children',
        'size',
        'type',
        'scrollPosition',
        'offsetAlign',
    ]), { style: style, className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + (['left', 'right'].indexOf(tabPosition) > -1 ? 'vertical' : 'horizontal'), prefixCls + "-" + type, prefixCls + "-" + tabPosition, prefixCls + "-size-" + size, (_a = {},
            _a[prefixCls + "-justify"] = justify,
            _a[prefixCls + "-rtl"] = rtl,
            _a), className), ref: tabsRef }),
        react_1.default.createElement(exports.TabsContext.Provider, { value: __assign(__assign({}, tabHeaderProps), { getIdPrefix: function (suffix) {
                    return {
                        tab: idPrefix && idPrefix + "-tab-" + suffix,
                        tabpane: idPrefix && idPrefix + "-panel-" + suffix,
                    };
                } }) },
            tabPosition === 'bottom' && TabContentDom,
            (0, is_1.isFunction)(renderTabHeader) ? (renderTabHeader(__assign(__assign(__assign({}, (0, omit_1.default)(props, ['children', 'style', 'className'])), { size: size }), tabHeaderProps), index_1.default)) : (react_1.default.createElement(index_1.default, __assign({}, (0, omit_1.default)(props, ['children', 'style', 'className']), { size: size }))),
            tabPosition !== 'bottom' && TabContentDom)));
}
var ForwardRefTabs = react_1.default.forwardRef(Tabs);
var TabsComponent = ForwardRefTabs;
TabsComponent.displayName = 'Tabs';
TabsComponent.TabPane = tab_pane_1.default;
exports.default = TabsComponent;
