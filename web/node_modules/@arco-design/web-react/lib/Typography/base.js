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
var ConfigProvider_1 = require("../ConfigProvider");
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var operations_1 = __importDefault(require("./operations"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var edit_content_1 = __importDefault(require("./edit-content"));
var is_1 = require("../_util/is");
var Tooltip_1 = __importDefault(require("../Tooltip"));
var Popover_1 = __importDefault(require("../Popover"));
var omit_1 = __importDefault(require("../_util/omit"));
var useUpdate_1 = __importDefault(require("../_util/hooks/useUpdate"));
var mergedToString_1 = __importDefault(require("../_util/mergedToString"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var useEllipsis_1 = __importStar(require("./useEllipsis"));
var useCssEllipsis_1 = __importDefault(require("./useCssEllipsis"));
var throttleByRafV2_1 = __importDefault(require("../_util/throttleByRafV2"));
function getClassNameAndComponentName(props, prefixCls) {
    var type = props.type, bold = props.bold, disabled = props.disabled, mark = props.mark, underline = props.underline, propDelete = props.delete, code = props.code;
    var component = [];
    var className = [];
    if (type) {
        className.push(prefixCls + "-" + type);
    }
    if (disabled) {
        className.push(prefixCls + "-disabled");
    }
    if (bold) {
        component.push('b');
    }
    if (underline) {
        component.push('u');
    }
    if (propDelete) {
        component.push('del');
    }
    if (code) {
        component.push('code');
    }
    if (mark) {
        component.push('mark');
    }
    return {
        component: component,
        className: className,
    };
}
function Base(props, ref) {
    var _a;
    var componentType = props.componentType, style = props.style, className = props.className, children = props.children, editable = props.editable, ellipsis = props.ellipsis, heading = props.heading, blockquote = props.blockquote, rest = __rest(props, ["componentType", "style", "className", "children", "editable", "ellipsis", "heading", "blockquote"]);
    var configContext = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var getPrefixCls = configContext.getPrefixCls, rtl = configContext.rtl;
    var prefixCls = getPrefixCls('typography');
    var rootDOMRef = (0, react_1.useRef)();
    var _b = getClassNameAndComponentName(props, prefixCls), component = _b.component, componentClassName = _b.className;
    var _c = __read((0, react_1.useState)(false), 2), editing = _c[0], setEditing = _c[1];
    var _d = __read((0, react_1.useState)(0), 2), width = _d[0], setWidth = _d[1];
    var editableConfig = (0, is_1.isObject)(editable) ? editable : {};
    var mergedEditing = 'editing' in editableConfig ? editableConfig.editing : editing;
    var ellipsisConfig = ellipsis
        ? __assign({ rows: 1, ellipsisStr: '...', cssEllipsis: false }, ((0, is_1.isObject)(ellipsis) ? ellipsis : {})) : {};
    var EllipsisWrapperTag = ellipsisConfig.wrapper || react_1.default.Fragment;
    var _e = __read((0, useMergeValue_1.default)(false, {
        defaultValue: ellipsisConfig.defaultExpanded,
        value: ellipsisConfig.expanded,
    }), 2), expanding = _e[0], setExpanding = _e[1];
    var _f = (0, useCssEllipsis_1.default)(ellipsisConfig), simpleEllipsis = _f.simpleEllipsis, ellipsisStyle = _f.ellipsisStyle;
    var renderMeasureContent = function (node, isEllipsis) {
        var ellipsisStr = !(0, is_1.isUndefined)(ellipsisConfig.ellipsisStr)
            ? ellipsisConfig.ellipsisStr
            : '...';
        var suffix = !(0, is_1.isUndefined)(ellipsisConfig.suffix) && ellipsisConfig.suffix;
        return (react_1.default.createElement(EllipsisWrapperTag, null,
            node,
            isEllipsis && !expanding && !simpleEllipsis ? ellipsisStr : '',
            suffix,
            renderOperations(isEllipsis)));
    };
    var _g = (0, useEllipsis_1.default)(__assign(__assign({}, ellipsisConfig), { children: children, expanding: expanding, width: width, renderMeasureContent: renderMeasureContent, simpleEllipsis: simpleEllipsis || expanding })), ellipsisNode = _g.ellipsisNode, isEllipsis = _g.isEllipsis, measureStatus = _g.measureStatus;
    var handleResize = (0, throttleByRafV2_1.default)(function (entry) {
        var contentRect = (entry === null || entry === void 0 ? void 0 : entry[0]).contentRect;
        if (contentRect) {
            var currentWidth = component.includes('code') ? contentRect.width - 18 : contentRect.width;
            var resizeStatus = [useEllipsis_1.MEASURE_STATUS.NO_NEED_ELLIPSIS, useEllipsis_1.MEASURE_STATUS.MEASURE_END];
            // 在 table 中，使用了 cssEllipsis 因为 white-space: "nowrap"，宽度会突然变很大
            // 导致再次触发 resize 计算，进入循环。
            // diffTime 应对短时间内多次触发
            if (resizeStatus.includes(measureStatus)) {
                setWidth(currentWidth);
            }
        }
    });
    function renderOperations(isEllipsis) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(operations_1.default, __assign({}, props, { setEditing: setEditing, onClickExpand: onClickExpand, expanding: expanding, isEllipsis: isEllipsis, 
                // 如果是镜像dom的话，渲染在最外层，无法从context中拿到最新config
                currentContext: configContext }))));
    }
    function onClickExpand(e) {
        setExpanding(!expanding);
        props.onClickExpand && props.onClickExpand(e);
        ellipsisConfig.onExpand && ellipsisConfig.onExpand(!expanding, e);
    }
    (0, useUpdate_1.default)(function () {
        ellipsisConfig.onEllipsis && ellipsisConfig.onEllipsis(isEllipsis);
    }, [isEllipsis]);
    (0, react_1.useImperativeHandle)(ref, function () { return rootDOMRef.current; });
    function wrap(content, component, props, innerProps) {
        if (innerProps === void 0) { innerProps = {}; }
        var currentContent = content;
        component.forEach(function (c, _index) {
            var _innerProps = _index === 0 ? innerProps : {};
            var _props = (0, is_1.isObject)(props.mark) && props.mark.color
                ? __assign({ style: { backgroundColor: props.mark.color } }, _innerProps) : __assign({}, _innerProps);
            currentContent = react_1.default.createElement(c, __assign({}, _props), currentContent);
        });
        return currentContent;
    }
    var TextComponent;
    if (componentType === 'Paragraph') {
        TextComponent = blockquote ? 'blockquote' : 'div';
    }
    else if (componentType === 'Title') {
        TextComponent = "h" + heading;
    }
    else if (componentType === 'Text') {
        TextComponent = ellipsis ? 'div' : 'span';
    }
    function renderContent() {
        var _a;
        var fullText = (0, mergedToString_1.default)(react_1.default.Children.toArray(children));
        var showTooltip = ellipsisConfig.showTooltip;
        var tooltipType = (0, is_1.isObject)(ellipsisConfig.showTooltip)
            ? ellipsisConfig.showTooltip.type === 'popover'
                ? 'popover'
                : 'tooltip'
            : 'tooltip';
        var tooltipProps = (0, is_1.isObject)(ellipsisConfig.showTooltip)
            ? ellipsisConfig.showTooltip.props || {}
            : {};
        var TooltipComponent = (tooltipType === 'popover' ? Popover_1.default : Tooltip_1.default);
        var titleProps = isEllipsis && !showTooltip && !expanding ? { title: fullText } : {};
        var baseProps = __assign({ style: style }, titleProps);
        var addTooltip = isEllipsis && showTooltip && !expanding;
        var node = (react_1.default.createElement(resizeObserver_1.default, { onResize: handleResize, getTargetDOMNode: function () {
                return rootDOMRef.current;
            } },
            react_1.default.createElement(TextComponent, __assign({ ref: rootDOMRef, className: (0, classNames_1.default)(prefixCls, componentClassName, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), className) }, baseProps, (0, omit_1.default)(rest, [
                'spacing',
                'type',
                'close',
                'bold',
                'disabled',
                'mark',
                'underline',
                'delete',
                'code',
                'copyable',
                'isEllipsis',
                'expanding',
                'onClickExpand',
                'setEditing',
                'forceShowExpand',
            ])), simpleEllipsis && measureStatus !== useEllipsis_1.MEASURE_STATUS.INIT && !expanding && isEllipsis
                ? wrap(
                // CSS folding style, need to wrap the text separately.
                renderMeasureContent(react_1.default.createElement("span", { style: ellipsisStyle }, children), isEllipsis), component.length ? component : ['span'], props, 
                // The simple-ellipsis class ensures that the ReactNode after the text is displayed correctly (no line breaks)
                // Need to act on the immediate parent node of the text
                { className: prefixCls + "-simple-ellipsis" })
                : wrap(ellipsisNode, component, props))));
        if (addTooltip) {
            return (react_1.default.createElement(TooltipComponent, __assign({ content: fullText }, tooltipProps),
                react_1.default.createElement("span", null, node)));
        }
        return node;
    }
    return mergedEditing ? (react_1.default.createElement(edit_content_1.default, __assign({ ref: ref }, props, { className: (0, classNames_1.default)(prefixCls, componentClassName, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), prefixCls + "-" + TextComponent, className), prefixCls: prefixCls, setEditing: setEditing, editableConfig: editableConfig }))) : (renderContent());
}
exports.default = (0, react_1.forwardRef)(Base);
