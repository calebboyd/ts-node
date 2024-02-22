"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIN_ESM_PATH = exports.BIN_CWD_PATH = exports.BIN_SCRIPT_PATH = exports.BIN_PATH_JS = exports.BIN_PATH = exports.PROJECT_TRANSPILE_ONLY = exports.PROJECT = exports.TEST_DIR = exports.DIST_DIR = exports.ROOT_DIR = void 0;
const fs_fixture_builder_1 = require("@TypeStrong/fs-fixture-builder");
const path_1 = require("path");
//#region Paths
exports.ROOT_DIR = (0, path_1.resolve)(__dirname, '../../..');
exports.DIST_DIR = (0, path_1.resolve)(__dirname, '../..');
exports.TEST_DIR = (0, path_1.join)(__dirname, '../../../tests');
exports.PROJECT = (0, path_1.join)(exports.TEST_DIR, 'tsconfig.json');
exports.PROJECT_TRANSPILE_ONLY = (0, path_1.join)(exports.TEST_DIR, 'tsconfig-transpile-only.json');
exports.BIN_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node');
exports.BIN_PATH_JS = (0, path_1.join)(exports.TEST_DIR, 'node_modules/ts-node/dist/bin.js');
exports.BIN_SCRIPT_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node-script');
exports.BIN_CWD_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node-cwd');
exports.BIN_ESM_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node-esm');
process.chdir(exports.TEST_DIR);
(0, fs_fixture_builder_1.setFixturesRootDir)(exports.TEST_DIR);
//#endregion
//# sourceMappingURL=paths.js.map