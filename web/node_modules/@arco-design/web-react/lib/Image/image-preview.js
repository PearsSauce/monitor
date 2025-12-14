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
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var react_dom_1 = require("../_util/react-dom");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var dom_1 = require("../_util/dom");
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var IconZoomOut_1 = __importDefault(require("../../icon/react-icon-cjs/IconZoomOut"));
var IconZoomIn_1 = __importDefault(require("../../icon/react-icon-cjs/IconZoomIn"));
var IconFullscreen_1 = __importDefault(require("../../icon/react-icon-cjs/IconFullscreen"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
var IconRotateLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconRotateLeft"));
var IconRotateRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconRotateRight"));
var IconOriginalSize_1 = __importDefault(require("../../icon/react-icon-cjs/IconOriginalSize"));
var ConfigProvider_1 = __importStar(require("../ConfigProvider"));
var useImageStatus_1 = __importDefault(require("./utils/hooks/useImageStatus"));
var getScale_1 = __importStar(require("./utils/getScale"));
var getFixTranslate_1 = __importDefault(require("./utils/getFixTranslate"));
var image_preview_toolbar_1 = __importDefault(require("./image-preview-toolbar"));
var Portal_1 = __importDefault(require("../Portal"));
var previewGroupContext_1 = require("./previewGroupContext");
var image_preview_arrow_1 = __importDefault(require("./image-preview-arrow"));
var useOverflowHidden_1 = __importDefault(require("../_util/hooks/useOverflowHidden"));
var keycode_1 = require("../_util/keycode");
var useUpdate_1 = __importDefault(require("../_util/hooks/useUpdate"));
var is_1 = require("../_util/is");
var ROTATE_STEP = 90;
var defaultProps = {
    maskClosable: true,
    closable: true,
    breakPoint: 316,
    actionsLayout: [
        'fullScreen',
        'rotateRight',
        'rotateLeft',
        'zoomIn',
        'zoomOut',
        'originalSize',
        'extra',
    ],
    getPopupContainer: function () { return document.body; },
    escToExit: true,
    scales: getScale_1.defaultScales,
    resetTranslate: true,
};
function Preview(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(previewGroupContext_1.PreviewGroupContext), previewGroup = _b.previewGroup, previewUrlMap = _b.previewUrlMap, currentIndex = _b.currentIndex, setCurrentIndex = _b.setCurrentIndex, infinite = _b.infinite, previewPropsMap = _b.previewPropsMap;
    var mergedPreviewProps = previewGroup ? previewPropsMap.get(currentIndex) : {};
    var mergedProps = (0, useMergeProps_1.default)(baseProps, defaultProps, mergedPreviewProps);
    var className = mergedProps.className, style = mergedProps.style, src = mergedProps.src, defaultVisible = mergedProps.defaultVisible, maskClosable = mergedProps.maskClosable, closable = mergedProps.closable, breakPoint = mergedProps.breakPoint, actions = mergedProps.actions, actionsLayout = mergedProps.actionsLayout, getPopupContainer = mergedProps.getPopupContainer, onVisibleChange = mergedProps.onVisibleChange, scales = mergedProps.scales, escToExit = mergedProps.escToExit, _c = mergedProps.imgAttributes, imgAttributes = _c === void 0 ? {} : _c, imageRender = mergedProps.imageRender, _d = mergedProps.extra, extraNode = _d === void 0 ? null : _d, resetTranslate = mergedProps.resetTranslate;
    var mergedSrc = previewGroup ? previewUrlMap.get(currentIndex) : src;
    var _e = __read((0, react_1.useState)(mergedSrc), 2), previewImgSrc = _e[0], setPreviewImgSrc = _e[1];
    var _f = __read((0, useMergeValue_1.default)(false, {
        defaultValue: defaultVisible,
        value: mergedProps.visible,
    }), 2), visible = _f[0], setVisible = _f[1];
    var globalContext = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var getPrefixCls = globalContext.getPrefixCls, locale = globalContext.locale, rtl = globalContext.rtl;
    var prefixCls = getPrefixCls('image');
    var previewPrefixCls = prefixCls + "-preview";
    var classNames = (0, classNames_1.default)(previewPrefixCls, (_a = {},
        _a[previewPrefixCls + "-hide"] = !visible,
        _a[previewPrefixCls + "-rtl"] = rtl,
        _a), className);
    var refImage = (0, react_1.useRef)();
    var refImageContainer = (0, react_1.useRef)();
    var refWrapper = (0, react_1.useRef)();
    var refRootWrapper = (0, react_1.useRef)();
    var keyboardEventOn = (0, react_1.useRef)(false);
    var refMoveData = (0, react_1.useRef)({
        pageX: 0,
        pageY: 0,
        originX: 0,
        originY: 0,
    });
    var _g = (0, useImageStatus_1.default)('loading'), isLoading = _g.isLoading, isLoaded = _g.isLoaded, setStatus = _g.setStatus;
    var _h = __read((0, react_1.useState)(false), 2), toolbarSimple = _h[0], setToolbarSimple = _h[1];
    var _j = __read((0, react_1.useState)({ x: 0, y: 0 }), 2), translate = _j[0], setTranslate = _j[1];
    var _k = __read((0, react_1.useState)(1), 2), scale = _k[0], setScale = _k[1];
    var _l = __read((0, react_1.useState)(false), 2), scaleValueVisible = _l[0], setScaleValueVisible = _l[1];
    var _m = __read((0, react_1.useState)(0), 2), rotate = _m[0], setRotate = _m[1];
    var _o = __read((0, react_1.useState)(false), 2), moving = _o[0], setMoving = _o[1];
    var previewScales = (0, react_1.useMemo)(function () {
        return new getScale_1.default(scales);
    }, []);
    var onLoad = imgAttributes.onLoad, onError = imgAttributes.onError, onMouseDown = imgAttributes.onMouseDown, imgStyle = imgAttributes.style, imgClassName = imgAttributes.className, restImgAttributes = __rest(imgAttributes, ["onLoad", "onError", "onMouseDown", "style", "className"]);
    // Reset image params
    function reset() {
        setTranslate({ x: 0, y: 0 });
        setScale(1);
        setRotate(0);
    }
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        reset: reset,
        getRootDOMNode: function () { return refRootWrapper.current; },
    }); });
    var _p = __read((0, react_1.useState)(), 2), container = _p[0], setContainer = _p[1];
    var getContainer = (0, react_1.useCallback)(function () { return container; }, [container]);
    (0, react_1.useEffect)(function () {
        var container = getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer();
        var containerDom = ((0, react_dom_1.findDOMNode)(container) || document.body);
        setContainer(containerDom);
    }, [getPopupContainer]);
    (0, useOverflowHidden_1.default)(getContainer, { hidden: visible });
    var isFixed = (0, react_1.useMemo)(function () { return !dom_1.isServerRendering && container === document.body; }, [container]);
    // Jump to image at the specified index
    function jumpTo(index) {
        var previewListLen = previewUrlMap.size;
        if (infinite) {
            index %= previewListLen;
            if (index < 0)
                index = previewListLen - Math.abs(index);
        }
        if (index !== currentIndex && index >= 0 && index <= previewListLen - 1) {
            setCurrentIndex(index);
        }
    }
    function onPrev() {
        jumpTo(currentIndex - 1);
    }
    function onNext() {
        jumpTo(currentIndex + 1);
    }
    // Anticlockwise rotation
    function onRotateLeft() {
        setRotate(rotate === 0 ? 360 - ROTATE_STEP : rotate - ROTATE_STEP);
    }
    // Clockwise rotation
    function onRotateRight() {
        setRotate((rotate + ROTATE_STEP) % 360);
    }
    // Scale
    var hideScaleTimer = (0, react_1.useRef)(null);
    var showScaleValue = function () {
        !scaleValueVisible && setScaleValueVisible(true);
        hideScaleTimer.current && clearTimeout(hideScaleTimer.current);
        hideScaleTimer.current = setTimeout(function () {
            setScaleValueVisible(false);
        }, 1000);
    };
    var onScaleChange = function (newScale) {
        if (scale !== newScale) {
            setScale(newScale);
            showScaleValue();
        }
    };
    function onZoomIn() {
        var newScale = previewScales.getNextScale(scale, 'zoomIn');
        onScaleChange(newScale);
    }
    function onZoomOut() {
        var newScale = previewScales.getNextScale(scale, 'zoomOut');
        onScaleChange(newScale);
    }
    function onWheelZoom(e) {
        if (e.deltaY > 0) {
            // 缩小
            if (scale >= previewScales.minScale) {
                // e.preventDefault();
                onZoomOut();
            }
        }
        else if (scale <= previewScales.maxScale) {
            // e.preventDefault();
            onZoomIn();
        }
    }
    function onResetScale() {
        onScaleChange(1);
    }
    function onFullScreen() {
        var wrapperRect = refWrapper.current.getBoundingClientRect();
        var imgRect = refImage.current.getBoundingClientRect();
        var newHeightScale = wrapperRect.height / (imgRect.height / scale);
        var newWidthScale = wrapperRect.width / (imgRect.width / scale);
        var newScale = Math.max(newHeightScale, newWidthScale);
        onScaleChange(newScale);
    }
    // Image container is clicked
    function onOutsideImgClick(e) {
        if (e.target === e.currentTarget && maskClosable) {
            close();
        }
    }
    // Close button is clicked.
    function onCloseClick() {
        close();
    }
    function close() {
        if (visible) {
            onVisibleChange && onVisibleChange(false, visible);
            (0, is_1.isUndefined)(mergedProps.visible) && setVisible(false);
        }
    }
    function onWrapperResize(entry) {
        if (entry && entry.length) {
            var wrapperRect = entry[0].contentRect;
            var nextSimple = wrapperRect.width < breakPoint;
            setToolbarSimple(nextSimple);
        }
    }
    // Check the translate and correct it if needed
    var checkAndFixTranslate = function () {
        if (!refWrapper.current || !refImage.current)
            return;
        var wrapperRect = refWrapper.current.getBoundingClientRect();
        var imgRect = refImage.current.getBoundingClientRect();
        var _a = __read((0, getFixTranslate_1.default)(wrapperRect, imgRect, translate.x, translate.y, scale), 2), x = _a[0], y = _a[1];
        if (x !== translate.x || y !== translate.y) {
            setTranslate({
                x: x,
                y: y,
            });
        }
    };
    // Update position on moving if needed
    var onMoving = function (e) {
        if (visible && moving) {
            e.preventDefault && e.preventDefault();
            var _a = refMoveData.current, originX = _a.originX, originY = _a.originY, pageX = _a.pageX, pageY = _a.pageY;
            var nextX = originX + (e.pageX - pageX) / scale;
            var nextY = originY + (e.pageY - pageY) / scale;
            setTranslate({
                x: nextX,
                y: nextY,
            });
        }
    };
    var onMoveEnd = function (e) {
        e.preventDefault && e.preventDefault();
        setMoving(false);
    };
    function onImgLoaded(e) {
        setStatus('loaded');
        onLoad && onLoad(e);
    }
    function onImgLoadError(e) {
        setStatus('error');
        onError && onError(e);
    }
    // Record position data on move start
    var onMoveStart = function (e) {
        var _a;
        (_a = e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
        setMoving(true);
        var ev = e.type === 'touchstart' ? e.touches[0] : e;
        refMoveData.current.pageX = ev.pageX;
        refMoveData.current.pageY = ev.pageY;
        refMoveData.current.originX = translate.x;
        refMoveData.current.originY = translate.y;
        onMouseDown === null || onMouseDown === void 0 ? void 0 : onMouseDown(e);
    };
    (0, react_1.useEffect)(function () {
        if (visible && moving) {
            (0, dom_1.on)(document, 'mousemove', onMoving, false);
            (0, dom_1.on)(document, 'mouseup', onMoveEnd, false);
        }
        return function () {
            (0, dom_1.off)(document, 'mousemove', onMoving, false);
            (0, dom_1.off)(document, 'mouseup', onMoveEnd, false);
        };
    }, [visible, moving]);
    // Correct translate after moved
    (0, react_1.useEffect)(function () {
        if (resetTranslate && !moving) {
            checkAndFixTranslate();
        }
    }, [moving, translate]);
    // Correct translate when scale changes
    (0, react_1.useEffect)(function () {
        if (resetTranslate) {
            checkAndFixTranslate();
        }
    }, [scale]);
    // Reset when preview is opened
    (0, react_1.useEffect)(function () {
        if (visible) {
            reset();
        }
    }, [visible]);
    // Reset on first mount or image switches
    (0, react_1.useEffect)(function () {
        setPreviewImgSrc(mergedSrc);
        setStatus(mergedSrc ? 'loading' : 'loaded');
        reset();
    }, [mergedSrc]);
    (0, useUpdate_1.default)(function () {
        previewScales.updateScale(scales);
        setScale(1);
    }, [scales]);
    // Close when pressing esc
    (0, react_1.useEffect)(function () {
        var onKeyDown = function (e) {
            if (e) {
                switch (e.key) {
                    case keycode_1.Esc.key:
                        if (escToExit) {
                            close();
                        }
                        break;
                    case keycode_1.ArrowRight.key:
                        onNext();
                        break;
                    case keycode_1.ArrowLeft.key:
                        onPrev();
                        break;
                    case keycode_1.ArrowUp.key:
                        onZoomIn();
                        break;
                    case keycode_1.ArrowDown.key:
                        onZoomOut();
                        break;
                    default:
                }
            }
        };
        if (visible && !moving && !keyboardEventOn.current) {
            keyboardEventOn.current = true;
            (0, dom_1.on)(document, 'keydown', onKeyDown);
        }
        return function () {
            keyboardEventOn.current = false;
            (0, dom_1.off)(document, 'keydown', onKeyDown);
        };
    }, [visible, escToExit, moving, currentIndex, scale]);
    var defaultActions = [
        {
            key: 'fullScreen',
            name: locale.ImagePreview.fullScreen,
            content: react_1.default.createElement(IconFullscreen_1.default, null),
            onClick: onFullScreen,
        },
        {
            key: 'rotateRight',
            name: locale.ImagePreview.rotateRight,
            content: react_1.default.createElement(IconRotateRight_1.default, null),
            onClick: onRotateRight,
        },
        {
            key: 'rotateLeft',
            name: locale.ImagePreview.rotateLeft,
            content: react_1.default.createElement(IconRotateLeft_1.default, null),
            onClick: onRotateLeft,
        },
        {
            key: 'zoomIn',
            name: locale.ImagePreview.zoomIn,
            content: react_1.default.createElement(IconZoomIn_1.default, null),
            onClick: onZoomIn,
            disabled: scale === previewScales.maxScale,
        },
        {
            key: 'zoomOut',
            name: locale.ImagePreview.zoomOut,
            content: react_1.default.createElement(IconZoomOut_1.default, null),
            onClick: onZoomOut,
            disabled: scale === previewScales.minScale,
        },
        {
            key: 'originalSize',
            name: locale.ImagePreview.originalSize,
            content: react_1.default.createElement(IconOriginalSize_1.default, null),
            onClick: onResetScale,
        },
    ];
    var renderImage = function () {
        var _a;
        var _b;
        var image = (react_1.default.createElement("img", __assign({ onWheel: onWheelZoom, ref: refImage, className: (0, classNames_1.default)(imgClassName, previewPrefixCls + "-img", (_a = {},
                _a[previewPrefixCls + "-img-moving"] = moving,
                _a)), style: __assign(__assign({}, imgStyle), { transform: "translate(" + translate.x + "px, " + translate.y + "px) rotate(" + rotate + "deg)" }), key: previewImgSrc, src: previewImgSrc }, restImgAttributes, { onLoad: onImgLoaded, onError: onImgLoadError, onMouseDown: function (event) {
                // only trigger onMoveStart when press mouse left button
                event.button === 0 && onMoveStart(event);
            } })));
        return (_b = imageRender === null || imageRender === void 0 ? void 0 : imageRender(image)) !== null && _b !== void 0 ? _b : image;
    };
    return (react_1.default.createElement(Portal_1.default, { visible: visible, forceRender: false, getContainer: getContainer },
        react_1.default.createElement(ConfigProvider_1.default, __assign({}, globalContext, { getPopupContainer: function () { return refWrapper.current; } }),
            react_1.default.createElement("div", { className: classNames, style: __assign(__assign({}, (style || {})), (isFixed ? {} : { zIndex: 'inherit', position: 'absolute' })), ref: refRootWrapper },
                react_1.default.createElement(CSSTransition_1.default, { in: visible, timeout: 400, appear: true, classNames: "fadeImage", mountOnEnter: true, unmountOnExit: false, onEnter: function (e) {
                        if (!e)
                            return;
                        e.parentNode.style.display = 'block';
                        e.style.display = 'block';
                    }, onExited: function (e) {
                        if (!e)
                            return;
                        e.parentNode.style.display = '';
                        e.style.display = 'none';
                    } },
                    react_1.default.createElement("div", { className: previewPrefixCls + "-mask" })),
                visible && (react_1.default.createElement(resizeObserver_1.default, { onResize: onWrapperResize, getTargetDOMNode: function () { return refWrapper.current; } },
                    react_1.default.createElement("div", { ref: refWrapper, className: previewPrefixCls + "-wrapper", onClick: onOutsideImgClick },
                        react_1.default.createElement("div", { ref: refImageContainer, className: previewPrefixCls + "-img-container", style: { transform: "scale(" + scale + ", " + scale + ")" }, onClick: onOutsideImgClick },
                            renderImage(),
                            isLoading && (react_1.default.createElement("div", { className: previewPrefixCls + "-loading" },
                                react_1.default.createElement(IconLoading_1.default, null)))),
                        react_1.default.createElement(CSSTransition_1.default, { in: scaleValueVisible, timeout: 400, appear: true, classNames: "fadeImage", unmountOnExit: true },
                            react_1.default.createElement("div", { className: previewPrefixCls + "-scale-value" },
                                (scale * 100).toFixed(0),
                                "%")),
                        isLoaded && (react_1.default.createElement(image_preview_toolbar_1.default, { prefixCls: prefixCls, previewPrefixCls: previewPrefixCls, actions: actions, actionsLayout: actionsLayout, defaultActions: defaultActions, simple: toolbarSimple })),
                        closable && (react_1.default.createElement("div", { className: previewPrefixCls + "-close-btn", onClick: onCloseClick },
                            react_1.default.createElement(IconClose_1.default, null))),
                        previewGroup && (react_1.default.createElement(image_preview_arrow_1.default, { previewCount: previewUrlMap.size, current: currentIndex, infinite: infinite, onPrev: onPrev, onNext: onNext })),
                        extraNode)))))));
}
var PreviewComponent = (0, react_1.forwardRef)(Preview);
PreviewComponent.displayName = 'ImagePreview';
exports.default = PreviewComponent;
