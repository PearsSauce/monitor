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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var Input_1 = __importDefault(require("../Input"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var select_1 = __importDefault(require("../Select/select"));
var utils_1 = require("../Select/utils");
var keycode_1 = require("../_util/keycode");
var omit_1 = __importDefault(require("../_util/omit"));
var pick_1 = require("../_util/pick");
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var IMPOSSIBLE_VALUE = "Autocomplete_" + Math.random();
var Option = select_1.default.Option;
var defaultProps = {
    defaultActiveFirstOption: true,
    triggerElement: react_1.default.createElement(Input_1.default, null),
};
function AutoComplete(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.AutoComplete);
    var style = props.style, className = props.className, children = props.children, data = props.data, defaultValue = props.defaultValue, propValue = props.value, placeholder = props.placeholder, error = props.error, disabled = props.disabled, strict = props.strict, allowClear = props.allowClear, loading = props.loading, defaultActiveFirstOption = props.defaultActiveFirstOption, triggerElement = props.triggerElement, getPopupContainer = props.getPopupContainer, dropdownRender = props.dropdownRender, virtualListProps = props.virtualListProps, onFocus = props.onFocus, onBlur = props.onBlur, onChange = props.onChange, onSearch = props.onSearch, onSelect = props.onSelect, onPressEnter = props.onPressEnter, inputProps = props.inputProps;
    var _c = __read((0, useMergeValue_1.default)('', {
        defaultValue: defaultValue,
        value: propValue,
    }), 2), value = _c[0], setValue = _c[1];
    var _d = __read((0, react_1.useState)(false), 2), isFocused = _d[0], setIsFocused = _d[1];
    var refInput = (0, react_1.useRef)(null);
    var refSelect = (0, react_1.useRef)(null);
    var prefixCls = getPrefixCls('autocomplete');
    var filterOption = 'filterOption' in props
        ? props.filterOption
        : function (inputValue, option) {
            if (strict) {
                return option.props.value.indexOf(inputValue) > -1;
            }
            return option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
        };
    var childNodes = react_1.default.Children.toArray(children);
    var selectChildren = null;
    if (childNodes.length && ((0, utils_1.isSelectOption)(childNodes[0]) || (0, utils_1.isSelectOptGroup)(childNodes[0]))) {
        selectChildren = children;
    }
    else if (data && data.length) {
        selectChildren = data.map(function (item, index) {
            if ((0, react_1.isValidElement)(item)) {
                return item;
            }
            if (typeof item === 'string') {
                return (react_1.default.createElement(Option, { key: index, value: item }, item));
            }
            if (typeof item === 'object') {
                var _a = item, value_1 = _a.value, name_1 = _a.name;
                return (react_1.default.createElement(Option, { key: index, value: value_1, extra: (0, omit_1.default)(item, ['value', 'name']) }, name_1));
            }
            return null;
        });
    }
    (0, react_1.useImperativeHandle)(ref, function () { return refInput.current; });
    var usedTriggerElement = typeof triggerElement === 'function' ? triggerElement({ value: value }) : triggerElement;
    var TriggerElement = react_1.default.cloneElement(usedTriggerElement, __assign(__assign(__assign({ ref: function (node) {
            refInput.current = node;
            var originRef = usedTriggerElement.ref;
            if (typeof originRef === 'function') {
                originRef(node);
            }
        }, className: (0, classNames_1.default)("" + prefixCls, inputProps && inputProps.className, className), style: style, value: value, placeholder: placeholder, error: error, status: props.status, disabled: disabled, allowClear: allowClear }, inputProps), (0, pick_1.pickDataAttributes)(props)), { 
        // Empty tag to ensure the consistency of the dom structure of input, such that input won't accidentally lose focus due to structure change on input.
        suffix: loading ? (react_1.default.createElement(IconLoading_1.default, null)) : ((_a = usedTriggerElement === null || usedTriggerElement === void 0 ? void 0 : usedTriggerElement.type) === null || _a === void 0 ? void 0 : _a.displayName) ===
            'Search' ? undefined : ((inputProps === null || inputProps === void 0 ? void 0 : inputProps.suffix) || react_1.default.createElement("i", null)), onFocus: function (event) {
            var _a;
            setIsFocused(true);
            onFocus === null || onFocus === void 0 ? void 0 : onFocus(event);
            (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onFocus) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
        }, onBlur: function (event) {
            var _a;
            setIsFocused(false);
            onBlur === null || onBlur === void 0 ? void 0 : onBlur(event);
            (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onBlur) === null || _a === void 0 ? void 0 : _a.call(inputProps, event);
        }, onKeyDown: function (event) {
            var _a, _b, _c, _d, _e;
            var keyCode = event.keyCode || event.which;
            (_b = (_a = refSelect.current) === null || _a === void 0 ? void 0 : _a.hotkeyHandler) === null || _b === void 0 ? void 0 : _b.call(_a, event);
            if (keyCode === keycode_1.Enter.code && onPressEnter) {
                var activeOption = void 0;
                if (refSelect.current) {
                    activeOption = refSelect.current.getOptionInfoByValue(refSelect.current.activeOptionValue);
                }
                onPressEnter(event, activeOption);
            }
            if (keyCode === keycode_1.Esc.code) {
                (_d = (_c = refInput.current) === null || _c === void 0 ? void 0 : _c.blur) === null || _d === void 0 ? void 0 : _d.call(_c);
            }
            (_e = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onKeyDown) === null || _e === void 0 ? void 0 : _e.call(inputProps, event);
        }, onChange: function (value, event) {
            var _a;
            setValue(value);
            onSearch === null || onSearch === void 0 ? void 0 : onSearch(value);
            onChange === null || onChange === void 0 ? void 0 : onChange(value);
            (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onChange) === null || _a === void 0 ? void 0 : _a.call(inputProps, value, event);
        } }));
    var triggerProps = __assign(__assign({ popupVisible: !!(isFocused && ((data === null || data === void 0 ? void 0 : data.length) || react_1.default.Children.count(children))) }, props.triggerProps), { 
        // Other trigger types are not supported yet
        trigger: 'focus', className: [prefixCls + "-popup"].concat(props.triggerProps && props.triggerProps.className) });
    var selectProps = {
        triggerElement: TriggerElement,
        // Guarantee that onChange can always be triggered
        value: IMPOSSIBLE_VALUE,
        inputValue: value,
        defaultActiveFirstOption: defaultActiveFirstOption,
        triggerProps: triggerProps,
        getPopupContainer: getPopupContainer,
        dropdownRender: dropdownRender,
        filterOption: filterOption,
        virtualListProps: virtualListProps,
        notFoundContent: null,
        onChange: function (value, option) {
            var _a, _b;
            setValue(value);
            onChange === null || onChange === void 0 ? void 0 : onChange(value, option);
            value && (onSelect === null || onSelect === void 0 ? void 0 : onSelect(value, option));
            // Blur the input on option change
            (_b = (_a = refInput.current) === null || _a === void 0 ? void 0 : _a.blur) === null || _b === void 0 ? void 0 : _b.call(_a);
        },
    };
    return (react_1.default.createElement(select_1.default, __assign({ ref: refSelect }, selectProps), selectChildren));
}
var ForwardRefAutoComplete = react_1.default.forwardRef(AutoComplete);
var AutoCompleteComponent = ForwardRefAutoComplete;
AutoCompleteComponent.displayName = 'AutoComplete';
AutoCompleteComponent.Option = select_1.default.Option;
AutoCompleteComponent.OptGroup = select_1.default.OptGroup;
exports.default = AutoCompleteComponent;
