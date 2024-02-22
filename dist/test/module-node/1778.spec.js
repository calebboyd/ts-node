"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("../helpers/exec");
const helpers_1 = require("../helpers");
const testlib_1 = require("../testlib");
const path_1 = require("path");
const exec = (0, exec_1.createExec)({
    cwd: helpers_1.TEST_DIR,
});
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test.suite('Issue #1778: typechecker resolver should take importer\'s module type -- cjs or esm -- into account when resolving package.json "exports"', (test) => {
    test.if(helpers_1.tsSupportsStableNodeNextNode16);
    test('test', async () => {
        const r = await exec(`${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} ./index.ts`, {
            cwd: (0, path_1.join)(helpers_1.TEST_DIR, '1778'),
        });
        (0, testlib_1.expect)(r.err).toBe(null);
        (0, testlib_1.expect)(r.stdout).toBe('{ esm: true }\n');
    });
});
//# sourceMappingURL=1778.spec.js.map