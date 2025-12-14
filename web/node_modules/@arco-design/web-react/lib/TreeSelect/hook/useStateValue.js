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
exports.parseValue = void 0;
var react_1 = require("react");
var isEqualWith_1 = __importDefault(require("lodash/isEqualWith"));
var utils_1 = require("../utils");
var is_1 = require("../../_util/is");
var Tree_1 = __importDefault(require("../../Tree"));
var util_1 = require("../../Tree/util");
var useUpdate_1 = __importDefault(require("../../_util/hooks/useUpdate"));
var parseValue = function (v, key2nodeProps, valueMap) {
    if (v === undefined || v === null) {
        return [];
    }
    var value = (0, is_1.isArray)(v) ? v : [v];
    return value.map(function (x) {
        var result = (0, is_1.isObject)(x) ? __assign({}, x) : { value: x, label: undefined };
        var item = key2nodeProps[result.value];
        if (item) {
            result.label = result.label || item.title;
            result.disabled = item.disabled;
        }
        else if ((0, is_1.isArray)(valueMap)) {
            var v_1 = valueMap.find(function (y) { return y.value === result.value; });
            result = __assign(__assign({}, result), v_1);
        }
        if ((0, is_1.isUndefined)(result.label)) {
            result.label = result.value;
        }
        return result;
    });
};
exports.parseValue = parseValue;
var getInitCheckKeys = function (keys, key2nodeProps, indeterminateKeys, props) {
    if (!props.treeCheckStrictly) {
        var _a = (0, util_1.getCheckedKeysByInitKeys)(keys, key2nodeProps), allCheckedKeys = _a.checkedKeys, halfKeys = _a.indeterminateKeys;
        var checkedKeys_1 = allCheckedKeys;
        indeterminateKeys.current = halfKeys;
        if (props.treeCheckedStrategy === Tree_1.default.SHOW_PARENT) {
            checkedKeys_1 = checkedKeys_1.filter(function (x) {
                var item = key2nodeProps[x];
                if (!item || checkedKeys_1.indexOf(item.parentKey) === -1) {
                    return true;
                }
            });
        }
        else if (props.treeCheckedStrategy === Tree_1.default.SHOW_CHILD) {
            checkedKeys_1 = checkedKeys_1.filter(function (x) {
                var item = key2nodeProps[x];
                if (!item || !item.children || !item.children.length) {
                    return true;
                }
            });
        }
        return checkedKeys_1;
    }
    indeterminateKeys.current = [];
    return keys;
};
var useStateValue = function (props, key2nodeProps, indeterminateKeys) {
    var valueCopy = (0, react_1.useRef)([]);
    var calcValue = function () {
        var propsValue = props.value || props.defaultValue || [];
        if (props.treeCheckable) {
            var initCheckedKeys = getInitCheckKeys((0, utils_1.normalizeValueToArray)(propsValue), key2nodeProps, indeterminateKeys, props);
            var parsedPropValue = (0, exports.parseValue)(propsValue, key2nodeProps, valueCopy.current);
            var parsedCheckedValue = (0, exports.parseValue)(initCheckedKeys, key2nodeProps, parsedPropValue);
            return parsedCheckedValue;
        }
        return (0, exports.parseValue)(propsValue, key2nodeProps);
    };
    var _a = __read((0, react_1.useState)(calcValue), 2), value = _a[0], _setValue = _a[1];
    var setValue = function (value) {
        valueCopy.current = value;
        _setValue(value);
    };
    (0, useUpdate_1.default)(function () {
        var nextValue = calcValue();
        if ('value' in props) {
            if (props.labelInValue) {
                // 以外部传入为准,只比较value
                if (!(0, isEqualWith_1.default)((0, utils_1.normalizeValueToArray)(value), (0, utils_1.normalizeValueToArray)(nextValue))) {
                    setValue(nextValue);
                }
            }
            else if (!(0, isEqualWith_1.default)(value, nextValue)) {
                setValue(nextValue);
            }
        }
    }, [
        props.treeCheckedStrategy,
        props.treeCheckStrictly,
        props.treeCheckable,
        props.value,
        key2nodeProps,
    ]);
    var setStateValue = (0, react_1.useCallback)(function (newValue, extra) {
        var onChange = props.onChange, labelInValue = props.labelInValue;
        var multiple = props.multiple || props.treeCheckable;
        if (!('value' in props)) {
            setValue(newValue);
        }
        var tmp;
        if (multiple) {
            tmp = newValue.map(function (x) {
                return labelInValue ? { label: x.label, value: x.value } : x.value;
            });
        }
        else {
            tmp = labelInValue ? newValue[0] : newValue[0] && newValue[0].value;
        }
        onChange && onChange(tmp, extra);
    }, [props.onChange, props.labelInValue, props.multiple, props.treeCheckable, props.value]);
    return [value, setStateValue];
};
exports.default = useStateValue;
