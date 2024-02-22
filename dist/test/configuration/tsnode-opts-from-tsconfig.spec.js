"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paths_1 = require("../helpers/paths");
const exec_1 = require("../helpers/exec");
const paths_2 = require("../helpers/paths");
const testlib_1 = require("../testlib");
const path_1 = require("path");
const version_checks_1 = require("../helpers/version-checks");
const ctx_ts_node_1 = require("../helpers/ctx-ts-node");
const test = (0, testlib_1.context)(ctx_ts_node_1.ctxTsNode);
const exec = (0, exec_1.createExec)({
    cwd: paths_2.TEST_DIR,
});
test.suite('should read ts-node options from tsconfig.json', (test) => {
    const BIN_EXEC = `"${paths_1.BIN_PATH}" --project tsconfig-options/tsconfig.json`;
    test('should override compiler options from env', async () => {
        const r = await exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
            env: {
                ...process.env,
                TS_NODE_COMPILER_OPTIONS: '{"typeRoots": ["env-typeroots"]}',
            },
        });
        (0, testlib_1.expect)(r.err).toBe(null);
        const { config } = JSON.parse(r.stdout);
        (0, testlib_1.expect)(config.options.typeRoots).toEqual([(0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/env-typeroots').replace(/\\/g, '/')]);
    });
    test('should use options from `tsconfig.json`', async () => {
        const r = await exec(`${BIN_EXEC} tsconfig-options/log-options1.js`);
        (0, testlib_1.expect)(r.err).toBe(null);
        const { options, config } = JSON.parse(r.stdout);
        (0, testlib_1.expect)(config.options.typeRoots).toEqual([
            (0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
        ]);
        (0, testlib_1.expect)(config.options.types).toEqual(['tsconfig-tsnode-types']);
        (0, testlib_1.expect)(options.pretty).toBe(undefined);
        (0, testlib_1.expect)(options.skipIgnore).toBe(false);
        (0, testlib_1.expect)(options.transpileOnly).toBe(true);
        (0, testlib_1.expect)(options.require).toEqual([(0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/required1.js')]);
    });
    test('should ignore empty strings in the array options', async () => {
        const r = await exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
            env: {
                ...process.env,
                TS_NODE_IGNORE: '',
            },
        });
        (0, testlib_1.expect)(r.err).toBe(null);
        const { options } = JSON.parse(r.stdout);
        (0, testlib_1.expect)(options.ignore).toEqual([]);
    });
    test('should have flags override / merge with `tsconfig.json`', async () => {
        const r = await exec(`${BIN_EXEC} --skip-ignore --compiler-options "{\\"types\\":[\\"flags-types\\"]}" --require ./tsconfig-options/required2.js tsconfig-options/log-options2.js`);
        (0, testlib_1.expect)(r.err).toBe(null);
        const { options, config } = JSON.parse(r.stdout);
        (0, testlib_1.expect)(config.options.typeRoots).toEqual([
            (0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
        ]);
        (0, testlib_1.expect)(config.options.types).toEqual(['flags-types']);
        (0, testlib_1.expect)(options.pretty).toBe(undefined);
        (0, testlib_1.expect)(options.skipIgnore).toBe(true);
        (0, testlib_1.expect)(options.transpileOnly).toBe(true);
        (0, testlib_1.expect)(options.require).toEqual([
            (0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/required1.js'),
            './tsconfig-options/required2.js',
        ]);
    });
    test('should have `tsconfig.json` override environment', async () => {
        const r = await exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
            env: {
                ...process.env,
                TS_NODE_PRETTY: 'true',
                TS_NODE_SKIP_IGNORE: 'true',
            },
        });
        (0, testlib_1.expect)(r.err).toBe(null);
        const { options, config } = JSON.parse(r.stdout);
        (0, testlib_1.expect)(config.options.typeRoots).toEqual([
            (0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
        ]);
        (0, testlib_1.expect)(config.options.types).toEqual(['tsconfig-tsnode-types']);
        (0, testlib_1.expect)(options.pretty).toBe(true);
        (0, testlib_1.expect)(options.skipIgnore).toBe(false);
        (0, testlib_1.expect)(options.transpileOnly).toBe(true);
        (0, testlib_1.expect)(options.require).toEqual([(0, path_1.join)(paths_2.TEST_DIR, './tsconfig-options/required1.js')]);
    });
    test('should pull ts-node options from extended `tsconfig.json`', async () => {
        const r = await exec(`${paths_1.BIN_PATH} --show-config --project ./tsconfig-extends/tsconfig.json`);
        (0, testlib_1.expect)(r.err).toBe(null);
        const config = JSON.parse(r.stdout);
        (0, testlib_1.expect)(config['ts-node'].require).toEqual([(0, path_1.resolve)(paths_2.TEST_DIR, 'tsconfig-extends/other/require-hook.js')]);
        (0, testlib_1.expect)(config['ts-node'].scopeDir).toBe((0, path_1.resolve)(paths_2.TEST_DIR, 'tsconfig-extends/other/scopedir'));
        (0, testlib_1.expect)(config['ts-node'].preferTsExts).toBe(true);
    });
    test.suite('should pull ts-node options from extended `tsconfig.json`', (test) => {
        test.if(version_checks_1.tsSupportsExtendsArray);
        test('test', async () => {
            const r = await exec(`${paths_1.BIN_PATH} --show-config --project ./tsconfig-extends-multiple/tsconfig.json`);
            (0, testlib_1.expect)(r.err).toBe(null);
            const config = JSON.parse(r.stdout);
            // root tsconfig extends [a, c]
            // a extends b
            // c extends d
            // https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-beta/#supporting-multiple-configuration-files-in-extends
            // If any fields "conflict", the latter entry wins.
            // This value comes from c
            (0, testlib_1.expect)(config.compilerOptions.target).toBe('es2017');
            // From root
            (0, testlib_1.expect)(config['ts-node'].preferTsExts).toBe(true);
            // From a
            (0, testlib_1.expect)(config['ts-node'].require).toEqual([
                (0, path_1.resolve)(paths_2.TEST_DIR, 'tsconfig-extends-multiple/a/require-hook-from-a.js'),
            ]);
            // From a, overrides declaration in b
            (0, testlib_1.expect)(config['ts-node'].scopeDir).toBe((0, path_1.resolve)(paths_2.TEST_DIR, 'tsconfig-extends-multiple/a/scopedir-from-a'));
            // From b
            const key = process.platform === 'win32' ? 'b\\module-types-from-b' : 'b/module-types-from-b';
            (0, testlib_1.expect)(config['ts-node'].moduleTypes).toStrictEqual({
                [key]: 'cjs',
            });
            // From c, overrides declaration in b
            (0, testlib_1.expect)(config['ts-node'].transpiler).toBe('transpiler-from-c');
            // From d, inherited by c, overrides value from b
            (0, testlib_1.expect)(config['ts-node'].ignore).toStrictEqual(['ignore-pattern-from-d']);
        });
    });
});
//# sourceMappingURL=tsnode-opts-from-tsconfig.spec.js.map