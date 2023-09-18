"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARENT_FILTERS = exports.findFilter = exports.loadEvent = exports.load = exports.events = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = require("../logger");
const _1 = require(".");
const webhookFilters_1 = tslib_1.__importDefault(require("./webhookFilters"));
exports.events = new Map();
const load = () => (0, _1.iterateFolder)(path_1.default.resolve(__dirname, '../events'), loadEvent);
exports.load = load;
function loadEvent(filePath) {
    logger_1.logger.debug('Loading event', filePath);
    const file = require(filePath);
    if (file.event)
        exports.events.set(file.event.name, file.event);
}
exports.loadEvent = loadEvent;
function findFilter(payload) {
    const keyMap = {
        idList: 'list',
        dueComplete: 'due'
    };
    const snakeCaseAction = payload.action.type.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).toUpperCase();
    if (webhookFilters_1.default.FLAGS[snakeCaseAction])
        return [snakeCaseAction, exports.events.has(snakeCaseAction)];
    if (exports.PARENT_FILTERS.includes(snakeCaseAction) && payload.action.data.old) {
        const keyChanged = Object.keys(payload.action.data.old)[0];
        const childAction = snakeCaseAction + '_' + (keyMap[keyChanged] || keyChanged).toUpperCase();
        if (webhookFilters_1.default.FLAGS[childAction])
            return [childAction, exports.events.has(childAction)];
    }
    return [`!${payload.action.type}`, false];
}
exports.findFilter = findFilter;
exports.PARENT_FILTERS = [
    'UPDATE_CARD',
    'UPDATE_CHECK_ITEM',
    'UPDATE_CHECKLIST',
    'UPDATE_LIST',
    'UPDATE_BOARD',
    'UPDATE_LABEL',
    'UPDATE_CUSTOM_FIELD'
];
//# sourceMappingURL=events.js.map