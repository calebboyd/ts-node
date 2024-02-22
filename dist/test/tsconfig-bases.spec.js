"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const exec_1 = require("./helpers/exec");
const ctx_tmp_dir_1 = require("./helpers/ctx-tmp-dir");
const ctx_ts_node_1 = require("./helpers/ctx-ts-node");
const paths_1 = require("./helpers/paths");
const version_checks_1 = require("./helpers/version-checks");
const testlib_1 = require("./testlib");
const semver = require("semver");
const helpers_1 = require("./helpers");
const exec = (0, exec_1.createExec)({
    cwd: paths_1.TEST_DIR,
});
const test = (0, testlib_1.context)(ctx_ts_node_1.ctxTsNode);
test.suite('should use implicit @tsconfig/bases config when one is not loaded from disk', ({ contextEach }) => {
    const test = contextEach(ctx_tmp_dir_1.ctxTmpDirOutsideCheckout);
    // Expectations change depending on node and TS version, since ts-node picks an implicit config that is compatible
    // with both.
    let lib = undefined;
    let target = 'es5';
    if (version_checks_1.tsSupportsStableNodeNextNode16) {
        lib = ['es2020'];
        target = 'es2020';
        if (semver.gte(process.versions.node, '16.0.0') && version_checks_1.tsSupportsEs2021) {
            lib = ['es2021'];
            target = 'es2021';
        }
        if (semver.gte(process.versions.node, '18.0.0') && version_checks_1.tsSupportsEs2022 && version_checks_1.tsSupportsLibEs2023) {
            lib = ['es2023'];
            target = 'es2022';
        }
    }
    test('implicitly uses @tsconfig/node14, @tsconfig/node16, @tsconfig/node18, or @tsconfig/node20 compilerOptions when both TS and node versions support it', async (t) => {
        const r1 = await exec(`${paths_1.BIN_PATH} --showConfig`, {
            cwd: t.context.tmpDir,
        });
        (0, testlib_1.expect)(r1.err).toBe(null);
        t.like(JSON.parse(r1.stdout), {
            compilerOptions: {
                target,
                lib,
            },
        });
    });
    test('implicitly loads @types/node even when not installed within local directory', async (t) => {
        const r = await exec(`${paths_1.BIN_PATH} -pe process.env.foo`, {
            cwd: t.context.tmpDir,
            env: { ...process.env, foo: 'hello world' },
        });
        (0, testlib_1.expect)(r.err).toBe(null);
        (0, testlib_1.expect)(r.stdout).toBe('hello world\n');
    });
    test('implicitly loads local @types/node', async (t) => {
        t.context.fixture.readFrom((0, path_1.join)(paths_1.TEST_DIR, 'local-types-node'), undefined, []);
        t.context.fixture.write();
        const r = await exec(`${paths_1.BIN_PATH} -pe process.env.foo`, {
            cwd: t.context.fixture.cwd,
            env: { ...process.env, foo: 'hello world' },
        });
        (0, testlib_1.expect)(r.err).not.toBe(null);
        (0, testlib_1.expect)(r.stderr).toMatch("Property 'env' does not exist on type 'LocalNodeTypes_Process'");
    });
});
test.suite('should bundle @tsconfig/bases to be used in your own tsconfigs', (test) => {
    // Older TS versions will complain about newer `target`, `lib`, `module`, `moduleResolution` options
    test.if(version_checks_1.tsSupportsEs2022 && version_checks_1.tsSupportsLibEs2023 && version_checks_1.tsSupportsStableNodeNextNode16);
    const macro = test.macro((nodeVersion) => async (t) => {
        const config = (0, helpers_1.testsDirRequire)(`@tsconfig/${nodeVersion}/tsconfig.json`);
        const r = await exec(`${paths_1.BIN_PATH} --showConfig -e 10n`, {
            cwd: (0, path_1.join)(paths_1.TEST_DIR, 'tsconfig-bases', nodeVersion),
        });
        (0, testlib_1.expect)(r.err).toBe(null);
        t.like(JSON.parse(r.stdout), {
            compilerOptions: {
                target: config.compilerOptions.target,
                lib: config.compilerOptions.lib,
            },
        });
    });
    test(`ts-node/node14/tsconfig.json`, macro, 'node14');
    test(`ts-node/node16/tsconfig.json`, macro, 'node16');
    test(`ts-node/node18/tsconfig.json`, macro, 'node18');
    test(`ts-node/node20/tsconfig.json`, macro, 'node20');
});
//# sourceMappingURL=tsconfig-bases.spec.js.map