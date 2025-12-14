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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var debounce_1 = __importDefault(require("lodash/debounce"));
var useStateValue_1 = __importStar(require("./hook/useStateValue"));
var utils_1 = require("./utils");
var is_1 = require("../_util/is");
var Trigger_1 = __importDefault(require("../Trigger"));
var Tree_1 = __importDefault(require("../Tree"));
var ConfigProvider_1 = require("../ConfigProvider");
var util_1 = require("../Tree/util");
var select_view_1 = __importDefault(require("../_class/select-view"));
var interface_1 = require("./interface");
var useTreeData_1 = __importDefault(require("./hook/useTreeData"));
var useKeyCache_1 = __importDefault(require("./hook/useKeyCache"));
var tree_list_1 = __importDefault(require("./tree-list"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useIsFirstRender_1 = __importDefault(require("../_util/hooks/useIsFirstRender"));
var useId_1 = __importDefault(require("../_util/hooks/useId"));
function isEmptyValue(value) {
    return (!value ||
        ((0, is_1.isArray)(value) && value.length === 0) ||
        ((0, is_1.isObject)(value) && Object.keys(value).length === 0));
}
var defaultProps = {
    bordered: true,
    treeCheckedStrategy: Tree_1.default.SHOW_CHILD,
    fieldNames: interface_1.DefaultFieldNames,
};
var triggerPopupAlign = { bottom: 4 };
var TreeSelect = function (baseProps, ref) {
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _a.getPrefixCls, renderEmpty = _a.renderEmpty, componentConfig = _a.componentConfig, rtl = _a.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.TreeSelect);
    var refIsFirstRender = (0, useIsFirstRender_1.default)();
    var triggerRef = (0, react_1.useRef)();
    var treeRef = (0, react_1.useRef)(null);
    var refSelectView = (0, react_1.useRef)(null);
    var indeterminateKeys = (0, react_1.useRef)([]);
    var _b = __read((0, useTreeData_1.default)(props), 1), treeData = _b[0];
    var key2nodeProps = (0, useKeyCache_1.default)(treeData, props.fieldNames);
    var _c = __read((0, react_1.useState)(), 2), hitKeys = _c[0], setHitKeys = _c[1];
    var _d = __read((0, useMergeValue_1.default)(false, {
        value: props.popupVisible,
    }), 2), popupVisible = _d[0], setPopupVisible = _d[1];
    var _e = __read((0, useMergeValue_1.default)(undefined, // Compatible with previous behavior 'undefined as default'
    {
        value: 'inputValue' in props ? props.inputValue || '' : undefined,
    }), 2), inputValue = _e[0], setInputValue = _e[1];
    // 触发 onInputValueChange 回调的值
    var refOnInputChangeCallbackValue = (0, react_1.useRef)(inputValue);
    // 触发 onInputValueChange 回调的原因
    var refOnInputChangeCallbackReason = (0, react_1.useRef)(null);
    var onInputValueChange = props.onInputValueChange;
    var _f = __read((0, useStateValue_1.default)(props, key2nodeProps, indeterminateKeys), 2), value = _f[0], setValue = _f[1];
    var multiple = props.multiple || props.treeCheckable;
    var prefixCls = getPrefixCls('tree-select');
    var isFilterNode = inputValue && !(0, is_1.isFunction)(props.onSearch);
    // Unique ID of this select instance
    var instancePopupID = (0, useId_1.default)(prefixCls + "-popup-");
    var tryUpdatePopupVisible = function (visible) {
        var _a;
        if (visible !== popupVisible) {
            setPopupVisible(visible);
            (_a = props.onVisibleChange) === null || _a === void 0 ? void 0 : _a.call(props, visible);
        }
    };
    // 尝试更新 inputValue，并触发 onInputValueChange
    var tryUpdateInputValue = function (value, reason) {
        if (value !== refOnInputChangeCallbackValue.current ||
            reason !== refOnInputChangeCallbackReason.current) {
            setInputValue(value);
            refOnInputChangeCallbackValue.current = value;
            refOnInputChangeCallbackReason.current = reason;
            onInputValueChange && onInputValueChange(value, reason);
        }
    };
    var handleSearch = (0, react_1.useCallback)(function (inputText) {
        var search = (0, debounce_1.default)(function (inputText) { return __awaiter(void 0, void 0, void 0, function () {
            var hitKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, is_1.isFunction)(props.onSearch)) return [3 /*break*/, 2];
                        return [4 /*yield*/, props.onSearch(inputText)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!inputText)
                            return [2 /*return*/, treeData];
                        hitKeys = new Set();
                        Object.keys(key2nodeProps).forEach(function (key) {
                            var nodeProps = key2nodeProps[key];
                            var isHit = false;
                            if ((0, is_1.isFunction)(props.filterTreeNode)) {
                                // @ts-ignore
                                if (props.filterTreeNode(inputText, react_1.default.createElement(Tree_1.default.Node, __assign({}, nodeProps)))) {
                                    isHit = true;
                                }
                            }
                            else {
                                var text = nodeProps.value || nodeProps._key;
                                if (text && text.indexOf(inputText) > -1) {
                                    isHit = true;
                                }
                            }
                            if (isHit) {
                                hitKeys.add(nodeProps.key);
                            }
                        });
                        setHitKeys(hitKeys);
                        return [2 /*return*/];
                }
            });
        }); }, 100);
        return search(inputText);
    }, [props.onSearch, treeData, key2nodeProps, props.filterTreeNode]);
    var resetInputValue = (0, react_1.useCallback)(function () {
        // 多选选中值时候不清除搜索文本
        var retainInputValueWhileSelect = true;
        if ((0, is_1.isObject)(props.showSearch)) {
            retainInputValueWhileSelect = props.showSearch.retainInputValueWhileSelect !== false;
        }
        // default scene: inputValue = refOnInputChangeCallbackValue =  undefined
        // if updateTo ''，will trigger an unnecessary onsearch
        if (props.multiple && !retainInputValueWhileSelect && inputValue !== undefined) {
            tryUpdateInputValue('', 'optionChecked');
        }
    }, [inputValue, props.multiple, JSON.stringify(props.showSearch)]);
    var triggerChange = (0, react_1.useCallback)(function (newValue, extra) {
        setValue(newValue, extra);
        resetInputValue();
        if (!multiple) {
            tryUpdatePopupVisible(false);
        }
    }, [setValue, resetInputValue, popupVisible]);
    var handleRemoveCheckedItem = function (item, index, e) {
        e.stopPropagation();
        if (item.disabled) {
            return;
        }
        var itemValue = (0, is_1.isObject)(item.value) ? item.value.value : item.value;
        if (!props.treeCheckable || props.treeCheckStrictly || !key2nodeProps[itemValue]) {
            var newValue = value.filter(function (_, i) { return i !== index; });
            triggerChange(newValue, {
                trigger: key2nodeProps[itemValue] || item,
                checked: false,
                selected: false,
            });
            return;
        }
        var result = (0, util_1.getAllCheckedKeysByCheck)(itemValue, false, (0, utils_1.normalizeValueToArray)(value), key2nodeProps, indeterminateKeys.current);
        indeterminateKeys.current = result.indeterminateKeys;
        triggerChange((0, useStateValue_1.parseValue)(result.checkedKeys, key2nodeProps, value), {
            trigger: key2nodeProps[itemValue],
            checked: false,
            selected: false,
        });
    };
    (0, react_1.useEffect)(function () {
        inputValue !== undefined && handleSearch(inputValue);
        if (inputValue !== refOnInputChangeCallbackValue.current) {
            refOnInputChangeCallbackValue.current = inputValue;
        }
    }, [inputValue]);
    var searchKeys = (0, react_1.useMemo)(function () {
        var newKeys = [];
        if (inputValue) {
            for (var key in key2nodeProps) {
                var item = key2nodeProps[key];
                var pathKeys = __spreadArray(__spreadArray([], __read(item.pathParentKeys), false), [key], false);
                if (pathKeys.some(function (_key) { return hitKeys && hitKeys.has(_key); })) {
                    newKeys = newKeys.concat(pathKeys);
                }
            }
        }
        return Array.from(new Set(newKeys));
    }, [inputValue, key2nodeProps, hitKeys]);
    (0, react_1.useEffect)(function () {
        if (popupVisible) {
            setTimeout(function () {
                var target = value[0];
                if (treeRef.current && target) {
                    treeRef.current.scrollIntoView(target.value);
                }
            });
        }
        else if (!refIsFirstRender) {
            inputValue && tryUpdateInputValue('', 'optionListHide');
        }
    }, [popupVisible]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        focus: function () {
            refSelectView.current && refSelectView.current.focus();
        },
        blur: function () {
            refSelectView.current && refSelectView.current.blur();
        },
        getRootDOMNode: function () {
            var _a, _b;
            return (_b = (_a = refSelectView.current) === null || _a === void 0 ? void 0 : _a.getRootDOMNode) === null || _b === void 0 ? void 0 : _b.call(_a);
        },
    }); });
    var filterNode = (0, react_1.useCallback)(function (node) {
        return isFilterNode ? searchKeys.indexOf(node._key) > -1 : true;
    }, [isFilterNode, searchKeys]);
    var renderText = (0, react_1.useCallback)(function (val) {
        var _a = val || {}, disabled = _a.disabled, value = _a.value;
        var label = val === null || val === void 0 ? void 0 : val.label;
        if ((0, is_1.isFunction)(props.renderFormat)) {
            label = props.renderFormat(key2nodeProps[value] || null, props.labelInValue ? val : value);
        }
        return { text: label || value || '', disabled: disabled };
    }, [props.renderFormat, props.labelInValue, key2nodeProps]);
    var tryUpdateSelectValue = function (value) {
        setValue(value, {});
    };
    var renderView = function (eleView) {
        return (react_1.default.createElement(Trigger_1.default, __assign({ autoAlignPopupWidth: false, autoAlignPopupMinWidth: true, ref: triggerRef, classNames: "slideDynamicOrigin", trigger: "click", position: "bl", getPopupContainer: props.getPopupContainer, popupAlign: triggerPopupAlign, unmountOnExit: props.unmountOnExit }, props.triggerProps, { className: (0, classNames_1.default)(prefixCls + "-trigger", props.triggerProps && props.triggerProps.className), popup: function () {
                var _a;
                var _b, _c, _d;
                var dropdownRender = props.dropdownRender;
                var dom = (isFilterNode && isEmptyValue(searchKeys)) || isEmptyValue(treeData) ? (props.notFoundContent || renderEmpty('TreeSelect')) : (react_1.default.createElement(tree_list_1.default, __assign({ prefixCls: prefixCls, ref: treeRef }, props, { inputValue: inputValue, filterNode: filterNode, value: value, onChange: triggerChange, multiple: multiple, treeData: treeData })));
                return (react_1.default.createElement("div", { id: instancePopupID, className: (0, classNames_1.default)(prefixCls + "-popup", (_a = {}, _a[prefixCls + "-rtl-popup"] = rtl, _a)), style: __assign({ maxHeight: ((_b = props.treeProps) === null || _b === void 0 ? void 0 : _b.height) || ((_d = (_c = props.treeProps) === null || _c === void 0 ? void 0 : _c.virtualListProps) === null || _d === void 0 ? void 0 : _d.height)
                            ? 'unset'
                            : '' }, props.dropdownMenuStyle) }, (0, is_1.isFunction)(dropdownRender) ? dropdownRender(dom) : dom));
            }, disabled: props.disabled, onVisibleChange: function (visible) {
                tryUpdatePopupVisible(visible);
                // props.onVisibleChange && props.onVisibleChange(visible);
            }, popupVisible: popupVisible }), eleView));
    };
    var customTriggerElement = typeof props.triggerElement === 'function'
        ? (function () {
            var _a;
            var valueForCallback;
            if (multiple) {
                valueForCallback = value.map(function (x) {
                    return props.labelInValue ? { label: x.label, value: x.value } : x.value;
                });
            }
            else {
                valueForCallback = props.labelInValue ? value[0] : (_a = value[0]) === null || _a === void 0 ? void 0 : _a.value;
            }
            return props.triggerElement({ value: valueForCallback });
        })()
        : props.triggerElement;
    return !(0, is_1.isNullOrUndefined)(customTriggerElement) ? (renderView(customTriggerElement)) : (react_1.default.createElement(select_view_1.default, __assign({ ref: refSelectView, rtl: rtl, ariaControls: instancePopupID }, props, { popupVisible: popupVisible, value: !multiple && (0, is_1.isArray)(value) ? value[0] : value, inputValue: inputValue, 
        // other
        isEmptyValue: isEmptyValue(value), prefixCls: prefixCls, isMultiple: multiple, renderText: renderText, onSort: tryUpdateSelectValue, onRemoveCheckedItem: handleRemoveCheckedItem, onClear: function (e) {
            var _a;
            e.stopPropagation();
            triggerChange([], {});
            (_a = props.onClear) === null || _a === void 0 ? void 0 : _a.call(props, !!popupVisible);
        }, onKeyDown: function (e) {
            var _a;
            e.stopPropagation();
            (_a = props.onKeyDown) === null || _a === void 0 ? void 0 : _a.call(props, e);
        }, onFocus: function (e) {
            e && e.stopPropagation();
        }, onChangeInputValue: function (value) {
            tryUpdateInputValue(value, 'manual');
        }, renderView: renderView })));
};
var ForwardRefTreeSelect = (0, react_1.forwardRef)(TreeSelect);
var TreeSelectComponent = ForwardRefTreeSelect;
TreeSelectComponent.displayName = 'TreeSelect';
TreeSelectComponent.Node = Tree_1.default.Node;
TreeSelectComponent.SHOW_ALL = Tree_1.default.SHOW_ALL;
TreeSelectComponent.SHOW_PARENT = Tree_1.default.SHOW_PARENT;
TreeSelectComponent.SHOW_CHILD = Tree_1.default.SHOW_CHILD;
exports.default = TreeSelectComponent;
