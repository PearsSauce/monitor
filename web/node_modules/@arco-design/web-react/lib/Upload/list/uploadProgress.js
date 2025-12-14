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
var Progress_1 = __importDefault(require("../../Progress"));
var ConfigProvider_1 = require("../../ConfigProvider");
var IconCheck_1 = __importDefault(require("../../../icon/react-icon-cjs/IconCheck"));
var IconUpload_1 = __importDefault(require("../../../icon/react-icon-cjs/IconUpload"));
var IconPlayArrowFill_1 = __importDefault(require("../../../icon/react-icon-cjs/IconPlayArrowFill"));
var IconPause_1 = __importDefault(require("../../../icon/react-icon-cjs/IconPause"));
var Tooltip_1 = __importDefault(require("../../Tooltip"));
var is_1 = require("../../_util/is");
var useKeyboardEvent_1 = __importDefault(require("../../_util/hooks/useKeyboardEvent"));
var UploadProgress = function (props) {
    var keyboardEvents = (0, useKeyboardEvent_1.default)();
    var file = props.file, prefixCls = props.prefixCls, progressProps = props.progressProps, progressRender = props.progressRender;
    var locale = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).locale;
    var status = file.status, _a = file.percent, percent = _a === void 0 ? 0 : _a;
    var cls = prefixCls + "-list";
    var widthStyle = progressProps && progressProps.width ? { width: progressProps.width } : {};
    var dom = (react_1.default.createElement(react_1.default.Fragment, null,
        status === interface_1.STATUS.fail && props.reuploadIcon !== null && (react_1.default.createElement("span", __assign({ className: prefixCls + "-list-reupload-icon", onClick: function () {
                props.onReupload && props.onReupload(file);
            }, tabIndex: 0, role: "button", "aria-label": locale.Upload.reupload }, keyboardEvents({
            onPressEnter: function () {
                props.onReupload && props.onReupload(file);
            },
        })), props.reuploadIcon ||
            (props.listType === 'picture-card' ? react_1.default.createElement(IconUpload_1.default, null) : locale.Upload.reupload))),
        status === interface_1.STATUS.success && props.successIcon !== null && (react_1.default.createElement("span", { className: prefixCls + "-list-success-icon" }, props.successIcon || react_1.default.createElement(IconCheck_1.default, null))),
        status !== interface_1.STATUS.success && (react_1.default.createElement("div", { className: cls + "-status", style: widthStyle },
            react_1.default.createElement(Progress_1.default, __assign({ showText: false, className: cls + "-progress", type: "circle", status: status === interface_1.STATUS.fail ? 'error' : status === interface_1.STATUS.success ? 'success' : 'normal', percent: percent, size: "mini" }, progressProps)),
            status === interface_1.STATUS.init && props.startIcon !== null && (react_1.default.createElement("span", __assign({ tabIndex: 0, role: "button", "aria-label": locale.Upload.start, className: prefixCls + "-list-start-icon", onClick: function () {
                    props.onUpload && props.onUpload(file);
                } }, keyboardEvents({
                onPressEnter: function () {
                    props.onUpload && props.onUpload(file);
                },
            })), props.startIcon || (react_1.default.createElement(Tooltip_1.default, { content: locale.Upload.start },
                react_1.default.createElement(IconPlayArrowFill_1.default, null))))),
            status === interface_1.STATUS.uploading && props.cancelIcon !== null && (react_1.default.createElement("span", __assign({ className: props.prefixCls + "-list-cancel-icon", onClick: function () {
                    props.onAbort && props.onAbort(file);
                }, tabIndex: 0, "aria-label": locale.Upload.cancel }, keyboardEvents({
                onPressEnter: function () {
                    props.onAbort && props.onAbort(file);
                },
            })), props.cancelIcon || (react_1.default.createElement(Tooltip_1.default, { content: locale.Upload.cancel },
                react_1.default.createElement(IconPause_1.default, null)))))))));
    return (0, is_1.isFunction)(progressRender) ? progressRender(file, dom) : dom;
};
exports.default = UploadProgress;
