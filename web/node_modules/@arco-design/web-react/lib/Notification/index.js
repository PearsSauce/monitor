"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var react_1 = __importDefault(require("react"));
var react_transition_group_1 = require("react-transition-group");
var react_dom_1 = require("react-dom");
var react_dom_2 = require("../_util/react-dom");
var notification_1 = __importDefault(require("../_class/notification"));
var notice_1 = __importDefault(require("../_class/notice"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var useNotification_1 = __importDefault(require("./useNotification"));
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var notificationTypes = ['info', 'success', 'error', 'warning', 'normal'];
var notificationInstance = {};
// global config
var maxCount;
var prefixCls;
var duration;
var container;
var rtl;
var Notification = /** @class */ (function (_super) {
    __extends(Notification, _super);
    function Notification() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.remove = function (id) {
            var noticeItem = _this.state.notices.find(function (item) { return item.id === id; });
            if (noticeItem) {
                _this.update(__assign(__assign({}, noticeItem), { style: __assign(__assign({}, noticeItem.style), { opacity: 0 }) }));
            }
            // 200 是透明度动画结束的时间
            setTimeout(function () {
                _super.prototype.remove.call(_this, id);
            }, 200);
        };
        return _this;
    }
    Notification.prototype.render = function () {
        var _a;
        var _this = this;
        var notices = this.state.notices;
        var _b = this.props, _prefixCls = _b.prefixCls, _rtl = _b.rtl, getContainer = _b.getContainer;
        var position = this.state.position;
        var mergedRtl = !(0, is_1.isUndefined)(_rtl) ? _rtl : rtl;
        if ((0, is_1.isUndefined)(position)) {
            position = mergedRtl ? 'topLeft' : 'topRight';
        }
        var mergedPrefixCls = _prefixCls || prefixCls;
        var prefixClsNotification = mergedPrefixCls
            ? mergedPrefixCls + "-notification"
            : 'arco-notification';
        var transitionClass;
        if (position === 'topLeft' || position === 'bottomLeft') {
            transitionClass = 'slideNoticeLeft';
        }
        else {
            transitionClass = 'slideNoticeRight';
        }
        var classNames = (0, classNames_1.default)(prefixClsNotification + "-wrapper", prefixClsNotification + "-wrapper-" + position, (_a = {}, _a[prefixClsNotification + "-wrapper-rtl"] = rtl, _a));
        var container = getContainer === null || getContainer === void 0 ? void 0 : getContainer();
        var dom = (react_1.default.createElement("div", { className: classNames },
            react_1.default.createElement(react_transition_group_1.TransitionGroup, { component: null }, notices.map(function (notice) { return (react_1.default.createElement(CSSTransition_1.default, { key: notice.id, timeout: {
                    enter: 400,
                    exit: 300,
                }, classNames: transitionClass, onExit: function (e) {
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
                    notice.onClose && notice.onClose();
                } },
                react_1.default.createElement(notice_1.default, __assign({}, notice, { onClose: _this.remove, prefixCls: prefixClsNotification, iconPrefix: mergedPrefixCls, classPrefixCls: mergedPrefixCls, noticeType: "notification", rtl: mergedRtl })))); }))));
        return container ? (0, react_dom_1.createPortal)(dom, container) : dom;
    };
    Notification.config = function (options) {
        if (options === void 0) { options = {}; }
        if ((0, is_1.isNumber)(options.maxCount)) {
            maxCount = options.maxCount;
        }
        if (options.prefixCls) {
            prefixCls = options.prefixCls;
        }
        if ((0, is_1.isNumber)(options.duration)) {
            duration = options.duration;
        }
        if (typeof options.rtl === 'boolean') {
            rtl = options.rtl;
        }
        if (options.getContainer && options.getContainer() !== container) {
            container = options.getContainer();
            Object.values(notificationInstance).forEach(function (_a) {
                var notice = _a.instance;
                return notice === null || notice === void 0 ? void 0 : notice.clear();
            });
            notificationInstance = {};
        }
    };
    Notification.clear = function () {
        Object.values(notificationInstance).forEach(function (_a) {
            var instance = _a.instance;
            instance === null || instance === void 0 ? void 0 : instance.clear();
        });
    };
    Notification.remove = function (id) {
        Object.values(notificationInstance).forEach(function (_a) {
            var instance = _a.instance;
            instance === null || instance === void 0 ? void 0 : instance.remove(id);
        });
    };
    Notification.addInstance = function (noticeProps) {
        var position = noticeProps.position;
        if ((0, is_1.isUndefined)(noticeProps.position)) {
            position = rtl ? 'topLeft' : 'topRight';
        }
        var _noticeProps = __assign({ duration: duration }, noticeProps);
        var _a = notificationInstance[position] || {}, instance = _a.instance, pending = _a.pending;
        if (instance || pending) {
            var add_1 = function () {
                var instance = (notificationInstance[position] || {}).instance;
                var notices = instance.state.notices;
                var updated = notices.find(function (notice) { return notice.id === noticeProps.id; });
                var _mergerProps = __assign(__assign({}, _noticeProps), { update: updated });
                if (notices.length >= maxCount) {
                    if (updated) {
                        instance.add(__assign(__assign({}, _mergerProps), { id: updated.id }));
                    }
                    else {
                        notices.shift();
                        instance.add(_mergerProps);
                    }
                }
                else {
                    instance.add(__assign({}, _mergerProps));
                }
                return instance;
            };
            if (instance) {
                add_1();
            }
            else if (pending === null || pending === void 0 ? void 0 : pending.then) {
                pending.then(function () {
                    add_1();
                    notificationInstance[position].pending = null;
                });
            }
            return instance;
        }
        var div = document.createElement('div');
        (container || document.body).appendChild(div);
        notificationInstance[position] = {};
        notificationInstance[position].pending = new Promise(function (resolve) {
            (0, react_dom_2.render)(react_1.default.createElement(Notification, { ref: function (instance) {
                    if (!notificationInstance[position]) {
                        // getContainer 变化时，会重置 notificationInstance
                        // pending 中的逻辑执行晚于重置逻辑时，这里需判空
                        notificationInstance[position] = {};
                    }
                    notificationInstance[position].instance = instance;
                    instance.add(_noticeProps);
                    resolve(null);
                    return instance;
                } }), div);
        });
        return notificationInstance[position].instance;
    };
    return Notification;
}(notification_1.default));
notificationTypes.forEach(function (type) {
    Notification[type] = function (noticeProps) {
        return Notification.addInstance(__assign(__assign({}, noticeProps), { type: type }));
    };
});
Notification.useNotification = useNotification_1.default;
exports.default = Notification;
