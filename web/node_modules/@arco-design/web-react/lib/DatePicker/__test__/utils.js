"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRangeTime = exports.checkTime = exports.getInput = exports.getDateCell = void 0;
function getDateCell(component, panelIndex, cellIndex) {
    return component
        .querySelectorAll('.arco-picker-body')
        .item(panelIndex)
        .querySelectorAll('.arco-picker-cell')
        .item(cellIndex);
}
exports.getDateCell = getDateCell;
function getInput(component, index) {
    return component.querySelectorAll('.arco-picker-input input').item(index);
}
exports.getInput = getInput;
function getSelectedTime(component, index) {
    return component
        .querySelectorAll('.arco-timepicker-list')
        .item(index)
        .querySelector('.arco-timepicker-cell-selected').textContent;
}
function checkTime(component, hour, minute, second) {
    expect(getSelectedTime(component, 0)).toBe(hour);
    expect(getSelectedTime(component, 1)).toBe(minute);
    expect(getSelectedTime(component, 2)).toBe(second);
}
exports.checkTime = checkTime;
function getSelectedRangeTime(component, dateIndex, index) {
    return component
        .querySelectorAll('.arco-panel-date')
        .item(dateIndex)
        .querySelectorAll('.arco-timepicker-list')
        .item(index)
        .querySelector('.arco-timepicker-cell-selected').textContent;
}
function checkRangeTime(component, dateIndex, hour, minute, second) {
    expect(getSelectedRangeTime(component, dateIndex, 0)).toBe(hour);
    expect(getSelectedRangeTime(component, dateIndex, 1)).toBe(minute);
    expect(getSelectedRangeTime(component, dateIndex, 2)).toBe(second);
}
exports.checkRangeTime = checkRangeTime;
