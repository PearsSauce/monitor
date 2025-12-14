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
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var IconImageClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconImageClose"));
var image_footer_1 = require("./image-footer");
var image_preview_1 = __importDefault(require("./image-preview"));
var image_preview_group_1 = __importDefault(require("./image-preview-group"));
var useShowFooter_1 = __importDefault(require("./utils/hooks/useShowFooter"));
var useImageStatus_1 = __importDefault(require("./utils/hooks/useImageStatus"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var omit_1 = __importDefault(require("../_util/omit"));
var is_1 = require("../_util/is");
var previewGroupContext_1 = require("./previewGroupContext");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var useInView_1 = __importDefault(require("../_util/hooks/useInView"));
var uuid = 0;
var defaultProps = {
    footerPosition: 'inner',
    preview: true,
};
function Image(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Image);
    var style = props.style, className = props.className, src = props.src, width = props.width, height = props.height, title = props.title, description = props.description, actions = props.actions, footerPosition = props.footerPosition, simple = props.simple, loader = props.loader, loaderClassName = props.loaderClassName, error = props.error, preview = props.preview, _propsPreviewProps = props.previewProps, alt = props.alt, onClick = props.onClick, index = props.index, _index = props._index, onError = props.onError, onLoad = props.onLoad, lazyload = props.lazyload, restProps = __rest(props, ["style", "className", "src", "width", "height", "title", "description", "actions", "footerPosition", "simple", "loader", "loaderClassName", "error", "preview", "previewProps", "alt", "onClick", "index", "_index", "onError", "onLoad", "lazyload"]);
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var _c = (0, react_1.useContext)(previewGroupContext_1.PreviewGroupContext), previewGroup = _c.previewGroup, handleGroupVisibleChange = _c.handleVisibleChange, registerPreviewUrl = _c.registerPreviewUrl, registerPreviewProps = _c.registerPreviewProps, setCurrentIndex = _c.setCurrentIndex;
    var previewProps = (0, react_1.useMemo)(function () {
        return (0, is_1.isObject)(_propsPreviewProps) ? _propsPreviewProps : {};
    }, [_propsPreviewProps]);
    var intersectionInitOptions = (0, react_1.useMemo)(function () {
        return (0, is_1.isObject)(lazyload) ? lazyload : {};
    }, [lazyload]);
    var id = (0, react_1.useMemo)(function () {
        if ((0, is_1.isNumber)(index) || (0, is_1.isNumber)(_index)) {
            uuid = (0, is_1.isNumber)(index) ? index : _index;
            return uuid;
        }
        return uuid++;
    }, []);
    var previewSrc = previewProps.src || src;
    var _d = __read((0, useShowFooter_1.default)({ title: title, description: description, actions: actions }), 1), showFooter = _d[0];
    var _e = (0, useImageStatus_1.default)('beforeLoad'), isLoading = _e.isLoading, isError = _e.isError, isLoaded = _e.isLoaded, isBeforeLoad = _e.isBeforeLoad, setStatus = _e.setStatus;
    var loaded = (0, react_1.useRef)(false);
    var _f = __read((0, useMergeValue_1.default)(false, {
        defaultValue: previewProps.defaultVisible,
        value: previewProps.visible,
    }), 2), previewVisible = _f[0], setPreviewVisible = _f[1];
    // Props passed directly into Preview component
    var availablePreviewProps = (0, react_1.useMemo)(function () {
        return (0, omit_1.default)(previewProps, ['visible', 'defaultVisible', 'src', 'onVisibleChange']);
    }, [previewProps]);
    var prefixCls = getPrefixCls('image');
    var isControlled = !(0, is_1.isUndefined)(previewProps.visible);
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-rtl"] = rtl,
        _a[prefixCls + "-simple"] = simple,
        _a[prefixCls + "-before-load"] = isBeforeLoad,
        _a[prefixCls + "-loading"] = isLoading,
        _a[prefixCls + "-loading-error"] = isError,
        _a[prefixCls + "-with-footer-inner"] = isLoaded && showFooter && footerPosition === 'inner',
        _a[prefixCls + "-with-footer-outer"] = isLoaded && showFooter && footerPosition === 'outer',
        _a[prefixCls + "-with-preview"] = isLoaded && preview && !isError && !isControlled,
        _a), className);
    var refImg = (0, react_1.useRef)();
    function onImgLoaded(e) {
        loaded.current = true;
        setStatus('loaded');
        onLoad && onLoad(e);
    }
    function onImgLoadError(e) {
        loaded.current = true;
        setStatus('error');
        onError && onError(e);
    }
    function onImgClick(e) {
        if (preview && previewGroup) {
            setCurrentIndex(id);
            handleGroupVisibleChange(true);
        }
        else if (preview) {
            togglePreviewVisible(true);
        }
        onClick && onClick(e);
    }
    function togglePreviewVisible(newVisible) {
        previewProps.onVisibleChange && previewProps.onVisibleChange(newVisible, previewVisible);
        setPreviewVisible(newVisible);
    }
    var inView = (0, useInView_1.default)(__assign({ target: refImg.current, defaultInView: !lazyload }, intersectionInitOptions)).inView;
    (0, react_1.useEffect)(function () {
        loaded.current = false;
    }, [src]);
    (0, react_1.useEffect)(function () {
        if (refImg.current) {
            if (inView) {
                // avoid set img.src to undefined when its doesn't have [src] attribute
                if ((refImg.current.src || src) && refImg.current.src !== src) {
                    refImg.current.src = src;
                }
                if (!loaded.current && !refImg.current.complete) {
                    setStatus('loading');
                }
            }
            else {
                setStatus('lazyload');
            }
        }
    }, [src, inView]);
    (0, react_1.useEffect)(function () {
        if (!previewGroup)
            return;
        var unRegister = registerPreviewProps(id, availablePreviewProps);
        return function () { return unRegister(id); };
    }, [id, previewGroup, availablePreviewProps]);
    (0, react_1.useEffect)(function () {
        if (!previewGroup)
            return;
        var unRegister = registerPreviewUrl(id, previewSrc, preview);
        return function () { return unRegister(id); };
    }, [id, previewGroup, previewSrc, preview]);
    var defaultError = (react_1.default.createElement("div", { className: prefixCls + "-error" },
        react_1.default.createElement("div", { className: prefixCls + "-error-icon" },
            react_1.default.createElement(IconImageClose_1.default, null)),
        alt && react_1.default.createElement("div", { className: prefixCls + "-error-alt" }, alt)));
    var defaultLoader = (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-loader", loaderClassName) },
        react_1.default.createElement("div", { className: prefixCls + "-loader-spin" },
            react_1.default.createElement(IconLoading_1.default, null),
            react_1.default.createElement("div", { className: prefixCls + "-loader-spin-text" }, "Loading"))));
    var renderLoader = function () {
        if (loader === true)
            return defaultLoader;
        var loadElem = loader || defaultLoader;
        // 懒加载展示占位。
        if (lazyload || loader) {
            return loadElem;
        }
        return null;
    };
    return (react_1.default.createElement("div", { className: classNames, style: Object.assign({ width: width, height: height }, style), ref: ref },
        react_1.default.createElement("img", __assign({ ref: refImg, className: prefixCls + "-img", tabIndex: 0 }, getKeyboardEvents({
            onPressEnter: onImgClick,
        }), restProps, (lazyload || src === undefined ? {} : { src: src }), { title: title, width: width, height: height, onLoad: onImgLoaded, onError: onImgLoadError, onClick: onImgClick, alt: alt })),
        !isLoaded && (react_1.default.createElement("div", { className: prefixCls + "-overlay" },
            isError && (error || defaultError),
            isLoading && renderLoader())),
        isLoaded && showFooter && (react_1.default.createElement(image_footer_1.ImageFooter, { title: title, description: description, actions: actions, prefixCls: prefixCls, simple: simple })),
        isLoaded && preview && (react_1.default.createElement(image_preview_1.default, __assign({ visible: previewVisible, src: previewSrc }, availablePreviewProps, { onVisibleChange: togglePreviewVisible })))));
}
var RefImageComponent = react_1.default.forwardRef(Image);
var ImageComponent = RefImageComponent;
ImageComponent.Preview = image_preview_1.default;
ImageComponent.PreviewGroup = image_preview_group_1.default;
ImageComponent.displayName = 'Image';
exports.default = ImageComponent;
