"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toModule = exports.toArray = exports.source = exports.sourceLocale = exports.loadFile = exports.load = exports.locales = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const moment_1 = tslib_1.__importDefault(require("moment"));
const mustache_1 = tslib_1.__importDefault(require("mustache"));
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = require("../logger");
const _1 = require(".");
exports.locales = new Map();
const load = () => (0, _1.iterateFolder)(path_1.default.join(__dirname, '../../locale/bot'), loadFile, '.json');
exports.load = load;
function loadFile(filePath) {
    logger_1.logger.log('Loading locale', filePath);
    const json = require(filePath);
    exports.locales.set(path_1.default.parse(filePath).name, json);
}
exports.loadFile = loadFile;
exports.sourceLocale = 'en_US';
function source() {
    return exports.locales.get('en_US');
}
exports.source = source;
function toArray() {
    const array = [];
    exports.locales.forEach((json, locale) => array.push([locale, json]));
    return array;
}
exports.toArray = toArray;
function toModule(locale) {
    locale = locale || exports.sourceLocale;
    const _ = (string, params = {}) => {
        const localeJSON = exports.locales.get(locale);
        const source = exports.locales.get(exports.sourceLocale);
        const localeBase = localeJSON ? lodash_1.default.defaultsDeep(localeJSON, source) : source;
        const localeString = lodash_1.default.get(localeBase, string);
        if (!localeString)
            throw new Error(`No string named '${string}' was found in the source translation.`);
        return mustache_1.default.render(localeString, params);
    };
    _.valid = (string) => {
        const localeJSON = exports.locales.get(locale);
        const source = exports.locales.get(exports.sourceLocale);
        const localeBase = localeJSON ? lodash_1.default.defaultsDeep(localeJSON, source) : source;
        return lodash_1.default.has(localeBase, string);
    };
    _.numSuffix = (string, value, params) => {
        const suffixTable = [
            [0, 'zero'],
            [1, 'one'],
            [2, 'two'],
            [3, 'three'],
            [4, 'four'],
            [5, 'five']
        ];
        for (const [num, suffix] of suffixTable) {
            if (value !== num)
                continue;
            if (_.valid(`${string}.${suffix}`))
                return _(`${string}.${suffix}`, params);
        }
        return _(`${string}.many`, params);
    };
    _.toLocaleString = (number) => number.toLocaleString(locale.replace('_', '-'));
    _.moment = (...args) => (0, moment_1.default)(...args).locale(locale.replace('_', '-'));
    _.locale = locale;
    _.json = () => {
        const localeJSON = exports.locales.get(locale);
        const source = exports.locales.get(exports.sourceLocale);
        const localeBase = localeJSON ? lodash_1.default.defaultsDeep(localeJSON, source) : source;
        return localeBase;
    };
    return _;
}
exports.toModule = toModule;
//# sourceMappingURL=locale.js.map