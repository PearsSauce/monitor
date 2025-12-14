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
var throttle_1 = __importDefault(require("lodash/throttle"));
var compute_scroll_into_view_1 = __importDefault(require("compute-scroll-into-view"));
var scroll_into_view_if_needed_1 = __importDefault(require("scroll-into-view-if-needed"));
var is_1 = require("../_util/is");
var dom_1 = require("../_util/dom");
var classNames_1 = __importDefault(require("../_util/classNames"));
var useIsFirstRender_1 = __importDefault(require("../_util/hooks/useIsFirstRender"));
var Affix_1 = __importDefault(require("../Affix"));
var ConfigProvider_1 = require("../ConfigProvider");
var context_1 = __importDefault(require("./context"));
var utils_1 = require("./utils");
var useStateWithPromise_1 = __importDefault(require("../_util/hooks/useStateWithPromise"));
var link_1 = __importDefault(require("./link"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var defaultProps = {
    animation: true,
    affix: true,
    hash: true,
    boundary: 'start',
};
function Anchor(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Anchor);
    var className = props.className, style = props.style, propScrollContainer = props.scrollContainer, _c = props.animation, animation = _c === void 0 ? true : _c, lineless = props.lineless, _d = props.affix, affix = _d === void 0 ? true : _d, affixStyle = props.affixStyle, offsetBottom = props.offsetBottom, offsetTop = props.offsetTop, _e = props.hash, willChangeHash = _e === void 0 ? true : _e, _f = props.boundary, boundary = _f === void 0 ? 'start' : _f, targetOffset = props.targetOffset, children = props.children, _g = props.direction, direction = _g === void 0 ? 'vertical' : _g, onSelect = props.onSelect, onChange = props.onChange, rest = __rest(props, ["className", "style", "scrollContainer", "animation", "lineless", "affix", "affixStyle", "offsetBottom", "offsetTop", "hash", "boundary", "targetOffset", "children", "direction", "onSelect", "onChange"]);
    var prefixCls = getPrefixCls('anchor');
    var classNames = (0, classNames_1.default)(prefixCls, className, (_a = {},
        _a[prefixCls + "-lineless"] = lineless,
        _a[prefixCls + "-rtl"] = rtl,
        _a[prefixCls + "-horizontal"] = direction === 'horizontal',
        _a));
    var wrapperRef = (0, react_1.useRef)(null);
    var sliderLineRef = (0, react_1.useRef)(null);
    var linkMap = (0, react_1.useRef)(new Map());
    var isScrolling = (0, react_1.useRef)(false);
    var scrollContainer = (0, react_1.useRef)(null);
    // use this flag to trigger re-computing position of active link slider line
    var _h = __read((0, react_1.useState)(0), 2), flagUpdateSliderLine = _h[0], setFlagUpdateSliderLine = _h[1];
    var _j = __read((0, useStateWithPromise_1.default)(''), 2), currentLink = _j[0], setCurrentLink = _j[1];
    var isFirstRender = (0, useIsFirstRender_1.default)();
    (0, react_1.useEffect)(function () {
        var container = (0, utils_1.getContainer)(propScrollContainer);
        scrollContainer.current = container;
    }, [propScrollContainer]);
    var getAffixTarget = (0, react_1.useCallback)(function () {
        return (0, utils_1.getContainer)(propScrollContainer);
    }, [propScrollContainer]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        dom: wrapperRef.current,
        getRootDOMNode: function () { return wrapperRef.current; },
    }); }, []);
    function addLink(hash, element) {
        if (hash) {
            linkMap.current.set(hash, element);
            setFlagUpdateSliderLine(Math.random());
        }
    }
    function removeLink(hash) {
        linkMap.current.delete(hash);
        setFlagUpdateSliderLine(Math.random());
    }
    var setActiveLink = (0, react_1.useCallback)(function (hash) {
        if (!hash || !wrapperRef.current)
            return;
        // Try to add when there is no corresponding link
        if (!linkMap.current.has(hash)) {
            var node_1 = (0, utils_1.findNode)(wrapperRef.current, "a[data-href='" + hash + "']");
            node_1 && addLink(hash, node_1);
        }
        var node = linkMap.current.get(hash);
        if (node && hash !== currentLink) {
            (0, scroll_into_view_if_needed_1.default)(node, {
                behavior: 'auto',
                block: 'nearest',
                scrollMode: 'if-needed',
                boundary: wrapperRef.current,
            });
            setCurrentLink(hash).then(function () {
                (0, is_1.isFunction)(onChange) && onChange(hash, currentLink);
            });
        }
    }, [currentLink, onChange]);
    var getEleInViewport = (0, react_1.useCallback)(function () {
        var result;
        var startTop = (0, is_1.isNumber)(boundary) ? boundary : 0;
        var container = scrollContainer.current;
        var containerElement = (0, utils_1.getContainerElement)(container);
        var containerRect = containerElement.getBoundingClientRect();
        var documentHeight = document.documentElement.clientHeight;
        __spreadArray([], __read(linkMap.current.keys()), false).some(function (hash) {
            var element = (0, utils_1.findNode)(document, hash);
            var inView = false;
            if (element) {
                var _a = element.getBoundingClientRect(), top_1 = _a.top, height = _a.height;
                if ((0, is_1.isWindow)(container)) {
                    var innerTargetOffset = targetOffset !== null && targetOffset !== void 0 ? targetOffset : documentHeight / 2;
                    inView =
                        (top_1 >= startTop && top_1 <= innerTargetOffset) ||
                            (top_1 <= startTop && top_1 + height >= innerTargetOffset);
                }
                else {
                    var offsetTop_1 = top_1 - containerRect.top - startTop;
                    var innerTargetOffset = targetOffset !== null && targetOffset !== void 0 ? targetOffset : containerRect.height / 2;
                    inView =
                        (offsetTop_1 >= 0 && offsetTop_1 <= innerTargetOffset) ||
                            (offsetTop_1 <= 0 && offsetTop_1 + height >= innerTargetOffset);
                }
                if (inView) {
                    result = element;
                }
            }
            return inView;
        });
        return result;
    }, [boundary, targetOffset]);
    var onScroll = (0, react_1.useCallback)((0, throttle_1.default)(function () {
        if (isScrolling.current)
            return;
        var element = getEleInViewport();
        if (element && element.id) {
            var hash = "#" + element.id;
            setActiveLink(hash);
        }
    }, 30, { trailing: true }), [getEleInViewport, setActiveLink]);
    function scrollIntoView(hash) {
        if (!hash)
            return;
        try {
            var element = (0, utils_1.findNode)(document, hash);
            if (!element)
                return;
            var block = (0, is_1.isNumber)(boundary) ? 'start' : boundary;
            var offset_1 = (0, is_1.isNumber)(boundary) ? boundary : 0;
            var actions = (0, compute_scroll_into_view_1.default)(element, { block: block });
            if (!actions.length)
                return;
            var stopScroll_1 = false;
            var promises = actions.map(function (_a) {
                var el = _a.el, top = _a.top;
                return new Promise(function (resolve) {
                    if (!stopScroll_1) {
                        if (el === scrollContainer.current) {
                            stopScroll_1 = true;
                        }
                        var targetTop = top - offset_1;
                        if (!animation) {
                            // Manually trigger scrolling as browser's default action is prevented when `props.hash` is false
                            if (!willChangeHash) {
                                el.scrollTop = targetTop;
                            }
                            return resolve(null);
                        }
                        return (0, utils_1.slide)(el, targetTop, resolve);
                    }
                    resolve(null);
                });
            });
            isScrolling.current = true;
            Promise.all(promises).then(function () {
                isScrolling.current = false;
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    function onLinkClick(e, hash) {
        if (!willChangeHash) {
            e.preventDefault();
        }
        setActiveLink(hash);
        scrollIntoView(hash);
        (0, is_1.isFunction)(onSelect) && onSelect(hash, currentLink);
    }
    (0, react_1.useEffect)(function () {
        var hash = decodeURIComponent(location.hash);
        if (hash) {
            setActiveLink(hash);
            scrollIntoView(hash);
        }
        else {
            // compute current active anchor
            onScroll();
        }
    }, []);
    (0, react_1.useEffect)(function () {
        if (!isFirstRender) {
            onScroll();
        }
        (0, dom_1.on)(scrollContainer.current, 'scroll', onScroll);
        return function () {
            (0, dom_1.off)(scrollContainer.current, 'scroll', onScroll);
        };
    }, [propScrollContainer, onScroll]);
    (0, react_1.useEffect)(function () {
        var link = linkMap.current.get(currentLink);
        if (link && !lineless && sliderLineRef.current) {
            if (direction === 'horizontal') {
                // if (rtl) {
                //   sliderLineRef.current.style.right = `${link.offsetLeft}px`;
                // } else {
                // }
                sliderLineRef.current.style.left = link.offsetLeft + "px";
                sliderLineRef.current.style.width = link.clientWidth + "px";
            }
            else {
                sliderLineRef.current.style.top = link.offsetTop + "px";
            }
        }
    }, [currentLink, lineless, direction, rtl, flagUpdateSliderLine]);
    var content = (react_1.default.createElement("div", __assign({ className: classNames, style: style, ref: wrapperRef }, rest),
        !lineless && currentLink && (react_1.default.createElement("div", { className: prefixCls + "-line-slider", ref: sliderLineRef })),
        react_1.default.createElement(context_1.default.Provider, { value: {
                direction: direction,
                currentLink: currentLink,
                addLink: addLink,
                removeLink: removeLink,
                onLinkClick: onLinkClick,
            } },
            react_1.default.createElement("div", { className: prefixCls + "-list" }, children))));
    return affix ? (react_1.default.createElement(Affix_1.default, { offsetTop: offsetTop, offsetBottom: offsetBottom, style: affixStyle, target: getAffixTarget }, content)) : (content);
}
var ForwardRefAnchor = (0, react_1.forwardRef)(Anchor);
var AnchorComponent = ForwardRefAnchor;
AnchorComponent.displayName = 'Anchor';
AnchorComponent.Link = link_1.default;
exports.default = AnchorComponent;
