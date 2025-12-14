"use strict";
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
var react_1 = require("react");
var get_1 = __importDefault(require("lodash/get"));
var is_1 = require("../../_util/is");
var context_1 = require("../context");
var warning_1 = __importDefault(require("../../_util/warning"));
var useWatch = function (field, form) {
    var formCtx = (0, react_1.useContext)(context_1.FormContext);
    var formInstance = form || formCtx.store;
    var _a = __read((0, react_1.useState)(function () {
        var fieldValues = formInstance === null || formInstance === void 0 ? void 0 : formInstance.getFieldsValue([].concat(field));
        if ((0, is_1.isString)(field)) {
            return (0, get_1.default)(fieldValues, field);
        }
        return fieldValues;
    }), 2), value = _a[0], setValue = _a[1];
    //  if field change, get the real value from fieldRef.current
    var fieldRef = (0, react_1.useRef)(field);
    fieldRef.current = field;
    var valueRef = (0, react_1.useRef)(JSON.stringify(value));
    (0, react_1.useEffect)(function () {
        if (!formInstance) {
            (0, warning_1.default)(true, 'formInstance is not available');
            return;
        }
        var registerWatcher = (formInstance === null || formInstance === void 0 ? void 0 : formInstance.getInnerMethods(true)).registerWatcher;
        var updateValue = function () {
            var field = fieldRef.current;
            var formValues = formInstance.getFieldsValue([].concat(field));
            var newValue = formValues;
            if (!(0, is_1.isArray)(field)) {
                newValue = (0, get_1.default)(formValues, field);
            }
            var newValueString = JSON.stringify(newValue);
            if (valueRef.current !== newValueString) {
                setValue(newValue);
                valueRef.current = newValueString;
            }
        };
        updateValue();
        var cancelWatch = registerWatcher && registerWatcher(updateValue);
        return function () {
            cancelWatch === null || cancelWatch === void 0 ? void 0 : cancelWatch();
        };
    }, []);
    return value;
};
exports.default = useWatch;
