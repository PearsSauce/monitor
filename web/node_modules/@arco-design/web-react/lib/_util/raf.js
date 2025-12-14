"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caf = exports.raf = void 0;
var target = typeof window === 'undefined' ? global : window;
var vendors = ['webkit', 'ms', 'moz', 'o'];
var raf = target.requestAnimationFrame; // eslint-disable-line
exports.raf = raf;
var caf = target.cancelAnimationFrame; // eslint-disable-line
exports.caf = caf;
if (!raf || !caf) {
    vendors.some(function (prefix) {
        exports.raf = raf = target[prefix + "RequestAnimationFrame"];
        exports.caf = caf = target[prefix + "CancelAnimationFrame"] || target[prefix + "CancelRequestAnimationFrame"];
        return raf && caf;
    });
    if (!raf || !caf) {
        var lastTime_1 = 0;
        exports.raf = raf = function (cb) {
            var currentTime = Date.now();
            var diff = Math.max(0, 16 - (currentTime - lastTime_1));
            var timer = setTimeout(function () {
                cb();
                lastTime_1 = currentTime + diff;
            }, diff);
            return timer;
        };
        exports.caf = caf = function (timer) {
            clearTimeout(timer);
        };
    }
}
exports.raf = raf = raf.bind(target);
exports.caf = caf = caf.bind(target);
