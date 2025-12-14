"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var Checkbox_1 = __importDefault(require("../../Checkbox"));
var Option = function (props) {
    var prefixCls = props.prefixCls, multiple = props.multiple, option = props.option, renderOption = props.renderOption, selected = props.selected, icons = props.icons;
    var checkboxDisabled = option.disabled || (multiple && option.disableCheckbox);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        multiple ? (react_1.default.createElement(Checkbox_1.default, { disabled: checkboxDisabled, checked: option._checked, indeterminate: option._halfChecked, onChange: props.onMultipleChecked, value: option.value })) : (''),
        react_1.default.createElement("div", { className: prefixCls + "-list-item-label", onClick: option.disabled ? undefined : props.onClickOption, onMouseEnter: props.onMouseEnter, onDoubleClick: checkboxDisabled ? undefined : props.onDoubleClickOption },
            renderOption ? renderOption() : option.label,
            option.isLeaf ? selected && icons.checked : option.loading ? icons.loading : icons.next)));
};
exports.default = Option;
