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
var classNames_1 = __importDefault(require("../_util/classNames"));
var Button_1 = __importDefault(require("../Button"));
var IconUpload_1 = __importDefault(require("../../icon/react-icon-cjs/IconUpload"));
var IconPlus_1 = __importDefault(require("../../icon/react-icon-cjs/IconPlus"));
var ConfigProvider_1 = require("../ConfigProvider");
var util_1 = require("./util");
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var TriggerNode = function (props, ref) {
    var _a, _b;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var locale = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).locale;
    var _c = __read((0, react_1.useState)(false), 2), isDragging = _c[0], setIsDragging = _c[1];
    var _d = __read((0, react_1.useState)(0), 2), dragEnterCount = _d[0], setDragEnterCount = _d[1]; // the number of times ondragenter was triggered
    var tip = props.tip, children = props.children, disabled = props.disabled, drag = props.drag, listType = props.listType, prefixCls = props.prefixCls, accept = props.accept, multiple = props.multiple;
    var nodeProps = {
        disabled: disabled,
    };
    (0, react_1.useEffect)(function () {
        setDragEnterCount(0);
    }, [isDragging]);
    return children === null ? null : (react_1.default.createElement("div", __assign({ className: prefixCls + "-trigger", onClick: disabled ? undefined : props.onClick }, getKeyboardEvents({
        onPressEnter: function () {
            var _a;
            !disabled && ((_a = props.onClick) === null || _a === void 0 ? void 0 : _a.call(props));
        },
    }), { ref: ref, onDragEnter: function () {
            setDragEnterCount(dragEnterCount + 1);
        }, onDragLeave: function (e) {
            var _a;
            e.preventDefault();
            /**  When dragging into a child element, it will trigger the dragleave and dragenter of the parent node.
             * Record the number of triggers of dragenter, and subtract 1 each time dragleave.
             * When dragEnterCount is equal to 0,  it means that the mouse has left the current node, then the drag state is cancelled.
             * https://github.com/arco-design/arco-design/issues/210
             */
            if (dragEnterCount === 0) {
                setIsDragging(false);
                !disabled && ((_a = props.onDragLeave) === null || _a === void 0 ? void 0 : _a.call(props, e));
            }
            else {
                setDragEnterCount(dragEnterCount - 1);
            }
        }, onDrop: function (e) {
            e.preventDefault();
            if (!disabled && props.drag !== false) {
                setIsDragging(false);
                if (props.directory) {
                    (0, util_1.loopDirectory)(e.dataTransfer.items, accept, function (files) {
                        props.onDragFiles && props.onDragFiles(files);
                    });
                }
                else {
                    var directoryIndices_1 = [].slice
                        .call(e.dataTransfer.items || [])
                        .reduce(function (result, item, index) {
                        if (item.webkitGetAsEntry) {
                            var entry = item.webkitGetAsEntry();
                            // https://github.com/arco-design/arco-design/issues/2643
                            if (entry === null || entry === void 0 ? void 0 : entry.isDirectory) {
                                return __spreadArray(__spreadArray([], __read(result), false), [index], false);
                            }
                            return result;
                        }
                    }, []);
                    // Filter out directories
                    var droppedFiles = [].slice.call(e.dataTransfer.files || []).filter(function (_, index) {
                        return !directoryIndices_1.includes(index);
                    });
                    var files = (0, util_1.getFiles)(droppedFiles, accept);
                    if (files.length > 0) {
                        props.onDragFiles && props.onDragFiles(multiple ? files : files.slice(0, 1));
                    }
                }
                props.onDrop && props.onDrop(e);
            }
        }, onDragOver: function (e) {
            var _a;
            e.preventDefault();
            if (!disabled && !isDragging) {
                setIsDragging(true);
                (_a = props.onDragOver) === null || _a === void 0 ? void 0 : _a.call(props, e);
            }
        } }), react_1.default.isValidElement(children) ? (react_1.default.createElement("div", { className: (0, classNames_1.default)((_a = {}, _a[prefixCls + "-trigger-custom-active"] = isDragging, _a)) }, react_1.default.cloneElement(children, nodeProps))) : listType === 'picture-card' ? (react_1.default.createElement("div", { className: prefixCls + "-trigger-picture-wrapper" },
        react_1.default.createElement("div", { className: prefixCls + "-trigger-picture", tabIndex: 0, "aria-label": locale.Upload.upload },
            react_1.default.createElement("div", { className: prefixCls + "-trigger-picture-text" },
                react_1.default.createElement(IconPlus_1.default, null))))) : drag ? (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-trigger-drag", (_b = {},
            _b[prefixCls + "-trigger-drag-active"] = isDragging,
            _b)), tabIndex: 0, "aria-label": locale.Upload.drag },
        react_1.default.createElement(IconPlus_1.default, null),
        react_1.default.createElement("p", { className: prefixCls + "-trigger-drag-text" }, isDragging ? locale.Upload.dragHover : locale.Upload.drag),
        tip && react_1.default.createElement("div", { className: prefixCls + "-trigger-tip" }, tip))) : (react_1.default.createElement(Button_1.default, __assign({}, nodeProps, { "aria-label": locale.Upload.upload, type: "primary", className: prefixCls + "-trigger-with-icon" }),
        react_1.default.createElement(IconUpload_1.default, null),
        locale.Upload.upload))));
};
exports.default = (0, react_1.forwardRef)(TriggerNode);
