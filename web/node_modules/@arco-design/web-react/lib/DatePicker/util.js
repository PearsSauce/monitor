"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormatByIndex = exports.getLocaleDayjsValue = exports.getDefaultWeekStart = exports.isDisabledDate = exports.getAvailableDayjsLength = exports.isTimeArrayChange = void 0;
var dayjs_1 = __importDefault(require("dayjs"));
var is_1 = require("../_util/is");
var dayjs_2 = require("../_util/dayjs");
function getFormat(time) {
    return (0, is_1.isDayjs)(time) && time.format('HH:mm:ss');
}
function isTimeArrayChange(prevTime, nextTime) {
    return (getFormat(prevTime[0]) !== getFormat(nextTime[0]) ||
        getFormat(prevTime[1]) !== getFormat(nextTime[1]));
}
exports.isTimeArrayChange = isTimeArrayChange;
function getAvailableDayjsLength(value) {
    if (!value) {
        return 0;
    }
    if ((0, is_1.isArray)(value)) {
        if ((0, is_1.isDayjs)(value[0]) && (0, is_1.isDayjs)(value[1])) {
            return 2;
        }
        if (!(0, is_1.isDayjs)(value[0]) && !(0, is_1.isDayjs)(value[1])) {
            return 0;
        }
        return 1;
    }
    return 0;
}
exports.getAvailableDayjsLength = getAvailableDayjsLength;
// https://github.com/react-component/picker/blob/master/src/utils/dateUtil.ts#L234
function isDisabledDate(cellDate, disabledDate, mode) {
    if (typeof disabledDate !== 'function') {
        return false;
    }
    // Whether cellDate is disabled in range
    var getDisabledFromRange = function (currentMode, start, end) {
        var current = start;
        while (current <= end) {
            var date = void 0;
            switch (currentMode) {
                case 'date': {
                    date = dayjs_2.methods.set(cellDate, 'date', current);
                    if (!disabledDate(date)) {
                        return false;
                    }
                    break;
                }
                case 'month': {
                    date = dayjs_2.methods.set(cellDate, 'month', current);
                    if (!isDisabledDate(date, disabledDate, 'month')) {
                        return false;
                    }
                    break;
                }
                case 'year': {
                    date = dayjs_2.methods.set(cellDate, 'year', current);
                    if (!isDisabledDate(date, disabledDate, 'year')) {
                        return false;
                    }
                    break;
                }
                default:
                    break;
            }
            current += 1;
        }
        return true;
    };
    switch (mode) {
        case 'date':
        case 'week': {
            return disabledDate(cellDate);
        }
        case 'month': {
            var startDate = 1;
            var endDate = cellDate.endOf('month').get('date');
            return getDisabledFromRange('date', startDate, endDate);
        }
        case 'quarter': {
            var startMonth = Math.floor(cellDate.get('month') / 3) * 3;
            var endMonth = startMonth + 2;
            return getDisabledFromRange('month', startMonth, endMonth);
        }
        case 'year': {
            return getDisabledFromRange('month', 0, 11);
        }
        default:
            return false;
    }
}
exports.isDisabledDate = isDisabledDate;
function getDefaultWeekStart(dayjsLocale) {
    var _a, _b;
    return ((_b = (_a = dayjs_1.default.Ls) === null || _a === void 0 ? void 0 : _a[dayjsLocale]) === null || _b === void 0 ? void 0 : _b.weekStart) || 0;
}
exports.getDefaultWeekStart = getDefaultWeekStart;
function getLocaleDayjsValue(date, dayjsLocale) {
    return date ? date.locale(dayjsLocale) : date;
}
exports.getLocaleDayjsValue = getLocaleDayjsValue;
function getFormatByIndex(format, index) {
    return (0, is_1.isArray)(format) ? format[index] : format;
}
exports.getFormatByIndex = getFormatByIndex;
