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
var get_1 = __importDefault(require("lodash/get"));
var form_item_1 = __importDefault(require("./form-item"));
var is_1 = require("../_util/is");
var utils_1 = require("./utils");
var warning_1 = __importDefault(require("../_util/warning"));
var context_1 = require("./context");
var isIndexLegal = function (index, value) {
    return !(0, is_1.isUndefined)(index) && index >= 0 && index < value.length;
};
var List = function (props) {
    var field = props.field, children = props.children, initialValue = props.initialValue;
    var keysRef = (0, react_1.useRef)({
        id: 0,
        keys: [],
    });
    var extra = 'initialValue' in props ? { initialValue: initialValue } : {};
    var currentKeys = keysRef.current.keys;
    return (react_1.default.createElement(context_1.FormListContext.Provider, { value: {
            getItemKey: function (fieldKey) {
                var keys = fieldKey === null || fieldKey === void 0 ? void 0 : fieldKey.replace(/\[|\]/g, '.').split('.');
                var startIndex = keys.indexOf(field);
                var index = keys[startIndex + 1];
                return field + "_" + currentKeys.indexOf(index) + "_" + keys.slice(startIndex + 2).join('_');
            },
        } },
        react_1.default.createElement(form_item_1.default, __assign({ field: field }, extra, { isFormList: true, rules: props.rules, wrapperCol: { span: 24 }, noStyle: 'noStyle' in props ? props.noStyle : !props.rules, shouldUpdate: function (prev, current, info) {
                var _a, _b;
                if (info && !info.isInner && (0, utils_1.isFieldMatch)(info.field, [field])) {
                    if (((_a = (0, get_1.default)(prev, field)) === null || _a === void 0 ? void 0 : _a.length) !== ((_b = (0, get_1.default)(current, field)) === null || _b === void 0 ? void 0 : _b.length)) {
                        // 长度不一致才需要整体渲染，如 form.setfieldsValue('a.100', 'xx')
                        // 修改了某一项的话直接叫给对应的 FormItem 渲染即可
                        return true;
                    }
                }
                return false;
            } }), function (_, store, _a) {
            var _value = _a.value, onChange = _a.onChange;
            var value = _value || [];
            // 为啥 add，move，remove 里不直接用 value，而是又 getFieldValue？
            // 因为用户可能把 add，remove，move 给 memo 了，导致 remove 直接读取的 value 不是最新的
            // 保持和 2.46.0 以前的版本一致
            var add = function (defaultValue, index) {
                var _a;
                if ((0, utils_1.isSyntheticEvent)(defaultValue)) {
                    (0, warning_1.default)(true, 'Form.List: The event object cannot be used as a parameter of the add method');
                    return;
                }
                var value = ((_a = store.getInnerMethods(true)) === null || _a === void 0 ? void 0 : _a.innerGetFieldValue(field)) || [];
                var key = keysRef.current.id;
                keysRef.current.id += 1;
                var oldValue = value || [];
                var newValue = oldValue;
                if (index !== undefined && index >= 0 && index <= oldValue.length) {
                    currentKeys.splice(index, 0, key);
                    newValue = __spreadArray(__spreadArray(__spreadArray([], __read(oldValue.slice(0, index)), false), [defaultValue], false), __read(oldValue.slice(index)), false);
                }
                else {
                    currentKeys.push(key);
                    newValue = __spreadArray(__spreadArray([], __read(oldValue), false), [defaultValue], false);
                }
                // defaultValue = undefined 时，认为当前字段未被操作过
                onChange(newValue, {
                    isFormList: true,
                    ignore: defaultValue === undefined,
                });
            };
            var remove = function (index) {
                var _a;
                var value = ((_a = store.getInnerMethods(true)) === null || _a === void 0 ? void 0 : _a.innerGetFieldValue(field)) || [];
                var newValue = value.filter(function (_, i) { return i !== index; });
                currentKeys.splice(index, 1);
                onChange(__spreadArray([], __read(newValue), false), { isFormList: true });
            };
            var move = function (fromIndex, toIndex) {
                var _a;
                var value = ((_a = store.getInnerMethods(true)) === null || _a === void 0 ? void 0 : _a.innerGetFieldValue(field)) || [];
                if (fromIndex === toIndex ||
                    !isIndexLegal(fromIndex, value) ||
                    !isIndexLegal(toIndex, value)) {
                    return;
                }
                var fromId = currentKeys[fromIndex];
                currentKeys.splice(fromIndex, 1);
                currentKeys.splice(toIndex, 0, fromId);
                var fromItem = value[fromIndex];
                var newValue = __spreadArray([], __read(value), false);
                newValue.splice(fromIndex, 1);
                newValue.splice(toIndex, 0, fromItem);
                onChange(newValue, { isFormList: true });
            };
            return ((0, is_1.isFunction)(children) &&
                children(value.map(function (_, index) {
                    var key = currentKeys[index];
                    if (key === undefined) {
                        key = keysRef.current.id;
                        currentKeys.push(key);
                        keysRef.current.id += 1;
                    }
                    return {
                        field: field + "[" + index + "]",
                        key: key,
                    };
                }), {
                    add: add,
                    remove: remove,
                    move: move,
                }));
        })));
};
List.displayName = 'FormList';
exports.default = List;
