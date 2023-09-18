"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const path_1 = tslib_1.__importDefault(require("path"));
if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'development';
let dotenvPath = path_1.default.join(process.cwd(), '.env');
if (path_1.default.parse(process.cwd()).name === 'dist')
    dotenvPath = path_1.default.join(process.cwd(), '..', '.env');
dotenv_1.default.config({ path: dotenvPath });
const api_1 = require("./api");
(0, api_1.start)();
//# sourceMappingURL=index.js.map