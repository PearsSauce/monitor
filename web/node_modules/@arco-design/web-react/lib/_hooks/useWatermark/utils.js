"use strict";
// canvas渲染图片会导致图片失焦模糊，
// 需要对图片进行缩放保证可读性
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPixelRatio = void 0;
// polyfill 提供了这个方法用来获取设备的 pixel ratio
function getPixelRatio(context) {
    if (!context)
        return 1;
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio ||
        1;
    return (window.devicePixelRatio || 1) / backingStore;
}
exports.getPixelRatio = getPixelRatio;
