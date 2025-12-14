"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// TS泛型默认值需要，忽略显式`any`定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitStatus = exports.VALIDATE_STATUS = void 0;
exports.VALIDATE_STATUS = {
    error: 'error',
    success: 'success',
    warning: 'warning',
    validating: 'validating',
};
var SubmitStatus;
(function (SubmitStatus) {
    SubmitStatus["init"] = "init";
    SubmitStatus["error"] = "error";
    SubmitStatus["success"] = "success";
    SubmitStatus["submitting"] = "submitting";
})(SubmitStatus = exports.SubmitStatus || (exports.SubmitStatus = {}));
