"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOneOf = exports.delay = exports.ts = exports.testsDirRequire = void 0;
const paths_1 = require("./paths");
const path_1 = require("path");
const util_1 = require("util");
const module_1 = require("module");
exports.testsDirRequire = (0, module_1.createRequire)((0, path_1.join)(paths_1.TEST_DIR, 'index.js'));
exports.ts = (0, exports.testsDirRequire)('typescript');
exports.delay = (0, util_1.promisify)(setTimeout);
/** Essentially Array:includes, but with tweaked types for checks on enums */
function isOneOf(value, arrayOfPossibilities) {
    return arrayOfPossibilities.includes(value);
}
exports.isOneOf = isOneOf;
//# sourceMappingURL=misc.js.map