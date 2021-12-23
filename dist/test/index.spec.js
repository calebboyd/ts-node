"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const testlib_1 = require("./testlib");
const expect = require("expect");
const path_1 = require("path");
const os_1 = require("os");
const semver = require("semver");
const helpers_1 = require("./helpers");
const fs_1 = require("fs");
const fslib_1 = require("@yarnpkg/fslib");
const url_1 = require("url");
const exec_helpers_1 = require("./exec-helpers");
const helpers_2 = require("./helpers");
const exec = (0, exec_helpers_1.createExec)({
    cwd: helpers_2.TEST_DIR,
});
const test = testlib_1._test.context(helpers_2.contextTsNodeUnderTest);
test.suite('ts-node', (test) => {
    test('should export the correct version', (t) => {
        expect(t.context.tsNodeUnderTest.VERSION).toBe(require('../../package.json').version);
    });
    test('should export all CJS entrypoints', () => {
        // Ensure our package.json "exports" declaration allows `require()`ing all our entrypoints
        // https://github.com/TypeStrong/ts-node/pull/1026
        helpers_2.testsDirRequire.resolve('ts-node');
        // only reliably way to ask node for the root path of a dependency is Path.resolve(require.resolve('ts-node/package'), '..')
        helpers_2.testsDirRequire.resolve('ts-node/package');
        helpers_2.testsDirRequire.resolve('ts-node/package.json');
        // All bin entrypoints for people who need to augment our CLI: `node -r otherstuff ./node_modules/ts-node/dist/bin`
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin.js');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin-transpile');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin-transpile.js');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin-script');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin-script.js');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin-cwd');
        helpers_2.testsDirRequire.resolve('ts-node/dist/bin-cwd.js');
        // Must be `require()`able obviously
        helpers_2.testsDirRequire.resolve('ts-node/register');
        helpers_2.testsDirRequire.resolve('ts-node/register/files');
        helpers_2.testsDirRequire.resolve('ts-node/register/transpile-only');
        helpers_2.testsDirRequire.resolve('ts-node/register/type-check');
        // `node --loader ts-node/esm`
        helpers_2.testsDirRequire.resolve('ts-node/esm');
        helpers_2.testsDirRequire.resolve('ts-node/esm.mjs');
        helpers_2.testsDirRequire.resolve('ts-node/esm/transpile-only');
        helpers_2.testsDirRequire.resolve('ts-node/esm/transpile-only.mjs');
        helpers_2.testsDirRequire.resolve('ts-node/transpilers/swc');
        helpers_2.testsDirRequire.resolve('ts-node/transpilers/swc-experimental');
        helpers_2.testsDirRequire.resolve('ts-node/node10/tsconfig.json');
        helpers_2.testsDirRequire.resolve('ts-node/node12/tsconfig.json');
        helpers_2.testsDirRequire.resolve('ts-node/node14/tsconfig.json');
        helpers_2.testsDirRequire.resolve('ts-node/node16/tsconfig.json');
    });
    test.suite('cli', (test) => {
        test('should execute cli', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} hello-world`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, world!\n');
        }));
        test('shows usage via --help', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} --help`);
            expect(err).toBe(null);
            expect(stdout).toMatch(/Usage: ts-node /);
        }));
        test('shows version via -v', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} -v`);
            expect(err).toBe(null);
            expect(stdout.trim()).toBe('v' + (0, helpers_2.testsDirRequire)('ts-node/package').version);
        }));
        test('shows version of compiler via -vv', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} -vv`);
            expect(err).toBe(null);
            expect(stdout.trim()).toBe(`ts-node v${(0, helpers_2.testsDirRequire)('ts-node/package').version}\n` +
                `node ${process.version}\n` +
                `compiler v${(0, helpers_2.testsDirRequire)('typescript/package').version}`);
        }));
        test('should register via cli', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`node -r ts-node/register hello-world.ts`, {
                cwd: helpers_2.TEST_DIR,
            });
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, world!\n');
        }));
        test('should execute cli with absolute path', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} "${(0, path_1.join)(helpers_2.TEST_DIR, 'hello-world')}"`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, world!\n');
        }));
        test('should print scripts', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -pe "import { example } from './complex/index';example()"`);
            expect(err).toBe(null);
            expect(stdout).toBe('example\n');
        }));
        test('should provide registered information globally', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} env`);
            expect(err).toBe(null);
            expect(stdout).toBe('object\n');
        }));
        test('should provide registered information on register', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`node -r ts-node/register env.ts`, {
                cwd: helpers_2.TEST_DIR,
            });
            expect(err).toBe(null);
            expect(stdout).toBe('object\n');
        }));
        if (semver.gte(helpers_1.ts.version, '1.8.0')) {
            test('should allow js', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec([
                    helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG,
                    '-O "{\\"allowJs\\":true}"',
                    '-pe "import { main } from \'./allow-js/run\';main()"',
                ].join(' '));
                expect(err).toBe(null);
                expect(stdout).toBe('hello world\n');
            }));
            test('should include jsx when `allow-js` true', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec([
                    helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG,
                    '-O "{\\"allowJs\\":true}"',
                    '-pe "import { Foo2 } from \'./allow-js/with-jsx\'; Foo2.sayHi()"',
                ].join(' '));
                expect(err).toBe(null);
                expect(stdout).toBe('hello world\n');
            }));
        }
        test('should eval code', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -e "import * as m from './module';console.log(m.example('test'))"`);
            expect(err).toBe(null);
            expect(stdout).toBe('TEST\n');
        }));
        test('should import empty files', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -e "import './empty'"`);
            expect(err).toBe(null);
            expect(stdout).toBe('');
        }));
        test('should throw errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -e "import * as m from './module';console.log(m.example(123))"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch(new RegExp("TS2345: Argument of type '(?:number|123)' " +
                "is not assignable to parameter of type 'string'\\."));
        }));
        test('should be able to ignore diagnostic', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --ignore-diagnostics 2345 -e "import * as m from './module';console.log(m.example(123))"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch(/TypeError: (?:(?:undefined|foo\.toUpperCase) is not a function|.*has no method \'toUpperCase\')/);
        }));
        test('should work with source maps', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} "throw error"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch([
                `${(0, path_1.join)(helpers_2.TEST_DIR, 'throw error.ts')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('should work with source maps in --transpile-only mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only "throw error"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch([
                `${(0, path_1.join)(helpers_2.TEST_DIR, 'throw error.ts')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('eval should work with source maps', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -pe "import './throw error'"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch([
                `${(0, path_1.join)(helpers_2.TEST_DIR, 'throw error.ts')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
            ].join('\n'));
        }));
        test('should support transpile only mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only -pe "x"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch('ReferenceError: x is not defined');
        }));
        test('should throw error even in transpileOnly mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only -pe "console."`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch('error TS1003: Identifier expected');
        }));
        for (const flavor of [
            '--transpiler ts-node/transpilers/swc transpile-only-swc',
            '--transpiler ts-node/transpilers/swc-experimental transpile-only-swc',
            '--swc transpile-only-swc',
            'transpile-only-swc-via-tsconfig',
            'transpile-only-swc-shorthand-via-tsconfig',
        ]) {
            test(`should support swc and third-party transpilers: ${flavor}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} ${flavor}`, {
                    env: Object.assign(Object.assign({}, process.env), { NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require ${require.resolve('../../tests/spy-swc-transpiler')}` }),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch('Hello World! swc transpiler invocation count: 1\n');
            }));
        }
        test.suite('should support `traceResolution` compiler option', (test) => {
            test('prints traces before running code when enabled', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} --compiler-options="{ \\"traceResolution\\": true }" -e "console.log('ok')"`);
                expect(err).toBeNull();
                expect(stdout).toContain('======== Resolving module');
                expect(stdout.endsWith('ok\n')).toBe(true);
            }));
            test('does NOT print traces when not enabled', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} -e "console.log('ok')"`);
                expect(err).toBeNull();
                expect(stdout).not.toContain('======== Resolving module');
                expect(stdout.endsWith('ok\n')).toBe(true);
            }));
        });
        if (semver.gte(process.version, '12.16.0')) {
            test('swc transpiler supports native ESM emit', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} ./index.ts`, {
                    cwd: (0, path_1.resolve)(helpers_2.TEST_DIR, 'transpile-only-swc-native-esm'),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch('Hello file://');
            }));
        }
        test('should pipe into `ts-node` and evaluate', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG);
            execPromise.child.stdin.end("console.log('hello')");
            const { err, stdout } = yield execPromise;
            expect(err).toBe(null);
            expect(stdout).toBe('hello\n');
        }));
        test('should pipe into `ts-node`', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -p`);
            execPromise.child.stdin.end('true');
            const { err, stdout } = yield execPromise;
            expect(err).toBe(null);
            expect(stdout).toBe('true\n');
        }));
        test('should pipe into an eval script', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only -pe "process.stdin.isTTY"`);
            execPromise.child.stdin.end('true');
            const { err, stdout } = yield execPromise;
            expect(err).toBe(null);
            expect(stdout).toBe('undefined\n');
        }));
        test('should support require flags', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -r ./hello-world -pe "console.log('success')"`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, world!\nsuccess\nundefined\n');
        }));
        test('should support require from node modules', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} -r typescript -e "console.log('success')"`);
            expect(err).toBe(null);
            expect(stdout).toBe('success\n');
        }));
        test('should use source maps with react tsx', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} "throw error react tsx.tsx"`);
            expect(err).not.toBe(null);
            expect(err.message).toMatch([
                `${(0, path_1.join)(helpers_2.TEST_DIR, './throw error react tsx.tsx')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('should use source maps with react tsx in --transpile-only mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --transpile-only "throw error react tsx.tsx"`);
            expect(err).not.toBe(null);
            expect(err.message).toMatch([
                `${(0, path_1.join)(helpers_2.TEST_DIR, './throw error react tsx.tsx')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('should allow custom typings', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} custom-types`);
            // This error comes from *node*, meaning TypeScript respected the custom types (good) but *node* could not find the non-existent module (expected)
            expect(err === null || err === void 0 ? void 0 : err.message).toMatch(/Error: Cannot find module 'does-not-exist'/);
        }));
        test('should preserve `ts-node` context with child process', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} child-process`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, world!\n');
        }));
        test('should import js before ts by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} import-order/compiled`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, JavaScript!\n');
        }));
        const preferTsExtsEntrypoint = semver.gte(process.version, '12.0.0')
            ? 'import-order/compiled'
            : 'import-order/require-compiled';
        test('should import ts before js when --prefer-ts-exts flag is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --prefer-ts-exts ${preferTsExtsEntrypoint}`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, TypeScript!\n');
        }));
        test('should import ts before js when TS_NODE_PREFER_TS_EXTS env is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} ${preferTsExtsEntrypoint}`, {
                env: Object.assign(Object.assign({}, process.env), { TS_NODE_PREFER_TS_EXTS: 'true' }),
            });
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, TypeScript!\n');
        }));
        test('should ignore .d.ts files', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} import-order/importer`);
            expect(err).toBe(null);
            expect(stdout).toBe('Hello, World!\n');
        }));
        test.suite('issue #884', (test) => {
            test('should compile', (t) => __awaiter(void 0, void 0, void 0, function* () {
                // TODO disabled because it consistently fails on Windows on TS 2.7
                if (process.platform === 'win32' &&
                    semver.satisfies(helpers_1.ts.version, '2.7')) {
                    t.log('Skipping');
                    return;
                }
                else {
                    const { err, stdout } = yield exec(`"${helpers_2.BIN_PATH}" --project issue-884/tsconfig.json issue-884`);
                    expect(err).toBe(null);
                    expect(stdout).toBe('');
                }
            }));
        });
        test.suite('issue #986', (test) => {
            test('should not compile', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`"${helpers_2.BIN_PATH}" --project issue-986/tsconfig.json issue-986`);
                expect(err).not.toBe(null);
                expect(stderr).toMatch("Cannot find name 'TEST'"); // TypeScript error.
                expect(stdout).toBe('');
            }));
            test('should compile with `--files`', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`"${helpers_2.BIN_PATH}" --files --project issue-986/tsconfig.json issue-986`);
                expect(err).not.toBe(null);
                expect(stderr).toMatch('ReferenceError: TEST is not defined'); // Runtime error.
                expect(stdout).toBe('');
            }));
        });
        if (semver.gte(helpers_1.ts.version, '2.7.0')) {
            test('should locate tsconfig relative to entry-point by default', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} ../a/index`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'cwd-and-script-mode/b'),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch(/plugin-a/);
            }));
            test('should locate tsconfig relative to entry-point via ts-node-script', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_SCRIPT_PATH} ../a/index`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'cwd-and-script-mode/b'),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch(/plugin-a/);
            }));
            test('should locate tsconfig relative to entry-point with --script-mode', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} --script-mode ../a/index`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'cwd-and-script-mode/b'),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch(/plugin-a/);
            }));
            test('should locate tsconfig relative to cwd via ts-node-cwd', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_CWD_PATH} ../a/index`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'cwd-and-script-mode/b'),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch(/plugin-b/);
            }));
            test('should locate tsconfig relative to cwd in --cwd-mode', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} --cwd-mode ../a/index`, { cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'cwd-and-script-mode/b') });
                expect(err).toBe(null);
                expect(stdout).toMatch(/plugin-b/);
            }));
            test('should locate tsconfig relative to realpath, not symlink, when entrypoint is a symlink', (t) => __awaiter(void 0, void 0, void 0, function* () {
                if ((0, fs_1.lstatSync)((0, path_1.join)(helpers_2.TEST_DIR, 'main-realpath/symlink/symlink.tsx')).isSymbolicLink()) {
                    const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} main-realpath/symlink/symlink.tsx`);
                    expect(err).toBe(null);
                    expect(stdout).toBe('');
                }
                else {
                    t.log('Skipping');
                    return;
                }
            }));
        }
        test.suite('should read ts-node options from tsconfig.json', (test) => {
            const BIN_EXEC = `"${helpers_2.BIN_PATH}" --project tsconfig-options/tsconfig.json`;
            test('should override compiler options from env', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
                    env: Object.assign(Object.assign({}, process.env), { TS_NODE_COMPILER_OPTIONS: '{"typeRoots": ["env-typeroots"]}' }),
                });
                expect(err).toBe(null);
                const { config } = JSON.parse(stdout);
                expect(config.options.typeRoots).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/env-typeroots').replace(/\\/g, '/'),
                ]);
            }));
            test('should use options from `tsconfig.json`', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`);
                expect(err).toBe(null);
                const { options, config } = JSON.parse(stdout);
                expect(config.options.typeRoots).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
                ]);
                expect(config.options.types).toEqual(['tsconfig-tsnode-types']);
                expect(options.pretty).toBe(undefined);
                expect(options.skipIgnore).toBe(false);
                expect(options.transpileOnly).toBe(true);
                expect(options.require).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/required1.js'),
                ]);
            }));
            test('should ignore empty strings in the array options', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
                    env: Object.assign(Object.assign({}, process.env), { TS_NODE_IGNORE: '' }),
                });
                expect(err).toBe(null);
                const { options } = JSON.parse(stdout);
                expect(options.ignore).toEqual([]);
            }));
            test('should have flags override / merge with `tsconfig.json`', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} --skip-ignore --compiler-options "{\\"types\\":[\\"flags-types\\"]}" --require ./tsconfig-options/required2.js tsconfig-options/log-options2.js`);
                expect(err).toBe(null);
                const { options, config } = JSON.parse(stdout);
                expect(config.options.typeRoots).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
                ]);
                expect(config.options.types).toEqual(['flags-types']);
                expect(options.pretty).toBe(undefined);
                expect(options.skipIgnore).toBe(true);
                expect(options.transpileOnly).toBe(true);
                expect(options.require).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/required1.js'),
                    './tsconfig-options/required2.js',
                ]);
            }));
            test('should have `tsconfig.json` override environment', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
                    env: Object.assign(Object.assign({}, process.env), { TS_NODE_PRETTY: 'true', TS_NODE_SKIP_IGNORE: 'true' }),
                });
                expect(err).toBe(null);
                const { options, config } = JSON.parse(stdout);
                expect(config.options.typeRoots).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
                ]);
                expect(config.options.types).toEqual(['tsconfig-tsnode-types']);
                expect(options.pretty).toBe(true);
                expect(options.skipIgnore).toBe(false);
                expect(options.transpileOnly).toBe(true);
                expect(options.require).toEqual([
                    (0, path_1.join)(helpers_2.TEST_DIR, './tsconfig-options/required1.js'),
                ]);
            }));
            if (semver.gte(helpers_1.ts.version, '3.2.0')) {
                test('should pull ts-node options from extended `tsconfig.json`', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} --show-config --project ./tsconfig-extends/tsconfig.json`);
                    expect(err).toBe(null);
                    const config = JSON.parse(stdout);
                    expect(config['ts-node'].require).toEqual([
                        (0, path_1.resolve)(helpers_2.TEST_DIR, 'tsconfig-extends/other/require-hook.js'),
                    ]);
                    expect(config['ts-node'].scopeDir).toBe((0, path_1.resolve)(helpers_2.TEST_DIR, 'tsconfig-extends/other/scopedir'));
                    expect(config['ts-node'].preferTsExts).toBe(true);
                }));
            }
        });
        test.suite('should use implicit @tsconfig/bases config when one is not loaded from disk', (_test) => {
            const test = _test.context((t) => __awaiter(void 0, void 0, void 0, function* () {
                return ({
                    tempDir: (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'ts-node-spec')),
                });
            }));
            if (semver.gte(helpers_1.ts.version, '3.5.0') &&
                semver.gte(process.versions.node, '14.0.0')) {
                const libAndTarget = semver.gte(process.versions.node, '16.0.0')
                    ? 'es2021'
                    : 'es2020';
                test('implicitly uses @tsconfig/node14 or @tsconfig/node16 compilerOptions when both TS and node versions support it', (t) => __awaiter(void 0, void 0, void 0, function* () {
                    // node14 and node16 configs are identical, hence the "or"
                    const { context: { tempDir }, } = t;
                    const { err: err1, stdout: stdout1, stderr: stderr1, } = yield exec(`${helpers_2.BIN_PATH} --showConfig`, { cwd: tempDir });
                    expect(err1).toBe(null);
                    t.like(JSON.parse(stdout1), {
                        compilerOptions: {
                            target: libAndTarget,
                            lib: [libAndTarget],
                        },
                    });
                    const { err: err2, stdout: stdout2, stderr: stderr2, } = yield exec(`${helpers_2.BIN_PATH} -pe 10n`, { cwd: tempDir });
                    expect(err2).toBe(null);
                    expect(stdout2).toBe('10n\n');
                }));
            }
            else {
                test('implicitly uses @tsconfig/* lower than node14 (node12) when either TS or node versions do not support @tsconfig/node14', ({ context: { tempDir }, }) => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout, stderr } = yield exec(`${helpers_2.BIN_PATH} -pe 10n`, {
                        cwd: tempDir,
                    });
                    expect(err).not.toBe(null);
                    expect(stderr).toMatch(/BigInt literals are not available when targeting lower than|error TS2304: Cannot find name 'n'/);
                }));
            }
            test('implicitly loads @types/node even when not installed within local directory', ({ context: { tempDir }, }) => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${helpers_2.BIN_PATH} -pe process.env.foo`, {
                    cwd: tempDir,
                    env: Object.assign(Object.assign({}, process.env), { foo: 'hello world' }),
                });
                expect(err).toBe(null);
                expect(stdout).toBe('hello world\n');
            }));
            test('implicitly loads local @types/node', ({ context: { tempDir }, }) => __awaiter(void 0, void 0, void 0, function* () {
                yield helpers_2.xfs.copyPromise(fslib_1.npath.toPortablePath(tempDir), fslib_1.npath.toPortablePath((0, path_1.join)(helpers_2.TEST_DIR, 'local-types-node')));
                const { err, stdout, stderr } = yield exec(`${helpers_2.BIN_PATH} -pe process.env.foo`, {
                    cwd: tempDir,
                    env: Object.assign(Object.assign({}, process.env), { foo: 'hello world' }),
                });
                expect(err).not.toBe(null);
                expect(stderr).toMatch("Property 'env' does not exist on type 'LocalNodeTypes_Process'");
            }));
        });
        if (semver.gte(helpers_1.ts.version, '3.2.0')) {
            test.suite('should bundle @tsconfig/bases to be used in your own tsconfigs', (test) => {
                const macro = test.macro((nodeVersion) => (t) => __awaiter(void 0, void 0, void 0, function* () {
                    const config = require(`@tsconfig/${nodeVersion}/tsconfig.json`);
                    const { err, stdout, stderr } = yield exec(`${helpers_2.BIN_PATH} --showConfig -e 10n`, {
                        cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'tsconfig-bases', nodeVersion),
                    });
                    expect(err).toBe(null);
                    t.like(JSON.parse(stdout), {
                        compilerOptions: {
                            target: config.compilerOptions.target,
                            lib: config.compilerOptions.lib,
                        },
                    });
                }));
                test(`ts-node/node10/tsconfig.json`, macro, 'node10');
                test(`ts-node/node12/tsconfig.json`, macro, 'node12');
                test(`ts-node/node14/tsconfig.json`, macro, 'node14');
                test(`ts-node/node16/tsconfig.json`, macro, 'node16');
            });
        }
        test.suite('compiler host', (test) => {
            test('should execute cli', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --compiler-host hello-world`);
                expect(err).toBe(null);
                expect(stdout).toBe('Hello, world!\n');
            }));
        });
        test('should transpile files inside a node_modules directory when not ignored', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout, stderr } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} from-node-modules/from-node-modules`);
            if (err)
                throw new Error(`Unexpected error: ${err}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
            expect(JSON.parse(stdout)).toEqual({
                external: {
                    tsmri: { name: 'typescript-module-required-internally' },
                    jsmri: { name: 'javascript-module-required-internally' },
                    tsmii: { name: 'typescript-module-imported-internally' },
                    jsmii: { name: 'javascript-module-imported-internally' },
                },
                tsmie: { name: 'typescript-module-imported-externally' },
                jsmie: { name: 'javascript-module-imported-externally' },
                tsmre: { name: 'typescript-module-required-externally' },
                jsmre: { name: 'javascript-module-required-externally' },
            });
        }));
        test.suite('should respect maxNodeModulesJsDepth', (test) => {
            test('for unscoped modules', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} maxnodemodulesjsdepth`);
                expect(err).not.toBe(null);
                expect(stderr.replace(/\r\n/g, '\n')).toMatch('TSError: ⨯ Unable to compile TypeScript:\n' +
                    "maxnodemodulesjsdepth/other.ts(4,7): error TS2322: Type 'string' is not assignable to type 'boolean'.\n" +
                    '\n');
            }));
            test('for @scoped modules', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} maxnodemodulesjsdepth-scoped`);
                expect(err).not.toBe(null);
                expect(stderr.replace(/\r\n/g, '\n')).toMatch('TSError: ⨯ Unable to compile TypeScript:\n' +
                    "maxnodemodulesjsdepth-scoped/other.ts(7,7): error TS2322: Type 'string' is not assignable to type 'boolean'.\n" +
                    '\n');
            }));
        });
        if (semver.gte(helpers_1.ts.version, '3.2.0')) {
            test('--show-config should log resolved configuration', (t) => __awaiter(void 0, void 0, void 0, function* () {
                function native(path) {
                    return path.replace(/\/|\\/g, path_1.sep);
                }
                function posix(path) {
                    return path.replace(/\/|\\/g, '/');
                }
                const { err, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --showConfig`);
                expect(err).toBe(null);
                t.is(stdout, JSON.stringify({
                    'ts-node': {
                        cwd: native(`${helpers_2.ROOT_DIR}/tests`),
                        projectSearchDir: native(`${helpers_2.ROOT_DIR}/tests`),
                        project: native(`${helpers_2.ROOT_DIR}/tests/tsconfig.json`),
                        require: [],
                    },
                    compilerOptions: {
                        target: 'es6',
                        jsx: 'react',
                        noEmit: false,
                        strict: true,
                        typeRoots: [
                            posix(`${helpers_2.ROOT_DIR}/tests/typings`),
                            posix(`${helpers_2.ROOT_DIR}/node_modules/@types`),
                        ],
                        sourceMap: true,
                        inlineSourceMap: false,
                        inlineSources: true,
                        declaration: false,
                        outDir: './.ts-node',
                        module: 'commonjs',
                    },
                }, null, 2) + '\n');
            }));
        }
        else {
            test('--show-config should log error message when used with old typescript versions', (t) => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stderr } = yield exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --showConfig`);
                expect(err).not.toBe(null);
                expect(stderr).toMatch('Error: --show-config requires');
            }));
        }
        test('should support compiler scope specified via tsconfig.json', (t) => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stderr, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} --project ./scope/c/config/tsconfig.json ./scope/c/index.js`);
            expect(err).toBe(null);
            expect(stdout).toBe(`value\nFailures: 0\n`);
        }));
    });
    test.suite('create', (_test) => {
        const test = _test.context((t) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                service: t.context.tsNodeUnderTest.create({
                    compilerOptions: { target: 'es5' },
                    skipProject: true,
                }),
            };
        }));
        test('should create generic compiler instances', ({ context: { service }, }) => {
            const output = service.compile('const x = 10', 'test.ts');
            expect(output).toMatch('var x = 10;');
        });
        test.suite('should get type information', (test) => {
            test('given position of identifier', ({ context: { service } }) => {
                expect(service.getTypeInfo('/**jsdoc here*/const x = 10', 'test.ts', 21)).toEqual({
                    comment: 'jsdoc here',
                    name: 'const x: 10',
                });
            });
            test('given position that does not point to an identifier', ({ context: { service }, }) => {
                expect(service.getTypeInfo('/**jsdoc here*/const x = 10', 'test.ts', 0)).toEqual({
                    comment: '',
                    name: '',
                });
            });
        });
    });
    test.suite('issue #1098', (test) => {
        function testIgnored(ignored, allowed, disallowed) {
            for (const ext of allowed) {
                // should accept ${ext} files
                expect(ignored((0, path_1.join)(helpers_2.DIST_DIR, `index${ext}`))).toBe(false);
            }
            for (const ext of disallowed) {
                // should ignore ${ext} files
                expect(ignored((0, path_1.join)(helpers_2.DIST_DIR, `index${ext}`))).toBe(true);
            }
        }
        test('correctly filters file extensions from the compiler when allowJs=false and jsx=false', (t) => {
            const { ignored } = t.context.tsNodeUnderTest.create({
                compilerOptions: {},
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.d.ts'], ['.js', '.tsx', '.jsx', '.mjs', '.cjs', '.xyz', '']);
        });
        test('correctly filters file extensions from the compiler when allowJs=true and jsx=false', (t) => {
            const { ignored } = t.context.tsNodeUnderTest.create({
                compilerOptions: { allowJs: true },
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.js', '.d.ts'], ['.tsx', '.jsx', '.mjs', '.cjs', '.xyz', '']);
        });
        test('correctly filters file extensions from the compiler when allowJs=false and jsx=true', (t) => {
            const { ignored } = t.context.tsNodeUnderTest.create({
                compilerOptions: { allowJs: false, jsx: 'preserve' },
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.tsx', '.d.ts'], ['.js', '.jsx', '.mjs', '.cjs', '.xyz', '']);
        });
        test('correctly filters file extensions from the compiler when allowJs=true and jsx=true', (t) => {
            const { ignored } = t.context.tsNodeUnderTest.create({
                compilerOptions: { allowJs: true, jsx: 'preserve' },
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.tsx', '.js', '.jsx', '.d.ts'], ['.mjs', '.cjs', '.xyz', '']);
        });
    });
    test.suite('esm', (test) => {
        if (semver.gte(process.version, '12.16.0')) {
            test('should compile and execute as ESM', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} index.ts`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm'),
                });
                expect(err).toBe(null);
                expect(stdout).toBe('foo bar baz biff libfoo\n');
            }));
            test('should use source maps', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} "throw error.ts"`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm'),
                });
                expect(err).not.toBe(null);
                expect(err.message).toMatch([
                    `${(0, url_1.pathToFileURL)((0, path_1.join)(helpers_2.TEST_DIR, './esm/throw error.ts'))
                        .toString()
                        .replace(/%20/g, ' ')}:100`,
                    "  bar() { throw new Error('this is a demo'); }",
                    '                ^',
                    'Error: this is a demo',
                ].join('\n'));
            }));
            test.suite('supports experimental-specifier-resolution=node', (test) => {
                test('via --experimental-specifier-resolution', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout, } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} --experimental-specifier-resolution=node index.ts`, { cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-node-resolver') });
                    expect(err).toBe(null);
                    expect(stdout).toBe('foo bar baz biff libfoo\n');
                }));
                test('via --es-module-specifier-resolution alias', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout, } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} ${helpers_2.EXPERIMENTAL_MODULES_FLAG} --es-module-specifier-resolution=node index.ts`, { cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-node-resolver') });
                    expect(err).toBe(null);
                    expect(stdout).toBe('foo bar baz biff libfoo\n');
                }));
                test('via NODE_OPTIONS', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} index.ts`, {
                        cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-node-resolver'),
                        env: Object.assign(Object.assign({}, process.env), { NODE_OPTIONS: `${helpers_2.EXPERIMENTAL_MODULES_FLAG} --experimental-specifier-resolution=node` }),
                    });
                    expect(err).toBe(null);
                    expect(stdout).toBe('foo bar baz biff libfoo\n');
                }));
            });
            test('throws ERR_REQUIRE_ESM when attempting to require() an ESM script when ESM loader is enabled', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stderr } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} ./index.js`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-err-require-esm'),
                });
                expect(err).not.toBe(null);
                expect(stderr).toMatch('Error [ERR_REQUIRE_ESM]: Must use import to load ES Module:');
            }));
            test('defers to fallback loaders when URL should not be handled by ts-node', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} index.mjs`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-import-http-url'),
                });
                expect(err).not.toBe(null);
                // expect error from node's default resolver
                expect(stderr).toMatch(/Error \[ERR_UNSUPPORTED_ESM_URL_SCHEME\]:.*(?:\n.*){0,1}\n *at defaultResolve/);
            }));
            test('should bypass import cache when changing search params', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} index.ts`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-import-cache'),
                });
                expect(err).toBe(null);
                expect(stdout).toBe('log1\nlog2\nlog2\n');
            }));
            test('should support transpile only mode via dedicated loader entrypoint', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT}/transpile-only index.ts`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-transpile-only'),
                });
                expect(err).toBe(null);
                expect(stdout).toBe('');
            }));
            test('should throw type errors without transpile-only enabled', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} index.ts`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-transpile-only'),
                });
                if (err === null) {
                    throw new Error('Command was expected to fail, but it succeeded.');
                }
                expect(err.message).toMatch('Unable to compile TypeScript');
                expect(err.message).toMatch(new RegExp("TS2345: Argument of type '(?:number|1101)' is not assignable to parameter of type 'string'\\."));
                expect(err.message).toMatch(new RegExp("TS2322: Type '(?:\"hello world\"|string)' is not assignable to type 'number'\\."));
                expect(stdout).toBe('');
            }));
            function runModuleTypeTest(project, ext) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { err, stderr, stdout } = yield exec(`${helpers_2.CMD_ESM_LOADER_WITHOUT_PROJECT} ./module-types/${project}/test.${ext}`, {
                        env: Object.assign(Object.assign({}, process.env), { TS_NODE_PROJECT: `./module-types/${project}/tsconfig.json` }),
                    });
                    expect(err).toBe(null);
                    expect(stdout).toBe(`Failures: 0\n`);
                });
            }
            test('moduleTypes should allow importing CJS in an otherwise ESM project', (t) => __awaiter(void 0, void 0, void 0, function* () {
                // A notable case where you can use ts-node's CommonJS loader, not the ESM loader, in an ESM project:
                // when loading a webpack.config.ts or similar config
                const { err, stderr, stdout } = yield exec(`${helpers_2.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} --project ./module-types/override-to-cjs/tsconfig.json ./module-types/override-to-cjs/test-webpack-config.cjs`);
                expect(err).toBe(null);
                expect(stdout).toBe(``);
                yield runModuleTypeTest('override-to-cjs', 'cjs');
                if (semver.gte(process.version, '14.13.1'))
                    yield runModuleTypeTest('override-to-cjs', 'mjs');
            }));
            test('moduleTypes should allow importing ESM in an otherwise CJS project', (t) => __awaiter(void 0, void 0, void 0, function* () {
                yield runModuleTypeTest('override-to-esm', 'cjs');
                // Node 14.13.0 has a bug(?) where it checks for ESM-only syntax *before* we transform the code.
                if (semver.gte(process.version, '14.13.1'))
                    yield runModuleTypeTest('override-to-esm', 'mjs');
            }));
        }
        if (semver.gte(process.version, '12.0.0')) {
            test('throws ERR_REQUIRE_ESM when attempting to require() an ESM script when ESM loader is *not* enabled and node version is >= 12', () => __awaiter(void 0, void 0, void 0, function* () {
                // Node versions >= 12 support package.json "type" field and so will throw an error when attempting to load ESM as CJS
                const { err, stderr } = yield exec(`${helpers_2.BIN_PATH} ./index.js`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-err-require-esm'),
                });
                expect(err).not.toBe(null);
                expect(stderr).toMatch('Error [ERR_REQUIRE_ESM]: Must use import to load ES Module:');
            }));
        }
        else {
            test('Loads as CommonJS when attempting to require() an ESM script when ESM loader is *not* enabled and node version is < 12', () => __awaiter(void 0, void 0, void 0, function* () {
                // Node versions less than 12 do not support package.json "type" field and so will load ESM as CommonJS
                const { err, stdout } = yield exec(`${helpers_2.BIN_PATH} ./index.js`, {
                    cwd: (0, path_1.join)(helpers_2.TEST_DIR, './esm-err-require-esm'),
                });
                expect(err).toBe(null);
                expect(stdout).toMatch('CommonJS');
            }));
        }
    });
});
//# sourceMappingURL=index.spec.js.map