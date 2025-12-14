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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.FileList = void 0;
var react_1 = __importStar(require("react"));
var react_transition_group_1 = require("react-transition-group");
var classNames_1 = __importDefault(require("../../_util/classNames"));
var pictureItem_1 = __importDefault(require("./pictureItem"));
var textItem_1 = __importDefault(require("./textItem"));
var ConfigProvider_1 = require("../../ConfigProvider");
var interface_1 = require("../interface");
var is_1 = require("../../_util/is");
var image_preview_group_1 = __importDefault(require("../../Image/image-preview-group"));
var CSSTransition_1 = __importDefault(require("../../_util/CSSTransition"));
var FileList = function (props) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), locale = _b.locale, rtl = _b.rtl;
    var listType = props.listType, fileList = props.fileList, renderUploadList = props.renderUploadList, renderUploadItem = props.renderUploadItem, prefixCls = props.prefixCls, rest = __rest(props, ["listType", "fileList", "renderUploadList", "renderUploadItem", "prefixCls"]);
    // hide image preview when previewCurrent = -1
    var _c = __read((0, react_1.useState)(-1), 2), previewCurrent = _c[0], setPreviewCurrent = _c[1];
    var srcList = (0, react_1.useMemo)(function () {
        return fileList
            .map(function (file) {
            var url = file.url;
            if (file.url === undefined && [interface_1.STATUS.init, interface_1.STATUS.success].indexOf(file.status) > -1) {
                url =
                    file.originFile &&
                        (0, is_1.isFunction)(URL.createObjectURL) &&
                        URL.createObjectURL(file.originFile);
            }
            return url;
        })
            .filter(Boolean);
    }, [fileList]);
    if ((0, is_1.isFunction)(renderUploadList)) {
        return react_1.default.createElement("div", { className: prefixCls + "-list" }, renderUploadList(fileList, rest));
    }
    var updatePreviewCurrent = function (current) {
        if (props.imagePreview) {
            setPreviewCurrent(current);
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_transition_group_1.TransitionGroup, { className: (0, classNames_1.default)(prefixCls + "-list", prefixCls + "-list-type-" + listType, (_a = {},
                _a[prefixCls + "-list-rtl"] = rtl,
                _a)) }, fileList.map(function (file, index) {
            var originNode = listType === 'picture-card' ? (react_1.default.createElement("div", { className: prefixCls + "-list-item " + prefixCls + "-list-item-" + file.status },
                react_1.default.createElement(pictureItem_1.default, __assign({}, props, { onPreview: function (file) {
                        var _a;
                        updatePreviewCurrent(index);
                        (_a = props.onPreview) === null || _a === void 0 ? void 0 : _a.call(props, file);
                    }, file: file, locale: locale })))) : (react_1.default.createElement(textItem_1.default, __assign({}, props, { file: file, locale: locale })));
            if ((0, is_1.isFunction)(renderUploadItem)) {
                originNode = renderUploadItem(originNode, file, fileList);
            }
            return listType === 'picture-card' ? (react_1.default.createElement(CSSTransition_1.default, { key: file.uid, timeout: { enter: 200, exit: 400 }, classNames: prefixCls + "-slide-inline", onEntered: function (e) {
                    if (!e)
                        return;
                    e.style.width = '';
                }, onExit: function (e) {
                    if (!e)
                        return;
                    e.style.width = e.scrollWidth + "px";
                }, onExiting: function (e) {
                    if (!e)
                        return;
                    e.style.width = 0;
                }, onExited: function (e) {
                    if (!e)
                        return;
                    e.style.width = 0;
                } }, originNode)) : (react_1.default.createElement(CSSTransition_1.default, { key: file.uid, timeout: { enter: 200, exit: 400 }, classNames: prefixCls + "-slide-up", onExit: function (e) {
                    if (!e)
                        return;
                    e.style.height = e.scrollHeight + "px";
                }, onExiting: function (e) {
                    if (!e)
                        return;
                    e.style.height = 0;
                }, onExited: function (e) {
                    if (!e)
                        return;
                    e.style.height = 0;
                } }, originNode));
        })),
        listType === 'picture-card' && props.imagePreview && (react_1.default.createElement(image_preview_group_1.default, { srcList: srcList, visible: previewCurrent !== -1, current: previewCurrent, onChange: updatePreviewCurrent, onVisibleChange: function (visible) {
                updatePreviewCurrent(visible ? previewCurrent : -1);
            } }))));
};
exports.FileList = FileList;
exports.FileList.displayName = 'FileList';
exports.default = exports.FileList;
