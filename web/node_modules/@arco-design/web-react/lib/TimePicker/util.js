"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormatTime = exports.scrollTo = exports.getColumnsFromFormat = void 0;
var b_tween_1 = __importDefault(require("b-tween"));
var dayjs_1 = require("../_util/dayjs");
var is_1 = require("../_util/is");
function getColumnsFromFormat(format) {
    var units = ['H', 'h', 'm', 's', 'a', 'A'];
    var list = [];
    var use12Hours = false;
    units.forEach(function (unit) {
        if (format.indexOf(unit) !== -1) {
            list.push(unit);
            if (unit === 'a' || unit === 'A') {
                use12Hours = true;
            }
        }
    });
    return {
        list: list,
        use12Hours: use12Hours,
    };
}
exports.getColumnsFromFormat = getColumnsFromFormat;
var scrollIds = new Map();
function scrollTo(element, to, duration) {
    if (scrollIds.get(element)) {
        cancelAnimationFrame(scrollIds.get(element));
    }
    if (duration <= 0) {
        element.scrollTop = to;
    }
    scrollIds.set(element, requestAnimationFrame(function () {
        var tween = new b_tween_1.default({
            from: { scrollTop: element.scrollTop },
            to: { scrollTop: to },
            duration: duration,
            onUpdate: function (keys) {
                element.scrollTop = keys.scrollTop;
            },
            easing: 'quartInOut',
        });
        tween.start();
    }));
}
exports.scrollTo = scrollTo;
function getFormatTime(time) {
    var today = (0, dayjs_1.dayjs)();
    var y = today.year();
    var m = today.month();
    var d = today.date();
    if ((0, is_1.isDayjs)(time)) {
        var returnTime = time;
        returnTime = dayjs_1.methods.set(returnTime, 'year', y);
        returnTime = dayjs_1.methods.set(returnTime, 'month', m);
        returnTime = dayjs_1.methods.set(returnTime, 'date', d);
        return returnTime;
    }
    return time;
}
exports.getFormatTime = getFormatTime;
