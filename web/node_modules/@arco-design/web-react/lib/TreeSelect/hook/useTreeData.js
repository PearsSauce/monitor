"use strict";
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
var react_1 = require("react");
var usePrevious_1 = __importDefault(require("../../_util/hooks/usePrevious"));
var util_1 = require("../../Tree/util");
var useUpdate_1 = __importDefault(require("../../_util/hooks/useUpdate"));
function useTreeData(props) {
    var prevProps = (0, usePrevious_1.default)(props) || {};
    var getData = function () {
        return props.treeData || (0, util_1.getTreeDataFromTreeChildren)(props.children);
    };
    var _a = __read((0, react_1.useState)(getData()), 2), treeData = _a[0], setTreeData = _a[1];
    (0, useUpdate_1.default)(function () {
        if (props.treeData !== prevProps.treeData || props.children !== prevProps.children) {
            setTreeData(getData());
        }
    }, [props]);
    return [treeData];
}
exports.default = useTreeData;
