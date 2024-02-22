"use strict";
// When running on CI, double-check that we are testing against the versions of node
// and typescript in the test matrix.
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const semver = require("semver");
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test.suite('Confirm node and typescript versions on CI', (test) => {
    test.if(!!process.env.CI);
    test('node version is correct', async (t) => {
        const expectedVersion = process.env.TEST_MATRIX_NODE_VERSION;
        const actualVersion = process.versions.node;
        t.log({ expectedVersion, actualVersion });
        (0, testlib_1.expect)(expectedVersion).toBeDefined();
        const major = expectedVersion.match(/^(\d+)-nightly$/)?.[1];
        if (major != null) {
            (0, testlib_1.expect)(actualVersion).toMatch(new RegExp('^' + major));
            (0, testlib_1.expect)(actualVersion).toMatch('-nightly');
        }
        else {
            (0, testlib_1.expect)(semver.satisfies(actualVersion, expectedVersion)).toBe(true);
        }
    });
    test('typescript version is correct', async (t) => {
        let expectedVersion = process.env.TEST_MATRIX_TYPESCRIPT_VERSION;
        const actualVersion = helpers_1.ts.version;
        t.log({ expectedVersion, actualVersion });
        (0, testlib_1.expect)(expectedVersion).toBeDefined();
        if (expectedVersion === 'next' || expectedVersion === 'latest') {
            const stdout = (0, child_process_1.execSync)(`npm view typescript@${expectedVersion} version --json`, {
                encoding: 'utf8',
            });
            t.log({ stdout });
            expectedVersion = JSON.parse(stdout);
            (0, testlib_1.expect)(helpers_1.ts.version).toBe(expectedVersion);
        }
        else {
            (0, testlib_1.expect)(semver.satisfies(helpers_1.ts.version, expectedVersion)).toBe(true);
        }
    });
});
//# sourceMappingURL=ci-node-and-ts-versions.spec.js.map