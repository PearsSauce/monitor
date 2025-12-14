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
var indicator_1 = __importDefault(require("./indicator"));
var arrow_1 = __importDefault(require("./arrow"));
var ConfigProvider_1 = require("../ConfigProvider");
var useInterval_1 = require("../_util/hooks/useInterval");
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var warning_1 = __importDefault(require("../_util/warning"));
var omit_1 = __importDefault(require("../_util/omit"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var DEFAULT_AUTO_PLAY_INTERVAL = 3000;
var defaultProps = {
    animation: 'slide',
    indicatorType: 'dot',
    indicatorPosition: 'bottom',
    direction: 'horizontal',
    showArrow: 'always',
    trigger: 'click',
    moveSpeed: 500,
    timingFunc: 'cubic-bezier(0.34, 0.69, 0.1, 1)',
};
function Carousel(baseProps, ref) {
    var _a, _b, _c;
    var _d = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _d.getPrefixCls, componentConfig = _d.componentConfig, rtl = _d.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Carousel);
    var style = props.style, className = props.className, children = props.children, currentIndex = props.currentIndex, animation = props.animation, trigger = props.trigger, direction = props.direction, moveSpeed = props.moveSpeed, timingFunc = props.timingFunc, indicatorType = props.indicatorType, indicatorPosition = props.indicatorPosition, indicatorClassName = props.indicatorClassName, showArrow = props.showArrow, miniRender = props.miniRender, arrowClassName = props.arrowClassName, carousel = props.carousel, icons = props.icons, onChange = props.onChange, rest = __rest(props, ["style", "className", "children", "currentIndex", "animation", "trigger", "direction", "moveSpeed", "timingFunc", "indicatorType", "indicatorPosition", "indicatorClassName", "showArrow", "miniRender", "arrowClassName", "carousel", "icons", "onChange"]);
    // TODO 兼容 autoPlaySpeed， 3.x 移除
    var autoPlay = props.autoPlay;
    if (autoPlay && props.autoPlaySpeed) {
        autoPlay = {
            interval: props.autoPlaySpeed,
        };
        (0, warning_1.default)(true, "[Arco Carousel] The 'autoPlaySpeed' property will be removed in the next major version, please use 'autoPlay.interval' instead.");
    }
    var childrenList = react_1.default.Children.toArray(children).filter(function (child) {
        return react_1.default.isValidElement(child);
    });
    var childrenLength = childrenList.length;
    var refDom = (0, react_1.useRef)(null);
    var refSliderWrapper = (0, react_1.useRef)(null);
    var refAnimationTimer = (0, react_1.useRef)(null);
    var _e = __read((0, react_1.useState)(typeof currentIndex === 'number' ? getValidIndex(currentIndex) : 0), 2), index = _e[0], setIndex = _e[1];
    var _f = __read((0, react_1.useState)(index), 2), previousIndex = _f[0], setPreviousIndex = _f[1];
    var _g = __read((0, react_1.useState)(false), 2), isPause = _g[0], setIsPause = _g[1];
    var _h = __read((0, react_1.useState)(false), 2), isAnimating = _h[0], setIsAnimating = _h[1];
    var _j = __read((0, react_1.useState)(null), 2), slideDirection = _j[0], setSlideDirection = _j[1];
    var _k = __read((0, react_1.useState)({
        sliderWrapper: null,
        indicatorWrapper: null,
    }), 2), computedStyle = _k[0], setComputedStyle = _k[1];
    var mergedIndex = typeof currentIndex === 'number' ? getValidIndex(currentIndex) : index;
    var prevIndex = getValidIndex(mergedIndex - 1);
    var nextIndex = getValidIndex(mergedIndex + 1);
    var autoPlayInterval = typeof autoPlay === 'object' && autoPlay.interval
        ? autoPlay.interval
        : DEFAULT_AUTO_PLAY_INTERVAL;
    (0, react_1.useEffect)(function () {
        return function () { return refAnimationTimer.current && clearTimeout(refAnimationTimer.current); };
    }, []);
    (0, react_1.useEffect)(function () {
        slideTo({
            targetIndex: mergedIndex,
        });
    }, [mergedIndex]);
    var resetInterval = (0, useInterval_1.useInterval)(function () {
        slideTo({
            targetIndex: nextIndex,
        });
    }, autoPlay && !isPause && childrenLength > 1 ? autoPlayInterval : null);
    (0, react_1.useImperativeHandle)(carousel, function () {
        return {
            dom: refDom.current,
            getRootDOMNode: function () { return refDom.current; },
            goto: function (_a) {
                var index = _a.index, isNegative = _a.isNegative, isManual = _a.isManual, resetAutoPlayInterval = _a.resetAutoPlayInterval;
                slideTo({
                    targetIndex: getValidIndex(index),
                    isNegative: isNegative,
                    isManual: isManual,
                    resetAutoPlayInterval: resetAutoPlayInterval,
                });
            },
        };
    });
    function getValidIndex(i) {
        var indexNumber = +i;
        return typeof indexNumber === 'number' && !isNaN(indexNumber)
            ? (indexNumber + childrenLength) % childrenLength
            : i;
    }
    function slideTo(_a) {
        var targetIndex = _a.targetIndex, _b = _a.isNegative, isNegative = _b === void 0 ? false : _b, _c = _a.isManual, isManual = _c === void 0 ? false : _c, _d = _a.resetAutoPlayInterval, resetAutoPlayInterval = _d === void 0 ? false : _d;
        if (!isAnimating && targetIndex !== mergedIndex) {
            setIsAnimating(true);
            setIndex(targetIndex);
            setPreviousIndex(index);
            setSlideDirection(isNegative ? 'negative' : 'positive');
            onChange && onChange(targetIndex, mergedIndex, isManual);
            if (autoPlay && resetAutoPlayInterval) {
                resetInterval();
            }
            refAnimationTimer.current = setTimeout(function () {
                setIsAnimating(false);
                refAnimationTimer.current = null;
            }, moveSpeed);
        }
    }
    function computeStyle() {
        if (animation === 'card') {
            if (refSliderWrapper.current) {
                var sliderElement = refSliderWrapper.current.children[0];
                if (!sliderElement) {
                    return;
                }
                if (direction === 'horizontal') {
                    var totalWidth = refSliderWrapper.current.clientWidth;
                    var sliderWidth = sliderElement.clientWidth;
                    var edge = (totalWidth - sliderWidth) / 2;
                    // deltaZ is TranslateZ(-Zpx) of prev/next slider's style
                    // perspective / (perspective + deltaZ) = x / X
                    var deltaZ = 200;
                    var x = totalWidth / 2;
                    var X = sliderWidth;
                    // avoid getting a huge perspective value
                    var perspective = x + 50 >= X ? deltaZ * 4 : (deltaZ * x) / (X - x);
                    setComputedStyle({
                        sliderWrapper: {
                            perspective: perspective,
                        },
                        indicatorWrapper: {
                            width: 'auto',
                            left: edge,
                            right: edge,
                        },
                    });
                }
                else {
                    var totalHeight = refSliderWrapper.current.clientHeight;
                    var sliderHeight = sliderElement.clientHeight;
                    var edge = (totalHeight - sliderHeight) / 2;
                    // deltaZ is TranslateZ(-Zpx) of prev/next slider's style
                    // perspective / (perspective + deltaZ) = x / X
                    var deltaZ = 200;
                    var y = totalHeight / 2;
                    var Y = sliderHeight;
                    // avoid getting a huge perspective value
                    var perspective = y + 50 >= Y ? deltaZ * 4 : (deltaZ * y) / (Y - y);
                    setComputedStyle({
                        sliderWrapper: {
                            perspective: perspective,
                        },
                        indicatorWrapper: {
                            height: 'auto',
                            top: edge,
                            bottom: edge,
                        },
                    });
                }
            }
        }
        else {
            setComputedStyle({
                sliderWrapper: null,
                indicatorWrapper: null,
            });
        }
    }
    var prefixCls = getPrefixCls('carousel');
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-indicator-position-" + indicatorPosition, (_a = {},
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var eventHandlers = Object.assign({}, autoPlay && (typeof autoPlay !== 'object' || autoPlay.hoverToPause !== false)
        ? {
            onMouseEnter: function () { return setIsPause(true); },
            onMouseLeave: function () { return setIsPause(false); },
        }
        : null);
    var _l = __read([
        function () {
            return slideTo({
                targetIndex: prevIndex,
                isNegative: true,
                isManual: true,
            });
        },
        function () {
            return slideTo({
                targetIndex: nextIndex,
                isManual: true,
            });
        },
    ], 2), slideToPrev = _l[0], slideToNext = _l[1];
    if (rtl) {
        _b = __read([slideToNext, slideToPrev], 2), slideToPrev = _b[0], slideToNext = _b[1];
    }
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: computeStyle, getTargetDOMNode: function () { return refDom.current; } },
        react_1.default.createElement("div", __assign({ ref: function (_ref) {
                ref = _ref;
                refDom.current = ref;
            }, className: classNames, style: style }, (0, omit_1.default)(rest, ['autoplay', 'autoPlaySpeed']), eventHandlers),
            react_1.default.createElement("div", { ref: refSliderWrapper, style: computedStyle.sliderWrapper, className: (0, classNames_1.default)(prefixCls + "-" + animation, prefixCls + "-" + direction, (_c = {},
                    _c[prefixCls + "-negative"] = slideDirection === 'negative',
                    _c)) }, childrenList.map(function (child, index) {
                var _a;
                var isCurrent = index === mergedIndex;
                var isPrev = index === prevIndex;
                var isNext = index === nextIndex;
                var shouldRenderChild = !miniRender || isCurrent || isPrev || isNext;
                if (!shouldRenderChild) {
                    return null;
                }
                var _b = child.props, childStyle = _b.style, childClassName = _b.className, childOnClick = _b.onClick;
                return react_1.default.cloneElement(child, {
                    'aria-hidden': !isCurrent,
                    style: Object.assign({
                        transitionTimingFunction: timingFunc,
                        transitionDuration: moveSpeed + "ms",
                        animationTimingFunction: timingFunc,
                        animationDuration: moveSpeed + "ms",
                    }, childStyle),
                    className: (0, classNames_1.default)(childClassName, (_a = {},
                        _a[prefixCls + "-item-prev"] = isPrev,
                        _a[prefixCls + "-item-next"] = isNext,
                        _a[prefixCls + "-item-current"] = isCurrent,
                        _a[prefixCls + "-item-slide-in"] = animation === 'slide' && slideDirection && isAnimating && isCurrent,
                        _a[prefixCls + "-item-slide-out"] = animation === 'slide' && slideDirection && isAnimating && index === previousIndex,
                        _a)),
                    onClick: function (event) {
                        childOnClick && childOnClick(event);
                        slideTo({
                            targetIndex: index,
                            isNegative: index === prevIndex,
                            isManual: true,
                        });
                    },
                });
            })),
            indicatorType !== 'never' && childrenLength > 1 && (react_1.default.createElement("div", { style: computedStyle.indicatorWrapper, className: (0, classNames_1.default)(prefixCls + "-indicator-wrapper", prefixCls + "-indicator-wrapper-" + indicatorPosition) },
                react_1.default.createElement(indicator_1.default, { className: indicatorClassName, type: indicatorType, count: childrenLength, activeIndex: mergedIndex, position: indicatorPosition, trigger: trigger, onSelectIndex: function (index) {
                        return slideTo({
                            targetIndex: index,
                            isNegative: index < mergedIndex,
                            isManual: true,
                        });
                    } }))),
            showArrow !== 'never' && childrenLength > 1 && (react_1.default.createElement(arrow_1.default, { className: arrowClassName, direction: direction, showArrow: showArrow, icons: icons, prev: slideToPrev, next: slideToNext })))));
}
var CarouselComponent = react_1.default.forwardRef(Carousel);
CarouselComponent.displayName = 'Carousel';
exports.default = CarouselComponent;
