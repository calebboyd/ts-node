"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require("expect");
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
const exec = (0, helpers_1.createExecTester)({
    cmd: helpers_1.CMD_TS_NODE_WITH_PROJECT_FLAG,
    exec: (0, helpers_1.createExec)({
        cwd: helpers_1.TEST_DIR,
    }),
});
test('Redirects source-map-support to @cspotcode/source-map-support so that third-party libraries get correct source-mapped locations', async () => {
    const r = await exec({
        flags: `./legacy-source-map-support-interop/index.ts`,
    });
    expect(r.err).toBeNull();
    expect(r.stdout.split('\n')).toMatchObject([
        expect.stringContaining('.ts:2 '),
        'true',
        'true',
        expect.stringContaining('.ts:100:'),
        expect.stringContaining('.ts:101 '),
        '',
    ]);
});
//# sourceMappingURL=sourcemaps.spec.js.map