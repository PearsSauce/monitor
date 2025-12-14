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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var interface_1 = require("../interface");
var is_1 = require("../../_util/is");
var uploadProgress_1 = __importDefault(require("./uploadProgress"));
var IconImageClose_1 = __importDefault(require("../../../icon/react-icon-cjs/IconImageClose"));
var IconEye_1 = __importDefault(require("../../../icon/react-icon-cjs/IconEye"));
var IconDelete_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDelete"));
var IconUpload_1 = __importDefault(require("../../../icon/react-icon-cjs/IconUpload"));
var useKeyboardEvent_1 = __importDefault(require("../../_util/hooks/useKeyboardEvent"));
var PictureItem = function (props, ref) {
    var disabled = props.disabled, prefixCls = props.prefixCls, file = props.file, showUploadList = props.showUploadList, locale = props.locale;
    var keyboardEvents = (0, useKeyboardEvent_1.default)();
    var cls = prefixCls + "-list-item-picture";
    var status = file.status, originFile = file.originFile;
    var url = file.url !== undefined
        ? file.url
        : originFile && (0, is_1.isFunction)(URL.createObjectURL) && URL.createObjectURL(originFile);
    var actionIcons = (0, is_1.isObject)(showUploadList) ? showUploadList : {};
    return (react_1.default.createElement("div", { className: cls, ref: ref }, status === interface_1.STATUS.uploading ? (react_1.default.createElement(uploadProgress_1.default, __assign({ onReupload: props.onReupload, onUpload: props.onUpload, onAbort: props.onAbort, listType: "picture-card", file: file, prefixCls: prefixCls, progressProps: props.progressProps }, actionIcons))) : (react_1.default.createElement(react_1.default.Fragment, null,
        (0, is_1.isFunction)(actionIcons.imageRender) ? (actionIcons.imageRender(file)) : (react_1.default.createElement("img", { src: url, alt: file.name })),
        react_1.default.createElement("div", { className: cls + "-mask", role: "radiogroup" },
            file.status === interface_1.STATUS.fail && (react_1.default.createElement("div", { className: cls + "-error-tip" }, actionIcons.errorIcon !== null && (react_1.default.createElement("span", { className: prefixCls + "-list-error-icon" }, actionIcons.errorIcon || react_1.default.createElement(IconImageClose_1.default, null))))),
            react_1.default.createElement("div", { className: cls + "-operation" },
                file.status !== interface_1.STATUS.fail && actionIcons.previewIcon !== null && (react_1.default.createElement("span", __assign({ className: prefixCls + "-list-preview-icon", tabIndex: 0, role: "button", "aria-label": locale.Upload.preview }, keyboardEvents({
                    onPressEnter: function () {
                        props.onPreview && props.onPreview(file);
                    },
                }), { onClick: function () {
                        props.onPreview && props.onPreview(file);
                    } }), actionIcons.previewIcon || react_1.default.createElement(IconEye_1.default, null))),
                file.status === interface_1.STATUS.fail && actionIcons.reuploadIcon !== null && (react_1.default.createElement("span", __assign({ className: props.prefixCls + "-list-reupload-icon", onClick: function () {
                        props.onReupload && props.onReupload(file);
                    }, tabIndex: 0, role: "button", "aria-label": locale.Upload.reupload }, keyboardEvents({
                    onPressEnter: function () {
                        props.onReupload && props.onReupload(file);
                    },
                })), actionIcons.reuploadIcon || react_1.default.createElement(IconUpload_1.default, null))),
                !disabled && actionIcons.removeIcon !== null && (react_1.default.createElement("span", __assign({ className: prefixCls + "-list-remove-icon", onClick: function () {
                        props.onRemove && props.onRemove(file);
                    }, role: "button", "aria-label": locale.Upload.delete, tabIndex: 0 }, keyboardEvents({
                    onPressEnter: function () {
                        props.onRemove && props.onRemove(file);
                    },
                })), actionIcons.removeIcon || react_1.default.createElement(IconDelete_1.default, null)))))))));
};
exports.default = (0, react_1.forwardRef)(PictureItem);
