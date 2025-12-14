"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var interface_1 = require("../interface");
var context_1 = require("../context");
var warning_1 = __importDefault(require("../../_util/warning"));
var useForceUpdate_1 = __importDefault(require("../../_util/hooks/useForceUpdate"));
/**
 * useFormContext 只会返回一些 Form 全局的状态，避免返回某个表单项的状态
 */
var useFormContext = function () {
    var formCtx = (0, react_1.useContext)(context_1.FormContext);
    var formInstance = formCtx.store;
    var isSubmittingRef = (0, react_1.useRef)(false);
    var forceUpdate = (0, useForceUpdate_1.default)();
    var setSubmitting = (0, react_1.useCallback)(function () {
        var _a, _b;
        var submitStatus = (((_b = (_a = formInstance === null || formInstance === void 0 ? void 0 : formInstance.getInnerMethods(true)) === null || _a === void 0 ? void 0 : _a.innerGetStoreStatus) === null || _b === void 0 ? void 0 : _b.call(_a)) || {}).submitStatus;
        var newIsSubmitting = submitStatus === interface_1.SubmitStatus.submitting;
        if (newIsSubmitting !== isSubmittingRef.current) {
            isSubmittingRef.current = newIsSubmitting;
            forceUpdate();
        }
    }, []);
    (0, react_1.useEffect)(function () {
        if (!formInstance) {
            (0, warning_1.default)(true, 'formInstance is not available');
            return;
        }
        var registerFormWatcher = (formInstance === null || formInstance === void 0 ? void 0 : formInstance.getInnerMethods(true)).registerFormWatcher;
        var update = function () { return setSubmitting(); };
        update();
        var cancelWatch = registerFormWatcher && registerFormWatcher(update);
        return function () {
            cancelWatch === null || cancelWatch === void 0 ? void 0 : cancelWatch();
        };
    }, []);
    return {
        form: formInstance,
        disabled: formCtx.disabled,
        isSubmitting: isSubmittingRef.current,
    };
};
exports.default = useFormContext;
