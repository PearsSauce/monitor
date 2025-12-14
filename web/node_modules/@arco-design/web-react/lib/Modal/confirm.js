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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeConfig = void 0;
var react_1 = __importDefault(require("react"));
var react_dom_1 = require("../_util/react-dom");
var modal_1 = __importDefault(require("./modal"));
var IconInfoCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconInfoCircleFill"));
var IconCheckCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconCheckCircleFill"));
var IconExclamationCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamationCircleFill"));
var IconCloseCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconCloseCircleFill"));
var config_1 = require("./config");
var ConfigProvider_1 = __importDefault(require("../ConfigProvider"));
function ConfirmModal(props) {
    var _a = (0, config_1.getModalConfig)(), prefixCls = _a.prefixCls, simple = _a.simple;
    return (react_1.default.createElement(modal_1.default, __assign({ prefixCls: prefixCls, simple: simple }, props), props.content));
}
// 如果是消息提示型弹出框，那么只有确认按钮
var normalizeConfig = function (_config) {
    var icon = _config.icon;
    if (!icon && icon !== null) {
        icon = react_1.default.createElement(IconExclamationCircleFill_1.default, null);
        if (_config.isNotice) {
            switch (_config.noticeType) {
                case 'info':
                    icon = react_1.default.createElement(IconInfoCircleFill_1.default, null);
                    break;
                case 'success':
                    icon = react_1.default.createElement(IconCheckCircleFill_1.default, null);
                    break;
                case 'warning':
                    icon = react_1.default.createElement(IconExclamationCircleFill_1.default, null);
                    break;
                case 'error':
                    icon = react_1.default.createElement(IconCloseCircleFill_1.default, null);
                    break;
                default:
                    break;
            }
        }
    }
    if (_config.isNotice) {
        _config.hideCancel = true;
    }
    _config.title =
        icon === null && _config.title === null ? null : (react_1.default.createElement("span", null,
            icon,
            _config.title));
    return _config;
};
exports.normalizeConfig = normalizeConfig;
function confirm(config, renderFunc) {
    var root;
    var div = document.createElement('div');
    document.body.appendChild(div);
    var configProviderProps = (0, config_1.getConfigProviderProps)();
    function render(props) {
        var dom = (react_1.default.createElement(ConfigProvider_1.default, __assign({}, configProviderProps),
            react_1.default.createElement(ConfirmModal, __assign({}, props, { onCancel: onCancel }))));
        if (root) {
            root.render(dom);
        }
        else {
            root = (0, react_dom_1.render)(dom, div);
        }
    }
    var renderFunction = renderFunc || render;
    var modalConfig = __assign(__assign({}, config), { visible: false });
    var onOk = function () {
        var ret;
        var _onOk = config.onOk || config.onConfirm;
        if (_onOk) {
            ret = _onOk();
        }
        if (ret && ret.then) {
            modalConfig.confirmLoading = true;
            renderFunction(modalConfig);
            ret.then(function () {
                onCancel(true);
            }, function (e) {
                console.error(e);
                modalConfig.confirmLoading = false;
                renderFunction(modalConfig);
            });
        }
        if (!ret) {
            onCancel(true);
        }
    };
    // 如果是promise，那么处理loading和加载完成关闭
    modalConfig.onOk = onOk;
    modalConfig = (0, exports.normalizeConfig)(modalConfig);
    modalConfig.visible = true;
    renderFunction(modalConfig);
    function destroy() {
        root = root === null || root === void 0 ? void 0 : root._unmount();
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
        for (var i = 0; i < config_1.destroyList.length; i++) {
            var fn = config_1.destroyList[i];
            if (fn === close) {
                config_1.destroyList.splice(i, 1);
                break;
            }
        }
    }
    function onCancel(isOnOk) {
        !isOnOk && config.onCancel && config.onCancel();
        modalConfig.visible = false;
        modalConfig.afterClose = function () {
            config.afterClose && config.afterClose();
            destroy();
        };
        renderFunction(modalConfig);
    }
    function update(newConfig) {
        modalConfig = __assign(__assign(__assign({}, modalConfig), { title: config.title }), newConfig);
        modalConfig = (0, exports.normalizeConfig)(modalConfig);
        renderFunction(modalConfig);
    }
    function close() {
        modalConfig.visible = false;
        modalConfig.afterClose = function () {
            config.afterClose && config.afterClose();
            destroy();
        };
        renderFunction(modalConfig);
    }
    config_1.destroyList.push(close);
    return {
        close: close,
        update: update,
    };
}
exports.default = confirm;
