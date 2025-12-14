"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function useOverflowHidden(getContainer, _a) {
    var hidden = _a.hidden;
    var needResetContainerStyle = (0, react_1.useRef)(false);
    var originContainerStyle = (0, react_1.useRef)({});
    var getScrollBarWidth = function (element) {
        return element.tagName === 'BODY'
            ? window.innerWidth - (document.body.clientWidth || document.documentElement.clientWidth)
            : element.offsetWidth - element.clientWidth;
    };
    var setContainerStyle = function () {
        var container = getContainer();
        if (container && container.style.overflow !== 'hidden') {
            var originStyle = container.style;
            needResetContainerStyle.current = true;
            // 记录并设置宽度
            var containerScrollBarWidth = getScrollBarWidth(container);
            if (containerScrollBarWidth) {
                originContainerStyle.current.width = originStyle.width;
                container.style.width = "calc(" + (container.style.width || '100%') + " - " + containerScrollBarWidth + "px)";
            }
            // 记录并设置overflow
            originContainerStyle.current.overflow = originStyle.overflow;
            container.style.overflow = 'hidden';
        }
    };
    var resetContainerStyle = function () {
        if (needResetContainerStyle.current && getContainer()) {
            var container_1 = getContainer();
            var originStyle_1 = originContainerStyle.current;
            Object.keys(originStyle_1).forEach(function (i) { return (container_1.style[i] = originStyle_1[i]); });
        }
        needResetContainerStyle.current = false;
        originContainerStyle.current = {};
    };
    (0, react_1.useEffect)(function () {
        hidden ? setContainerStyle() : resetContainerStyle();
        return function () {
            resetContainerStyle();
        };
    }, [getContainer, hidden]);
    return [resetContainerStyle, setContainerStyle];
}
exports.default = useOverflowHidden;
