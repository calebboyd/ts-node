"use strict";
// Command lines
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMD_ESM_LOADER_WITHOUT_PROJECT = exports.CMD_TS_NODE_WITHOUT_PROJECT_FLAG = exports.CMD_TS_NODE_WITH_PROJECT_TRANSPILE_ONLY_FLAG = exports.CMD_TS_NODE_WITH_PROJECT_FLAG = void 0;
const paths_1 = require("./paths");
/** Default `ts-node --project` invocation */
exports.CMD_TS_NODE_WITH_PROJECT_FLAG = `"${paths_1.BIN_PATH}" --project "${paths_1.PROJECT}"`;
/** Default `ts-node --project` invocation with transpile-only */
exports.CMD_TS_NODE_WITH_PROJECT_TRANSPILE_ONLY_FLAG = `"${paths_1.BIN_PATH}" --project "${paths_1.PROJECT_TRANSPILE_ONLY}"`;
/** Default `ts-node` invocation without `--project` */
exports.CMD_TS_NODE_WITHOUT_PROJECT_FLAG = `"${paths_1.BIN_PATH}"`;
exports.CMD_ESM_LOADER_WITHOUT_PROJECT = `node --loader ts-node/esm`;
//#endregion
//# sourceMappingURL=command-lines.js.map