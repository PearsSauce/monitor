"use strict";
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
var classNames_1 = __importDefault(require("../_util/classNames"));
var Input_1 = __importDefault(require("../Input"));
var mergedToString_1 = __importDefault(require("../_util/mergedToString"));
function EditContent(props, ref) {
    var prefixCls = props.prefixCls, children = props.children, setEditing = props.setEditing, editableConfig = props.editableConfig, style = props.style;
    var className = (0, classNames_1.default)(prefixCls + "-typography", prefixCls + "-edit-content", props.className);
    var str = (0, mergedToString_1.default)(children);
    var input = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        input.current && input.current.focus && input.current.focus();
        if (input.current && input.current.dom) {
            var length_1 = input.current.dom.value.length;
            input.current.dom.setSelectionRange(length_1, length_1);
        }
    }, []);
    function onEnd() {
        setEditing(false);
        editableConfig.onEnd && editableConfig.onEnd(str);
    }
    function onChange(value) {
        editableConfig.onChange && editableConfig.onChange(value);
    }
    function onBlur() {
        onEnd();
    }
    return (react_1.default.createElement("div", { className: className, style: style, ref: ref },
        react_1.default.createElement(Input_1.default.TextArea, { className: prefixCls + "-edit-content-textarea", onBlur: onBlur, ref: input, value: str, autoSize: true, onChange: onChange, onPressEnter: onEnd })));
}
exports.default = (0, react_1.forwardRef)(EditContent);
