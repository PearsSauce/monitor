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
var IconFile_1 = __importDefault(require("../../../icon/react-icon-cjs/IconFile"));
var IconFilePdf_1 = __importDefault(require("../../../icon/react-icon-cjs/IconFilePdf"));
var IconFileImage_1 = __importDefault(require("../../../icon/react-icon-cjs/IconFileImage"));
var IconFileVideo_1 = __importDefault(require("../../../icon/react-icon-cjs/IconFileVideo"));
var IconFileAudio_1 = __importDefault(require("../../../icon/react-icon-cjs/IconFileAudio"));
var Tooltip_1 = __importDefault(require("../../Tooltip"));
var interface_1 = require("../interface");
var is_1 = require("../../_util/is");
var uploadProgress_1 = __importDefault(require("./uploadProgress"));
var IconExclamationCircleFill_1 = __importDefault(require("../../../icon/react-icon-cjs/IconExclamationCircleFill"));
var IconDelete_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDelete"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var useKeyboardEvent_1 = __importDefault(require("../../_util/hooks/useKeyboardEvent"));
var getIconType = function (file) {
    var type = '';
    if (file.originFile && file.originFile.type) {
        // 上传文件
        type = file.originFile.type;
    }
    else {
        var name_1 = file.name || '';
        var fileExtension = name_1.split('.').pop() || '';
        type = fileExtension;
        if (['png', 'jpg', 'jpeg', 'bmp', 'gif'].indexOf(fileExtension) > -1) {
            type = 'image';
        }
        else if (['mp4', 'm2v', 'mkv'].indexOf(fileExtension) > -1) {
            type = 'video';
        }
        else if (['mp3', 'wav', 'wmv'].indexOf(fileExtension) > -1) {
            type = 'audio';
        }
    }
    if (type.indexOf('image') > -1) {
        return IconFileImage_1.default;
    }
    if (type.indexOf('pdf') > -1) {
        return IconFilePdf_1.default;
    }
    if (type.indexOf('audio') > -1) {
        return IconFileAudio_1.default;
    }
    if (type.indexOf('video') > -1) {
        return IconFileVideo_1.default;
    }
    return IconFile_1.default;
};
var TextItem = function (props, ref) {
    var prefixCls = props.prefixCls, disabled = props.disabled, file = props.file, locale = props.locale;
    var cls = prefixCls + "-list-item-text";
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var Icon = getIconType(file);
    var showUploadList = (0, is_1.isObject)(props.showUploadList)
        ? props.showUploadList
        : {};
    // custom icons
    var actionIcons = (0, is_1.isObject)(showUploadList) ? showUploadList : {};
    var fileName = file.name || (file.originFile && file.originFile.name);
    var url = file.url !== undefined
        ? file.url
        : file.originFile && (0, is_1.isFunction)(URL.createObjectURL) && URL.createObjectURL(file.originFile);
    var triggerProps = {};
    // 重新上传后，如果成功，但是鼠标仍然hover在内容区，错误提示不会消失。所以需要设置 popupVisible 为false，来隐藏tooltip
    if (file.status !== interface_1.STATUS.fail) {
        triggerProps = {
            popupVisible: false,
        };
    }
    return (react_1.default.createElement("div", { className: prefixCls + "-list-item " + prefixCls + "-list-item-" + file.status, ref: ref },
        react_1.default.createElement("div", { className: cls },
            props.listType === 'picture-list' && (react_1.default.createElement("div", { className: cls + "-thumbnail" }, (0, is_1.isFunction)(showUploadList.imageRender) ? (showUploadList.imageRender(file)) : (react_1.default.createElement("img", { src: url })))),
            react_1.default.createElement("div", { className: cls + "-content" },
                react_1.default.createElement("div", { className: cls + "-name" },
                    props.listType === 'text' && actionIcons.fileIcon !== null && (react_1.default.createElement("span", { className: prefixCls + "-list-file-icon" }, actionIcons.fileIcon || react_1.default.createElement(Icon, null))),
                    (0, is_1.isFunction)(showUploadList.fileName) ? (react_1.default.createElement("span", { className: cls + "-name-text" }, showUploadList.fileName(file))) : file.url ? (react_1.default.createElement("a", { href: file.url, target: "_blank", rel: "noreferrer", className: cls + "-name-link" }, fileName)) : (react_1.default.createElement("span", { className: cls + "-name-text" }, fileName)),
                    file.status === interface_1.STATUS.fail && actionIcons.errorIcon !== null && (react_1.default.createElement(Tooltip_1.default, __assign({ content: (typeof file.response === 'object'
                            ? (0, react_1.isValidElement)(file.response) && file.response
                            : file.response) || locale.Upload.error }, triggerProps, { disabled: file.status !== interface_1.STATUS.fail }),
                        react_1.default.createElement("span", { className: props.prefixCls + "-list-error-icon" }, actionIcons.errorIcon ||
                            (props.listType === 'picture-card' ? (react_1.default.createElement(IconFileImage_1.default, null)) : (react_1.default.createElement(IconExclamationCircleFill_1.default, null))))))),
                react_1.default.createElement(uploadProgress_1.default, __assign({ file: file, prefixCls: prefixCls, progressProps: props.progressProps, onReupload: props.onReupload, onUpload: props.onUpload, onAbort: props.onAbort }, actionIcons)))),
        react_1.default.createElement("div", { className: prefixCls + "-list-item-operation" }, !disabled && actionIcons.removeIcon !== null && (react_1.default.createElement(icon_hover_1.default, __assign({ className: prefixCls + "-list-remove-icon-hover", onClick: function () {
                props.onRemove && props.onRemove(file);
            }, tabIndex: 0, "aria-label": locale.Upload.delete }, getKeyboardEvents({
            onPressEnter: function () {
                props.onRemove && props.onRemove(file);
            },
        })),
            react_1.default.createElement("span", { className: prefixCls + "-list-remove-icon" }, actionIcons.removeIcon || react_1.default.createElement(IconDelete_1.default, null)))))));
};
exports.default = (0, react_1.forwardRef)(TextItem);
