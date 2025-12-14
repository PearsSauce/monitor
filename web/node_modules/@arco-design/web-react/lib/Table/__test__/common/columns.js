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
exports.multipleSorterColumns = exports.columnsGroupColumns = exports.columnsCustomStyle = exports.columnsFixedColumns = exports.columnsCustomRender = exports.columnsFilterCustom = exports.columnsFilter = exports.columnsSorter = exports.columns = void 0;
var react_1 = __importDefault(require("react"));
var Button_1 = __importDefault(require("../../../Button"));
var Tag_1 = __importDefault(require("../../../Tag"));
var icon_1 = require("../../../../icon");
var constant_1 = require("../../../_util/constant");
exports.columns = [
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Address',
        dataIndex: 'address',
    },
    {
        title: 'Sex',
        dataIndex: 'sex',
    },
    {
        title: 'Age',
        dataIndex: 'age',
    },
    {
        title: 'Email',
        dataIndex: 'email',
    },
];
exports.columnsSorter = (function () {
    return exports.columns.map(function (d) {
        if (d.title === 'Age') {
            return __assign(__assign({}, d), { defaultSortOrder: 'ascend', sorter: function (a, b) { return a.age - b.age; } });
        }
        return d;
    });
})();
exports.columnsFilter = (function () {
    return exports.columns.map(function (d) {
        if (d.title === 'Sex') {
            return __assign(__assign({}, d), { defaultFilters: ['male'], filters: [
                    {
                        text: 'Male',
                        value: 'male',
                    },
                    {
                        text: 'Female',
                        value: 'female',
                    },
                ], onFilter: function (value, row) { return row.sex === value; } });
        }
        return d;
    });
})();
exports.columnsFilterCustom = (function () {
    return exports.columns.map(function (d) {
        if (d.title === 'Sex') {
            return __assign(__assign({}, d), { filterIcon: react_1.default.createElement(icon_1.IconSearch, null), filterDropdown: function (_a) {
                    var setFilterKeys = _a.setFilterKeys, confirm = _a.confirm;
                    return (react_1.default.createElement("div", { className: "arco-table-custom-filter" },
                        react_1.default.createElement(Button_1.default, { onClick: function () {
                                setFilterKeys(['male'], constant_1.NOOP);
                            } }, "set value"),
                        react_1.default.createElement(Button_1.default, { onClick: function () {
                                confirm();
                            } }, "ok")));
                }, onFilter: function (value, row) { return row.sex === value; } });
        }
        return d;
    });
})();
exports.columnsCustomRender = (function () {
    return exports.columns.map(function (d) {
        if (d.title === 'Sex') {
            return __assign(__assign({}, d), { render: function (col) {
                    return react_1.default.createElement(Tag_1.default, null, col);
                } });
        }
        return d;
    });
})();
exports.columnsFixedColumns = (function () {
    return exports.columns.map(function (d) {
        if (d.title === 'Name') {
            return __assign(__assign({}, d), { fixed: 'left', width: 100 });
        }
        if (d.title === 'Email') {
            return __assign(__assign({}, d), { fixed: 'right', width: 120 });
        }
        return d;
    });
})();
exports.columnsCustomStyle = (function () {
    return exports.columns.map(function (d) {
        if (d.title === 'Name') {
            return __assign(__assign({}, d), { className: 'red', headerCellStyle: {
                    backgroundColor: 'rgb(0, 0, 0)',
                    color: 'rgb(255, 255, 255)',
                }, bodyCellStyle: {
                    color: 'rgb(255, 255, 255)',
                } });
        }
        if (d.title === 'Address') {
            return __assign(__assign({}, d), { cellStyle: {
                    color: 'rgb(1, 1, 1)',
                } });
        }
        return d;
    });
})();
exports.columnsGroupColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Other',
        children: [
            {
                title: 'Address',
                dataIndex: 'address',
            },
            {
                title: 'Sex',
                dataIndex: 'sex',
            },
            {
                title: 'Age',
                dataIndex: 'age',
            },
        ],
    },
    {
        title: 'Email',
        dataIndex: 'email',
    },
];
exports.multipleSorterColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
        sorter: function (a, b) {
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        },
    },
    {
        title: 'Age',
        dataIndex: 'age',
        sorter: function (a, b) { return a.age - b.age; },
    },
    {
        title: 'Score A',
        dataIndex: 'scoreA',
        defaultSortOrder: 'descend',
        sorter: {
            compare: function (a, b) { return a.scoreA - b.scoreA; },
            multiple: 3,
        },
    },
    {
        title: 'Score B',
        dataIndex: 'scoreB',
        defaultSortOrder: 'ascend',
        sorter: {
            compare: function (a, b) { return a.scoreB - b.scoreB; },
            multiple: 2,
        },
    },
    {
        title: 'Score C',
        dataIndex: 'scoreC',
        defaultSortOrder: 'descend',
        sorter: {
            compare: function (a, b) { return a.scoreC - b.scoreC; },
            multiple: 1,
        },
    },
];
