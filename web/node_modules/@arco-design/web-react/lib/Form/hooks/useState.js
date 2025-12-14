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
var isEqualWith_1 = __importDefault(require("lodash/isEqualWith"));
var react_1 = require("react");
var context_1 = require("../context");
var warning_1 = __importDefault(require("../../_util/warning"));
// 获取指定 field 的内部状态，参数必填！！
var useFormState = function (field, form) {
    var formCtx = (0, react_1.useContext)(context_1.FormContext);
    var formInstance = form || formCtx.store;
    //  if field change, get the real value from fieldRef.current
    var fieldRef = (0, react_1.useRef)(field);
    fieldRef.current = field;
    var getFieldStateFromStore = (0, react_1.useCallback)(function () {
        var field = fieldRef.current;
        var formState = formInstance.getFieldsState([field]);
        return formState === null || formState === void 0 ? void 0 : formState[field];
    }, []);
    var _a = __read((0, react_1.useState)(getFieldStateFromStore), 2), formState = _a[0], setFormState = _a[1];
    var formStateRef = (0, react_1.useRef)(formState);
    (0, react_1.useEffect)(function () {
        if (!formInstance) {
            (0, warning_1.default)(true, 'formInstance is not available');
            return;
        }
        var registerStateWatcher = (formInstance === null || formInstance === void 0 ? void 0 : formInstance.getInnerMethods(true)).registerStateWatcher;
        var updateState = function () {
            var newValue = getFieldStateFromStore();
            if (!(0, isEqualWith_1.default)(formStateRef.current, newValue)) {
                setFormState(newValue);
                formStateRef.current = newValue;
            }
        };
        updateState();
        var cancelWatch = registerStateWatcher && registerStateWatcher(updateState);
        return function () {
            cancelWatch === null || cancelWatch === void 0 ? void 0 : cancelWatch();
        };
    }, []);
    return formState;
};
exports.default = useFormState;
