"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("./helpers/exec");
const helpers_1 = require("./helpers");
const command_lines_1 = require("./helpers/command-lines");
const paths_1 = require("./helpers/paths");
const testlib_1 = require("./testlib");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
const exec = (0, exec_1.createExec)({
    cwd: paths_1.TEST_DIR,
});
test('should support transpile only mode', async () => {
    const r = await exec(`${command_lines_1.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only -pe "x"`);
    if (r.err === null) {
        throw new Error('Command was expected to fail, but it succeeded.');
    }
    (0, testlib_1.expect)(r.err.message).toMatch('ReferenceError: x is not defined');
});
test('should throw error even in transpileOnly mode', async () => {
    const r = await exec(`${command_lines_1.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only -pe "console."`);
    if (r.err === null) {
        throw new Error('Command was expected to fail, but it succeeded.');
    }
    (0, testlib_1.expect)(r.err.message).toMatch('error TS1003: Identifier expected');
});
test.suite('verbatimModuleSyntax w/transpileOnly should not raise configuration diagnostic', (test) => {
    test.if(helpers_1.tsSupportsVerbatimModuleSyntax);
    test('test', async (t) => {
        // Mixing verbatimModuleSyntax w/transpileOnly
        // https://github.com/TypeStrong/ts-node/issues/1971
        // We should *not* get:
        // "error TS5104: Option 'isolatedModules' is redundant and cannot be specified with option 'verbatimModuleSyntax'."
        const service = t.context.tsNodeUnderTest.create({
            transpileOnly: true,
            compilerOptions: { verbatimModuleSyntax: true },
        });
        service.compile('const foo: string = 123', 'module.ts');
    });
});
//# sourceMappingURL=transpile-only.spec.js.map