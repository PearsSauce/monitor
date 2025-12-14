"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleCheckValue = exports.formatValue = exports.removeValueFromSet = exports.valueInSet = exports.transformValuesToSet = exports.getStore = exports.getConfig = exports.isEmptyValue = exports.PANEL_MODE = exports.SHOW_CHILD = exports.SHOW_PARENT = exports.ValueSeparator = void 0;
var is_1 = require("../_util/is");
var store_1 = __importDefault(require("./base/store"));
exports.ValueSeparator = '__arco_cascader__';
exports.SHOW_PARENT = 'parent';
exports.SHOW_CHILD = 'child';
exports.PANEL_MODE = {
    cascader: 'cascader',
    select: 'select',
};
function isEmptyValue(value) {
    return !value || ((0, is_1.isArray)(value) && value.length === 0);
}
exports.isEmptyValue = isEmptyValue;
function getConfig(props) {
    return {
        showEmptyChildren: props.showEmptyChildren,
        changeOnSelect: props.changeOnSelect,
        lazyload: !!props.loadMore,
        fieldNames: props.fieldNames,
        filterOption: props.filterOption,
        showParent: props.mode === 'multiple' && !props.changeOnSelect && props.checkedStrategy === exports.SHOW_PARENT,
    };
}
exports.getConfig = getConfig;
function getStore(props, value) {
    var tmp = value ? (Array.isArray(value[0]) ? value : [value]) : [];
    return new store_1.default(props.options || [], tmp, getConfig(props));
}
exports.getStore = getStore;
var transformValuesToSet = function (values) {
    var _values = values || [];
    var valuesSet = _values.reduce(function (set, next) {
        // 'next' could be a string.
        set.add([].concat(next).join(exports.ValueSeparator));
        return set;
    }, new Set());
    return valuesSet;
};
exports.transformValuesToSet = transformValuesToSet;
var valueInSet = function (set, value) {
    var _value = value || [];
    return set.has(_value.join(exports.ValueSeparator));
};
exports.valueInSet = valueInSet;
var removeValueFromSet = function (set, value) {
    var _value = value || [];
    return set.delete(_value.join(exports.ValueSeparator));
};
exports.removeValueFromSet = removeValueFromSet;
var formatValue = function (value, isMultiple, store) {
    var _value = [];
    if (value === undefined) {
        _value = [];
    }
    else if (isMultiple) {
        _value = value;
    }
    else {
        _value = [value];
    }
    if (store && store.config.showParent) {
        var checkedNodes = store.getCheckedNodes();
        var valuesSet_1 = (0, exports.transformValuesToSet)(checkedNodes.map(function (node) { return node.pathValue; }));
        var result_1 = [];
        var temp_1 = {};
        _value.map(function (v) {
            v.some(function (_, index, arr) {
                var curVal = arr.slice(0, index + 1);
                var pass = (0, exports.valueInSet)(valuesSet_1, curVal);
                if (pass && !temp_1[curVal.join(exports.ValueSeparator)]) {
                    result_1.push(curVal);
                    temp_1[curVal.join(exports.ValueSeparator)] = 1;
                }
                return pass;
            });
        });
        return result_1;
    }
    return _value;
};
exports.formatValue = formatValue;
// change check status to false
var deny2Checked = function (option) {
    var deny = function (options) {
        return !Array.isArray(options)
            ? false
            : options.every(function (item) {
                if (item._checked || item.disabled) {
                    return true;
                }
                return deny(item.children);
            });
    };
    return option._halfChecked && deny(option === null || option === void 0 ? void 0 : option.children);
};
var getMultipleCheckValue = function (propsValue, store, option, _checked) {
    var checked = _checked && deny2Checked(option) ? false : _checked;
    var beforeValueSet = store.getCheckedNodes().reduce(function (set, node) {
        set.add(node.pathValue.join(exports.ValueSeparator));
        return set;
    }, new Set());
    option.setCheckedState(checked);
    var checkedNodes = store.getCheckedNodes();
    var currentValue = checkedNodes.map(function (node) { return node.pathValue; });
    var currentValueSet = (0, exports.transformValuesToSet)(currentValue);
    var newValueSet = new Set();
    return propsValue
        .filter(function (v) {
        // v 不在 beforeValueSet 中，说明 v 不包含对应的option。直接返回true，不应该清除掉。
        if (!(0, exports.valueInSet)(beforeValueSet, v) || (0, exports.valueInSet)(currentValueSet, v)) {
            newValueSet.add(v.join(exports.ValueSeparator));
            return true;
        }
    })
        .concat(currentValue.filter(function (v) {
        return !(0, exports.valueInSet)(newValueSet, v);
    }));
};
exports.getMultipleCheckValue = getMultipleCheckValue;
