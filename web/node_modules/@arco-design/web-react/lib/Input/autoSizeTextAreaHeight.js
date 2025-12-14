"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auto set textarea height
var is_1 = require("../_util/is");
var mirrorTextAreaStyle = "\n  position: absolute;\n  min-height: 0 !important;\n  max-height: none;\n  height:0;\n  visibility: hidden;\n  z-index: -100;\n  top: 0;\n  right: 0;\n";
var mirrorTextAreaSizing = [
    'border-width',
    'box-sizing',
    'font-family',
    'font-weight',
    'font-size',
    'font-variant',
    'letter-spacing',
    'line-height',
    'padding-top',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'text-indent',
    'text-rendering',
    'text-transform',
    'width',
];
var mirrorTextArea;
function setMirrorTextArea(originTextArea) {
    if (!mirrorTextArea) {
        mirrorTextArea = document.createElement('textarea');
        document.body.appendChild(mirrorTextArea);
    }
    var originStyle = window.getComputedStyle(originTextArea);
    var originSizingStyle = "\n    " + mirrorTextAreaSizing.map(function (attr) { return attr + ":" + originStyle.getPropertyValue(attr); }).join(';') + "\n  ";
    mirrorTextArea.setAttribute('style', "" + mirrorTextAreaStyle + originSizingStyle);
    var paddingSize = parseFloat(originStyle.getPropertyValue('padding-top')) +
        parseFloat(originStyle.getPropertyValue('padding-bottom'));
    var boxSizing = originStyle.getPropertyValue('box-sizing');
    var borderSize = parseFloat(originStyle.getPropertyValue('border-top-width')) +
        parseFloat(originStyle.getPropertyValue('border-bottom-width'));
    return {
        paddingSize: paddingSize,
        boxSizing: boxSizing,
        borderSize: borderSize,
    };
}
function autoSizeTextAreaHeight(autoSize, node) {
    var getRows = function () {
        var minRows;
        var maxRows;
        if ((0, is_1.isObject)(autoSize)) {
            minRows = autoSize.minRows;
            maxRows = autoSize.maxRows;
        }
        return {
            minRows: minRows,
            maxRows: maxRows,
        };
    };
    if (autoSize) {
        var _a = getRows(), minRows = _a.minRows, maxRows = _a.maxRows;
        var originTextNode = node;
        var _b = setMirrorTextArea(originTextNode), paddingSize = _b.paddingSize, boxSizing = _b.boxSizing, borderSize = _b.borderSize;
        mirrorTextArea.value = originTextNode.value || originTextNode.placeholder || '';
        var mirrorTextAreaHeight = mirrorTextArea.scrollHeight + borderSize;
        var minHeight = void 0;
        var maxHeight = void 0;
        var overflowY = void 0;
        if (minRows || maxRows) {
            mirrorTextArea.value = '';
            var singleRowHeight = mirrorTextArea.scrollHeight - paddingSize;
            if ((0, is_1.isNumber)(minRows)) {
                minHeight = singleRowHeight * minRows;
                if (boxSizing === 'border-box') {
                    minHeight += paddingSize;
                    minHeight += borderSize;
                }
                mirrorTextAreaHeight = Math.max(mirrorTextAreaHeight, minHeight);
            }
            if ((0, is_1.isNumber)(maxRows)) {
                maxHeight = singleRowHeight * maxRows;
                if (boxSizing === 'border-box') {
                    maxHeight += paddingSize;
                    maxHeight += borderSize;
                }
                overflowY = mirrorTextAreaHeight > maxHeight ? 'auto' : '';
                maxHeight = Math.min(mirrorTextAreaHeight, maxHeight);
            }
        }
        var textAreaStyle = {};
        textAreaStyle.height = mirrorTextAreaHeight;
        if (minHeight) {
            textAreaStyle.minHeight = minHeight;
        }
        if (maxHeight) {
            textAreaStyle.maxHeight = maxHeight;
        }
        if (overflowY) {
            textAreaStyle.overflowY = overflowY;
        }
        return textAreaStyle;
    }
}
exports.default = autoSizeTextAreaHeight;
