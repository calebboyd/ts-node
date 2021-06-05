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
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const path_1 = require("path");
const os_1 = require("os");
const semver = require("semver");
const ts = require("typescript");
const proxyquire = require("proxyquire");
const fs = require("fs");
const fs_1 = require("fs");
const fslib_1 = require("@yarnpkg/fslib");
const promisify = require("util.promisify");
const rimraf_1 = require("rimraf");
const createRequire = require('create-require');
const url_1 = require("url");
const stream_1 = require("stream");
const getStream = require("get-stream");
const lodash_1 = require("lodash");
const xfs = new fslib_1.NodeFS(fs);
function exec(cmd, opts = {}) {
    let childProcess;
    return Object.assign(new Promise((resolve, reject) => {
        childProcess = child_process_1.exec(cmd, Object.assign({ cwd: TEST_DIR }, opts), (error, stdout, stderr) => {
            resolve({ err: error, stdout, stderr });
        });
    }), {
        child: childProcess,
    });
}
const ROOT_DIR = path_1.resolve(__dirname, '../..');
const DIST_DIR = path_1.resolve(__dirname, '..');
const TEST_DIR = path_1.join(__dirname, '../../tests');
const PROJECT = path_1.join(TEST_DIR, 'tsconfig.json');
const BIN_PATH = path_1.join(TEST_DIR, 'node_modules/.bin/ts-node');
const BIN_SCRIPT_PATH = path_1.join(TEST_DIR, 'node_modules/.bin/ts-node-script');
const BIN_CWD_PATH = path_1.join(TEST_DIR, 'node_modules/.bin/ts-node-cwd');
const SOURCE_MAP_REGEXP = /\/\/# sourceMappingURL=data:application\/json;charset=utf\-8;base64,[\w\+]+=*$/;
// `createRequire` does not exist on older node versions
const testsDirRequire = createRequire(path_1.join(TEST_DIR, 'index.js'));
// Set after ts-node is installed locally
let { register, create, VERSION, createRepl } = {};
// Pack and install ts-node locally, necessary to test package "exports"
testlib_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    rimraf_1.sync(path_1.join(TEST_DIR, 'node_modules'));
    yield promisify(child_process_1.exec)(`npm install`, { cwd: TEST_DIR });
    const packageLockPath = path_1.join(TEST_DIR, 'package-lock.json');
    fs_1.existsSync(packageLockPath) && fs_1.unlinkSync(packageLockPath);
    ({ register, create, VERSION, createRepl } = testsDirRequire('ts-node'));
}));
testlib_1.test.suite('ts-node', (test) => {
    const cmd = `"${BIN_PATH}" --project "${PROJECT}"`;
    const cmdNoProject = `"${BIN_PATH}"`;
    test('should export the correct version', () => {
        chai_1.expect(VERSION).to.equal(require('../../package.json').version);
    });
    test('should export all CJS entrypoints', () => {
        // Ensure our package.json "exports" declaration allows `require()`ing all our entrypoints
        // https://github.com/TypeStrong/ts-node/pull/1026
        testsDirRequire.resolve('ts-node');
        // only reliably way to ask node for the root path of a dependency is Path.resolve(require.resolve('ts-node/package'), '..')
        testsDirRequire.resolve('ts-node/package');
        testsDirRequire.resolve('ts-node/package.json');
        // All bin entrypoints for people who need to augment our CLI: `node -r otherstuff ./node_modules/ts-node/dist/bin`
        testsDirRequire.resolve('ts-node/dist/bin');
        testsDirRequire.resolve('ts-node/dist/bin.js');
        testsDirRequire.resolve('ts-node/dist/bin-transpile');
        testsDirRequire.resolve('ts-node/dist/bin-transpile.js');
        testsDirRequire.resolve('ts-node/dist/bin-script');
        testsDirRequire.resolve('ts-node/dist/bin-script.js');
        testsDirRequire.resolve('ts-node/dist/bin-cwd');
        testsDirRequire.resolve('ts-node/dist/bin-cwd.js');
        // Must be `require()`able obviously
        testsDirRequire.resolve('ts-node/register');
        testsDirRequire.resolve('ts-node/register/files');
        testsDirRequire.resolve('ts-node/register/transpile-only');
        testsDirRequire.resolve('ts-node/register/type-check');
        // `node --loader ts-node/esm`
        testsDirRequire.resolve('ts-node/esm');
        testsDirRequire.resolve('ts-node/esm.mjs');
        testsDirRequire.resolve('ts-node/esm/transpile-only');
        testsDirRequire.resolve('ts-node/esm/transpile-only.mjs');
        testsDirRequire.resolve('ts-node/transpilers/swc-experimental');
        testsDirRequire.resolve('ts-node/node10/tsconfig.json');
        testsDirRequire.resolve('ts-node/node12/tsconfig.json');
        testsDirRequire.resolve('ts-node/node14/tsconfig.json');
        testsDirRequire.resolve('ts-node/node16/tsconfig.json');
    });
    test.suite('cli', (test) => {
        test('should execute cli', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} hello-world`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, world!\n');
        }));
        test('shows usage via --help', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmdNoProject} --help`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.match(/Usage: ts-node /);
        }));
        test('shows version via -v', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmdNoProject} -v`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout.trim()).to.equal('v' + testsDirRequire('ts-node/package').version);
        }));
        test('shows version of compiler via -vv', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmdNoProject} -vv`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout.trim()).to.equal(`ts-node v${testsDirRequire('ts-node/package').version}\n` +
                `node ${process.version}\n` +
                `compiler v${testsDirRequire('typescript/package').version}`);
        }));
        test('should register via cli', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`node -r ts-node/register hello-world.ts`, {
                cwd: TEST_DIR,
            });
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, world!\n');
        }));
        test('should execute cli with absolute path', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} "${path_1.join(TEST_DIR, 'hello-world')}"`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, world!\n');
        }));
        test('should print scripts', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} -pe "import { example } from './complex/index';example()"`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('example\n');
        }));
        test('should provide registered information globally', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} env`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('object\n');
        }));
        test('should provide registered information on register', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`node -r ts-node/register env.ts`, {
                cwd: TEST_DIR,
            });
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('object\n');
        }));
        if (semver.gte(ts.version, '1.8.0')) {
            test('should allow js', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec([
                    cmd,
                    '-O "{\\"allowJs\\":true}"',
                    '-pe "import { main } from \'./allow-js/run\';main()"',
                ].join(' '));
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('hello world\n');
            }));
            test('should include jsx when `allow-js` true', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec([
                    cmd,
                    '-O "{\\"allowJs\\":true}"',
                    '-pe "import { Foo2 } from \'./allow-js/with-jsx\'; Foo2.sayHi()"',
                ].join(' '));
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('hello world\n');
            }));
        }
        test('should eval code', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} -e "import * as m from './module';console.log(m.example('test'))"`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('TEST\n');
        }));
        test('should import empty files', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} -e "import './empty'"`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('');
        }));
        test('should throw errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} -e "import * as m from './module';console.log(m.example(123))"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.match(new RegExp("TS2345: Argument of type '(?:number|123)' " +
                "is not assignable to parameter of type 'string'\\."));
        }));
        test('should be able to ignore diagnostic', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} --ignore-diagnostics 2345 -e "import * as m from './module';console.log(m.example(123))"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.match(/TypeError: (?:(?:undefined|foo\.toUpperCase) is not a function|.*has no method \'toUpperCase\')/);
        }));
        test('should work with source maps', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} "throw error"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.contain([
                `${path_1.join(TEST_DIR, 'throw error.ts')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('should work with source maps in --transpile-only mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} --transpile-only "throw error"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.contain([
                `${path_1.join(TEST_DIR, 'throw error.ts')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('eval should work with source maps', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} -pe "import './throw error'"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.contain([
                `${path_1.join(TEST_DIR, 'throw error.ts')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
            ].join('\n'));
        }));
        test('should support transpile only mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} --transpile-only -pe "x"`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.contain('ReferenceError: x is not defined');
        }));
        test('should throw error even in transpileOnly mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`${cmd} --transpile-only -pe "console."`);
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            chai_1.expect(err.message).to.contain('error TS1003: Identifier expected');
        }));
        test('should support third-party transpilers via --transpiler', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmdNoProject} --transpiler ts-node/transpilers/swc-experimental transpile-only-swc`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.contain('Hello World!');
        }));
        test('should support third-party transpilers via tsconfig', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmdNoProject} transpile-only-swc-via-tsconfig`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.contain('Hello World!');
        }));
        test('should pipe into `ts-node` and evaluate', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(cmd);
            execPromise.child.stdin.end("console.log('hello')");
            const { err, stdout } = yield execPromise;
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('hello\n');
        }));
        test('should pipe into `ts-node`', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(`${cmd} -p`);
            execPromise.child.stdin.end('true');
            const { err, stdout } = yield execPromise;
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('true\n');
        }));
        test('should pipe into an eval script', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(`${cmd} --transpile-only -pe "process.stdin.isTTY"`);
            execPromise.child.stdin.end('true');
            const { err, stdout } = yield execPromise;
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('undefined\n');
        }));
        test('should run REPL when --interactive passed and stdin is not a TTY', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(`${cmd} --interactive`);
            execPromise.child.stdin.end('console.log("123")\n');
            const { err, stdout } = yield execPromise;
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('> 123\n' + 'undefined\n' + '> ');
        }));
        test('REPL has command to get type information', () => __awaiter(void 0, void 0, void 0, function* () {
            const execPromise = exec(`${cmd} --interactive`);
            execPromise.child.stdin.end('\nconst a = 123\n.type a');
            const { err, stdout } = yield execPromise;
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal("> 'use strict'\n" + '> undefined\n' + '> const a: 123\n' + '> ');
        }));
        // Serial because it's timing-sensitive
        test.serial('REPL can be created via API', () => __awaiter(void 0, void 0, void 0, function* () {
            const stdin = new stream_1.PassThrough();
            const stdout = new stream_1.PassThrough();
            const stderr = new stream_1.PassThrough();
            const replService = createRepl({
                stdin,
                stdout,
                stderr,
            });
            const service = create(Object.assign(Object.assign({}, replService.evalAwarePartialHost), { project: `${TEST_DIR}/tsconfig.json` }));
            replService.setService(service);
            replService.start();
            stdin.write('\nconst a = 123\n.type a\n');
            stdin.end();
            yield promisify(setTimeout)(1e3);
            stdout.end();
            stderr.end();
            chai_1.expect(yield getStream(stderr)).to.equal('');
            chai_1.expect(yield getStream(stdout)).to.equal("> 'use strict'\n" + '> undefined\n' + '> const a: 123\n' + '> ');
        }));
        test('should support require flags', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} -r ./hello-world -pe "console.log('success')"`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, world!\nsuccess\nundefined\n');
        }));
        test('should support require from node modules', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} -r typescript -e "console.log('success')"`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('success\n');
        }));
        test('should use source maps with react tsx', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} "throw error react tsx.tsx"`);
            chai_1.expect(err).not.to.equal(null);
            chai_1.expect(err.message).to.contain([
                `${path_1.join(TEST_DIR, './throw error react tsx.tsx')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('should use source maps with react tsx in --transpile-only mode', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} --transpile-only "throw error react tsx.tsx"`);
            chai_1.expect(err).not.to.equal(null);
            chai_1.expect(err.message).to.contain([
                `${path_1.join(TEST_DIR, './throw error react tsx.tsx')}:100`,
                "  bar() { throw new Error('this is a demo'); }",
                '                ^',
                'Error: this is a demo',
            ].join('\n'));
        }));
        test('should allow custom typings', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} custom-types`);
            chai_1.expect(err).to.match(/Error: Cannot find module 'does-not-exist'/);
        }));
        test('should preserve `ts-node` context with child process', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} child-process`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, world!\n');
        }));
        test('should import js before ts by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} import-order/compiled`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, JavaScript!\n');
        }));
        const preferTsExtsEntrypoint = semver.gte(process.version, '12.0.0')
            ? 'import-order/compiled'
            : 'import-order/require-compiled';
        test('should import ts before js when --prefer-ts-exts flag is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} --prefer-ts-exts ${preferTsExtsEntrypoint}`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, TypeScript!\n');
        }));
        test('should import ts before js when TS_NODE_PREFER_TS_EXTS env is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} ${preferTsExtsEntrypoint}`, {
                env: Object.assign(Object.assign({}, process.env), { TS_NODE_PREFER_TS_EXTS: 'true' }),
            });
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, TypeScript!\n');
        }));
        test('should ignore .d.ts files', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout } = yield exec(`${cmd} import-order/importer`);
            chai_1.expect(err).to.equal(null);
            chai_1.expect(stdout).to.equal('Hello, World!\n');
        }));
        test.suite('issue #884', (test) => {
            test('should compile', (t) => __awaiter(void 0, void 0, void 0, function* () {
                // TODO disabled because it consistently fails on Windows on TS 2.7
                if (process.platform === 'win32' &&
                    semver.satisfies(ts.version, '2.7')) {
                    t.log('Skipping');
                    return;
                }
                else {
                    const { err, stdout } = yield exec(`"${BIN_PATH}" --project issue-884/tsconfig.json issue-884`);
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(stdout).to.equal('');
                }
            }));
        });
        test.suite('issue #986', (test) => {
            test('should not compile', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`"${BIN_PATH}" --project issue-986/tsconfig.json issue-986`);
                chai_1.expect(err).not.to.equal(null);
                chai_1.expect(stderr).to.contain("Cannot find name 'TEST'"); // TypeScript error.
                chai_1.expect(stdout).to.equal('');
            }));
            test('should compile with `--files`', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`"${BIN_PATH}" --files --project issue-986/tsconfig.json issue-986`);
                chai_1.expect(err).not.to.equal(null);
                chai_1.expect(stderr).to.contain('ReferenceError: TEST is not defined'); // Runtime error.
                chai_1.expect(stdout).to.equal('');
            }));
        });
        if (semver.gte(ts.version, '2.7.0')) {
            test('should locate tsconfig relative to entry-point by default', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_PATH} ../a/index`, {
                    cwd: path_1.join(TEST_DIR, 'cwd-and-script-mode/b'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.match(/plugin-a/);
            }));
            test('should locate tsconfig relative to entry-point via ts-node-script', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_SCRIPT_PATH} ../a/index`, {
                    cwd: path_1.join(TEST_DIR, 'cwd-and-script-mode/b'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.match(/plugin-a/);
            }));
            test('should locate tsconfig relative to entry-point with --script-mode', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_PATH} --script-mode ../a/index`, {
                    cwd: path_1.join(TEST_DIR, 'cwd-and-script-mode/b'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.match(/plugin-a/);
            }));
            test('should locate tsconfig relative to cwd via ts-node-cwd', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_CWD_PATH} ../a/index`, {
                    cwd: path_1.join(TEST_DIR, 'cwd-and-script-mode/b'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.match(/plugin-b/);
            }));
            test('should locate tsconfig relative to cwd in --cwd-mode', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_PATH} --cwd-mode ../a/index`, { cwd: path_1.join(TEST_DIR, 'cwd-and-script-mode/b') });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.match(/plugin-b/);
            }));
            test('should locate tsconfig relative to realpath, not symlink, when entrypoint is a symlink', (t) => __awaiter(void 0, void 0, void 0, function* () {
                if (fs_1.lstatSync(path_1.join(TEST_DIR, 'main-realpath/symlink/symlink.tsx')).isSymbolicLink()) {
                    const { err, stdout } = yield exec(`${BIN_PATH} main-realpath/symlink/symlink.tsx`);
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(stdout).to.equal('');
                }
                else {
                    t.log('Skipping');
                    return;
                }
            }));
        }
        test.suite('should read ts-node options from tsconfig.json', (test) => {
            const BIN_EXEC = `"${BIN_PATH}" --project tsconfig-options/tsconfig.json`;
            test('should override compiler options from env', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
                    env: Object.assign(Object.assign({}, process.env), { TS_NODE_COMPILER_OPTIONS: '{"typeRoots": ["env-typeroots"]}' }),
                });
                chai_1.expect(err).to.equal(null);
                const { config } = JSON.parse(stdout);
                chai_1.expect(config.options.typeRoots).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/env-typeroots').replace(/\\/g, '/'),
                ]);
            }));
            test('should use options from `tsconfig.json`', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`);
                chai_1.expect(err).to.equal(null);
                const { options, config } = JSON.parse(stdout);
                chai_1.expect(config.options.typeRoots).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
                ]);
                chai_1.expect(config.options.types).to.deep.equal(['tsconfig-tsnode-types']);
                chai_1.expect(options.pretty).to.equal(undefined);
                chai_1.expect(options.skipIgnore).to.equal(false);
                chai_1.expect(options.transpileOnly).to.equal(true);
                chai_1.expect(options.require).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/required1.js'),
                ]);
            }));
            test('should have flags override / merge with `tsconfig.json`', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} --skip-ignore --compiler-options "{\\"types\\":[\\"flags-types\\"]}" --require ./tsconfig-options/required2.js tsconfig-options/log-options2.js`);
                chai_1.expect(err).to.equal(null);
                const { options, config } = JSON.parse(stdout);
                chai_1.expect(config.options.typeRoots).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
                ]);
                chai_1.expect(config.options.types).to.deep.equal(['flags-types']);
                chai_1.expect(options.pretty).to.equal(undefined);
                chai_1.expect(options.skipIgnore).to.equal(true);
                chai_1.expect(options.transpileOnly).to.equal(true);
                chai_1.expect(options.require).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/required1.js'),
                    './tsconfig-options/required2.js',
                ]);
            }));
            test('should have `tsconfig.json` override environment', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${BIN_EXEC} tsconfig-options/log-options1.js`, {
                    env: Object.assign(Object.assign({}, process.env), { TS_NODE_PRETTY: 'true', TS_NODE_SKIP_IGNORE: 'true' }),
                });
                chai_1.expect(err).to.equal(null);
                const { options, config } = JSON.parse(stdout);
                chai_1.expect(config.options.typeRoots).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/tsconfig-typeroots').replace(/\\/g, '/'),
                ]);
                chai_1.expect(config.options.types).to.deep.equal(['tsconfig-tsnode-types']);
                chai_1.expect(options.pretty).to.equal(true);
                chai_1.expect(options.skipIgnore).to.equal(false);
                chai_1.expect(options.transpileOnly).to.equal(true);
                chai_1.expect(options.require).to.deep.equal([
                    path_1.join(TEST_DIR, './tsconfig-options/required1.js'),
                ]);
            }));
        });
        test.suite('should use implicit @tsconfig/bases config when one is not loaded from disk', (_test) => {
            const test = _test.context((t) => __awaiter(void 0, void 0, void 0, function* () {
                return ({
                    tempDir: fs_1.mkdtempSync(path_1.join(os_1.tmpdir(), 'ts-node-spec')),
                });
            }));
            if (semver.gte(ts.version, '3.5.0') &&
                semver.gte(process.versions.node, '14.0.0')) {
                test('implicitly uses @tsconfig/node14 or @tsconfig/node16 compilerOptions when both TS and node versions support it', (t) => __awaiter(void 0, void 0, void 0, function* () {
                    // node14 and node16 configs are identical, hence the "or"
                    const { context: { tempDir }, } = t;
                    const { err: err1, stdout: stdout1, stderr: stderr1, } = yield exec(`${BIN_PATH} --showConfig`, { cwd: tempDir });
                    chai_1.expect(err1).to.equal(null);
                    t.like(JSON.parse(stdout1), {
                        compilerOptions: {
                            target: 'es2020',
                            lib: ['es2020'],
                        },
                    });
                    const { err: err2, stdout: stdout2, stderr: stderr2, } = yield exec(`${BIN_PATH} -pe 10n`, { cwd: tempDir });
                    chai_1.expect(err2).to.equal(null);
                    chai_1.expect(stdout2).to.equal('10n\n');
                }));
            }
            else {
                test('implicitly uses @tsconfig/* lower than node14 (node12) when either TS or node versions do not support @tsconfig/node14', ({ context: { tempDir }, }) => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout, stderr } = yield exec(`${BIN_PATH} -pe 10n`, {
                        cwd: tempDir,
                    });
                    chai_1.expect(err).to.not.equal(null);
                    chai_1.expect(stderr).to.match(/BigInt literals are not available when targeting lower than|error TS2304: Cannot find name 'n'/);
                }));
            }
            test('implicitly loads @types/node even when not installed within local directory', ({ context: { tempDir }, }) => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${BIN_PATH} -pe process.env.foo`, {
                    cwd: tempDir,
                    env: Object.assign(Object.assign({}, process.env), { foo: 'hello world' }),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('hello world\n');
            }));
            test('implicitly loads local @types/node', ({ context: { tempDir }, }) => __awaiter(void 0, void 0, void 0, function* () {
                yield xfs.copyPromise(fslib_1.npath.toPortablePath(tempDir), fslib_1.npath.toPortablePath(path_1.join(TEST_DIR, 'local-types-node')));
                const { err, stdout, stderr } = yield exec(`${BIN_PATH} -pe process.env.foo`, {
                    cwd: tempDir,
                    env: Object.assign(Object.assign({}, process.env), { foo: 'hello world' }),
                });
                chai_1.expect(err).to.not.equal(null);
                chai_1.expect(stderr).to.contain("Property 'env' does not exist on type 'LocalNodeTypes_Process'");
            }));
        });
        if (semver.gte(ts.version, '3.2.0')) {
            test.suite('should bundle @tsconfig/bases to be used in your own tsconfigs', (test) => {
                const macro = test.macro((nodeVersion) => (t) => __awaiter(void 0, void 0, void 0, function* () {
                    const config = require(`@tsconfig/${nodeVersion}/tsconfig.json`);
                    const { err, stdout, stderr } = yield exec(`${BIN_PATH} --showConfig -e 10n`, {
                        cwd: path_1.join(TEST_DIR, 'tsconfig-bases', nodeVersion),
                    });
                    chai_1.expect(err).to.equal(null);
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
                const { err, stdout } = yield exec(`${cmd} --compiler-host hello-world`);
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('Hello, world!\n');
            }));
        });
        test('should transpile files inside a node_modules directory when not ignored', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err, stdout, stderr } = yield exec(`${cmdNoProject} from-node-modules/from-node-modules`);
            if (err)
                throw new Error(`Unexpected error: ${err}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
            chai_1.expect(JSON.parse(stdout)).to.deep.equal({
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
                const { err, stdout, stderr } = yield exec(`${cmdNoProject} maxnodemodulesjsdepth`);
                chai_1.expect(err).to.not.equal(null);
                chai_1.expect(stderr.replace(/\r\n/g, '\n')).to.contain('TSError: ⨯ Unable to compile TypeScript:\n' +
                    "maxnodemodulesjsdepth/other.ts(4,7): error TS2322: Type 'string' is not assignable to type 'boolean'.\n" +
                    '\n');
            }));
            test('for @scoped modules', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${cmdNoProject} maxnodemodulesjsdepth-scoped`);
                chai_1.expect(err).to.not.equal(null);
                chai_1.expect(stderr.replace(/\r\n/g, '\n')).to.contain('TSError: ⨯ Unable to compile TypeScript:\n' +
                    "maxnodemodulesjsdepth-scoped/other.ts(7,7): error TS2322: Type 'string' is not assignable to type 'boolean'.\n" +
                    '\n');
            }));
        });
        if (semver.gte(ts.version, '3.2.0')) {
            test('--show-config should log resolved configuration', (t) => __awaiter(void 0, void 0, void 0, function* () {
                function native(path) {
                    return path.replace(/\/|\\/g, path_1.sep);
                }
                function posix(path) {
                    return path.replace(/\/|\\/g, '/');
                }
                const { err, stdout } = yield exec(`${cmd} --showConfig`);
                chai_1.expect(err).to.equal(null);
                t.is(stdout, JSON.stringify({
                    compilerOptions: {
                        target: 'es6',
                        jsx: 'react',
                        noEmit: false,
                        strict: true,
                        typeRoots: [
                            posix(`${ROOT_DIR}/tests/typings`),
                            posix(`${ROOT_DIR}/node_modules/@types`),
                        ],
                        sourceMap: true,
                        inlineSourceMap: false,
                        inlineSources: true,
                        declaration: false,
                        outDir: './.ts-node',
                        module: 'commonjs',
                    },
                    'ts-node': {
                        cwd: native(`${ROOT_DIR}/tests`),
                        projectSearchDir: native(`${ROOT_DIR}/tests`),
                        project: native(`${ROOT_DIR}/tests/tsconfig.json`),
                        require: [],
                    },
                }, null, 2) + '\n');
            }));
        }
        else {
            test('--show-config should log error message when used with old typescript versions', (t) => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stderr } = yield exec(`${cmd} --showConfig`);
                chai_1.expect(err).to.not.equal(null);
                chai_1.expect(stderr).to.contain('Error: --show-config requires');
            }));
        }
    });
    test.suite('register', (_test) => {
        const test = _test.context(lodash_1.once(() => __awaiter(void 0, void 0, void 0, function* () {
            return {
                registered: register({
                    project: PROJECT,
                    compilerOptions: {
                        jsx: 'preserve',
                    },
                }),
                moduleTestPath: require.resolve('../../tests/module'),
            };
        })));
        test.beforeEach(({ context: { registered } }) => __awaiter(void 0, void 0, void 0, function* () {
            // Re-enable project for every test.
            registered.enabled(true);
        }));
        test.runSerially();
        test('should be able to require typescript', ({ context: { moduleTestPath }, }) => {
            const m = require(moduleTestPath);
            chai_1.expect(m.example('foo')).to.equal('FOO');
        });
        test('should support dynamically disabling', ({ context: { registered, moduleTestPath }, }) => {
            delete require.cache[moduleTestPath];
            chai_1.expect(registered.enabled(false)).to.equal(false);
            chai_1.expect(() => require(moduleTestPath)).to.throw(/Unexpected token/);
            delete require.cache[moduleTestPath];
            chai_1.expect(registered.enabled()).to.equal(false);
            chai_1.expect(() => require(moduleTestPath)).to.throw(/Unexpected token/);
            delete require.cache[moduleTestPath];
            chai_1.expect(registered.enabled(true)).to.equal(true);
            chai_1.expect(() => require(moduleTestPath)).to.not.throw();
            delete require.cache[moduleTestPath];
            chai_1.expect(registered.enabled()).to.equal(true);
            chai_1.expect(() => require(moduleTestPath)).to.not.throw();
        });
        if (semver.gte(ts.version, '2.7.0')) {
            test('should support compiler scopes', ({ context: { registered, moduleTestPath }, }) => {
                const calls = [];
                registered.enabled(false);
                const compilers = [
                    register({
                        projectSearchDir: path_1.join(TEST_DIR, 'scope/a'),
                        scopeDir: path_1.join(TEST_DIR, 'scope/a'),
                        scope: true,
                    }),
                    register({
                        projectSearchDir: path_1.join(TEST_DIR, 'scope/a'),
                        scopeDir: path_1.join(TEST_DIR, 'scope/b'),
                        scope: true,
                    }),
                ];
                compilers.forEach((c) => {
                    const old = c.compile;
                    c.compile = (code, fileName, lineOffset) => {
                        calls.push(fileName);
                        return old(code, fileName, lineOffset);
                    };
                });
                try {
                    chai_1.expect(require('../../tests/scope/a').ext).to.equal('.ts');
                    chai_1.expect(require('../../tests/scope/b').ext).to.equal('.ts');
                }
                finally {
                    compilers.forEach((c) => c.enabled(false));
                }
                chai_1.expect(calls).to.deep.equal([
                    path_1.join(TEST_DIR, 'scope/a/index.ts'),
                    path_1.join(TEST_DIR, 'scope/b/index.ts'),
                ]);
                delete require.cache[moduleTestPath];
                chai_1.expect(() => require(moduleTestPath)).to.throw();
            });
        }
        test('should compile through js and ts', () => {
            const m = require('../../tests/complex');
            chai_1.expect(m.example()).to.equal('example');
        });
        test('should work with proxyquire', () => {
            const m = proxyquire('../../tests/complex', {
                './example': 'hello',
            });
            chai_1.expect(m.example()).to.equal('hello');
        });
        test('should work with `require.cache`', () => {
            const { example1, example2 } = require('../../tests/require-cache');
            chai_1.expect(example1).to.not.equal(example2);
        });
        test('should use source maps', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                require('../../tests/throw error');
            }
            catch (error) {
                chai_1.expect(error.stack).to.contain([
                    'Error: this is a demo',
                    `    at Foo.bar (${path_1.join(TEST_DIR, './throw error.ts')}:100:17)`,
                ].join('\n'));
            }
        }));
        test.suite('JSX preserve', (test) => {
            let old;
            let compiled;
            test.runSerially();
            test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                old = require.extensions['.tsx'];
                require.extensions['.tsx'] = (m, fileName) => {
                    const _compile = m._compile;
                    m._compile = function (code, fileName) {
                        compiled = code;
                        return _compile.call(this, code, fileName);
                    };
                    return old(m, fileName);
                };
            }));
            test('should use source maps', (t) => __awaiter(void 0, void 0, void 0, function* () {
                t.teardown(() => {
                    require.extensions['.tsx'] = old;
                });
                try {
                    require('../../tests/with-jsx.tsx');
                }
                catch (error) {
                    chai_1.expect(error.stack).to.contain('SyntaxError: Unexpected token');
                }
                chai_1.expect(compiled).to.match(SOURCE_MAP_REGEXP);
            }));
        });
    });
    test.suite('create', (_test) => {
        const test = _test.context((t) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                service: create({
                    compilerOptions: { target: 'es5' },
                    skipProject: true,
                }),
            };
        }));
        test('should create generic compiler instances', ({ context: { service }, }) => {
            const output = service.compile('const x = 10', 'test.ts');
            chai_1.expect(output).to.contain('var x = 10;');
        });
        test.suite('should get type information', (test) => {
            test('given position of identifier', ({ context: { service } }) => {
                chai_1.expect(service.getTypeInfo('/**jsdoc here*/const x = 10', 'test.ts', 21)).to.deep.equal({
                    comment: 'jsdoc here',
                    name: 'const x: 10',
                });
            });
            test('given position that does not point to an identifier', ({ context: { service }, }) => {
                chai_1.expect(service.getTypeInfo('/**jsdoc here*/const x = 10', 'test.ts', 0)).to.deep.equal({
                    comment: '',
                    name: '',
                });
            });
        });
    });
    test.suite('issue #1098', (test) => {
        function testIgnored(ignored, allowed, disallowed) {
            for (const ext of allowed) {
                chai_1.expect(ignored(path_1.join(DIST_DIR, `index${ext}`))).equal(false, `should accept ${ext} files`);
            }
            for (const ext of disallowed) {
                chai_1.expect(ignored(path_1.join(DIST_DIR, `index${ext}`))).equal(true, `should ignore ${ext} files`);
            }
        }
        test('correctly filters file extensions from the compiler when allowJs=false and jsx=false', () => {
            const { ignored } = create({ compilerOptions: {}, skipProject: true });
            testIgnored(ignored, ['.ts', '.d.ts'], ['.js', '.tsx', '.jsx', '.mjs', '.cjs', '.xyz', '']);
        });
        test('correctly filters file extensions from the compiler when allowJs=true and jsx=false', () => {
            const { ignored } = create({
                compilerOptions: { allowJs: true },
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.js', '.d.ts'], ['.tsx', '.jsx', '.mjs', '.cjs', '.xyz', '']);
        });
        test('correctly filters file extensions from the compiler when allowJs=false and jsx=true', () => {
            const { ignored } = create({
                compilerOptions: { allowJs: false, jsx: 'preserve' },
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.tsx', '.d.ts'], ['.js', '.jsx', '.mjs', '.cjs', '.xyz', '']);
        });
        test('correctly filters file extensions from the compiler when allowJs=true and jsx=true', () => {
            const { ignored } = create({
                compilerOptions: { allowJs: true, jsx: 'preserve' },
                skipProject: true,
            });
            testIgnored(ignored, ['.ts', '.tsx', '.js', '.jsx', '.d.ts'], ['.mjs', '.cjs', '.xyz', '']);
        });
    });
    test.suite('esm', (test) => {
        const experimentalModulesFlag = semver.gte(process.version, '12.17.0')
            ? ''
            : '--experimental-modules';
        const cmd = `node ${experimentalModulesFlag} --loader ts-node/esm`;
        if (semver.gte(process.version, '12.16.0')) {
            test('should compile and execute as ESM', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${cmd} index.ts`, {
                    cwd: path_1.join(TEST_DIR, './esm'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('foo bar baz biff libfoo\n');
            }));
            test('should use source maps', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${cmd} "throw error.ts"`, {
                    cwd: path_1.join(TEST_DIR, './esm'),
                });
                chai_1.expect(err).not.to.equal(null);
                chai_1.expect(err.message).to.contain([
                    `${url_1.pathToFileURL(path_1.join(TEST_DIR, './esm/throw error.ts'))
                        .toString()
                        .replace(/%20/g, ' ')}:100`,
                    "  bar() { throw new Error('this is a demo'); }",
                    '                ^',
                    'Error: this is a demo',
                ].join('\n'));
            }));
            test.suite('supports experimental-specifier-resolution=node', (test) => {
                test('via --experimental-specifier-resolution', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout, } = yield exec(`${cmd} --experimental-specifier-resolution=node index.ts`, { cwd: path_1.join(TEST_DIR, './esm-node-resolver') });
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(stdout).to.equal('foo bar baz biff libfoo\n');
                }));
                test('via --es-module-specifier-resolution alias', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout, } = yield exec(`${cmd} --experimental-modules --es-module-specifier-resolution=node index.ts`, { cwd: path_1.join(TEST_DIR, './esm-node-resolver') });
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(stdout).to.equal('foo bar baz biff libfoo\n');
                }));
                test('via NODE_OPTIONS', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { err, stdout } = yield exec(`${cmd} index.ts`, {
                        cwd: path_1.join(TEST_DIR, './esm-node-resolver'),
                        env: Object.assign(Object.assign({}, process.env), { NODE_OPTIONS: `${experimentalModulesFlag} --experimental-specifier-resolution=node` }),
                    });
                    chai_1.expect(err).to.equal(null);
                    chai_1.expect(stdout).to.equal('foo bar baz biff libfoo\n');
                }));
            });
            test('throws ERR_REQUIRE_ESM when attempting to require() an ESM script when ESM loader is enabled', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stderr } = yield exec(`${cmd} ./index.js`, {
                    cwd: path_1.join(TEST_DIR, './esm-err-require-esm'),
                });
                chai_1.expect(err).to.not.equal(null);
                chai_1.expect(stderr).to.contain('Error [ERR_REQUIRE_ESM]: Must use import to load ES Module:');
            }));
            test('defers to fallback loaders when URL should not be handled by ts-node', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout, stderr } = yield exec(`${cmd} index.mjs`, {
                    cwd: path_1.join(TEST_DIR, './esm-import-http-url'),
                });
                chai_1.expect(err).to.not.equal(null);
                // expect error from node's default resolver
                chai_1.expect(stderr).to.match(/Error \[ERR_UNSUPPORTED_ESM_URL_SCHEME\]:.*(?:\n.*){0,1}\n *at defaultResolve/);
            }));
            test('should bypass import cache when changing search params', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${cmd} index.ts`, {
                    cwd: path_1.join(TEST_DIR, './esm-import-cache'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('log1\nlog2\nlog2\n');
            }));
            test('should support transpile only mode via dedicated loader entrypoint', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${cmd}/transpile-only index.ts`, {
                    cwd: path_1.join(TEST_DIR, './esm-transpile-only'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.equal('');
            }));
            test('should throw type errors without transpile-only enabled', () => __awaiter(void 0, void 0, void 0, function* () {
                const { err, stdout } = yield exec(`${cmd} index.ts`, {
                    cwd: path_1.join(TEST_DIR, './esm-transpile-only'),
                });
                if (err === null) {
                    throw new Error('Command was expected to fail, but it succeeded.');
                }
                chai_1.expect(err.message).to.contain('Unable to compile TypeScript');
                chai_1.expect(err.message).to.match(new RegExp("TS2345: Argument of type '(?:number|1101)' is not assignable to parameter of type 'string'\\."));
                chai_1.expect(err.message).to.match(new RegExp("TS2322: Type '(?:\"hello world\"|string)' is not assignable to type 'number'\\."));
                chai_1.expect(stdout).to.equal('');
            }));
        }
        if (semver.gte(process.version, '12.0.0')) {
            test('throws ERR_REQUIRE_ESM when attempting to require() an ESM script when ESM loader is *not* enabled and node version is >= 12', () => __awaiter(void 0, void 0, void 0, function* () {
                // Node versions >= 12 support package.json "type" field and so will throw an error when attempting to load ESM as CJS
                const { err, stderr } = yield exec(`${BIN_PATH} ./index.js`, {
                    cwd: path_1.join(TEST_DIR, './esm-err-require-esm'),
                });
                chai_1.expect(err).to.not.equal(null);
                chai_1.expect(stderr).to.contain('Error [ERR_REQUIRE_ESM]: Must use import to load ES Module:');
            }));
        }
        else {
            test('Loads as CommonJS when attempting to require() an ESM script when ESM loader is *not* enabled and node version is < 12', () => __awaiter(void 0, void 0, void 0, function* () {
                // Node versions less than 12 do not support package.json "type" field and so will load ESM as CommonJS
                const { err, stdout } = yield exec(`${BIN_PATH} ./index.js`, {
                    cwd: path_1.join(TEST_DIR, './esm-err-require-esm'),
                });
                chai_1.expect(err).to.equal(null);
                chai_1.expect(stdout).to.contain('CommonJS');
            }));
        }
    });
});
//# sourceMappingURL=index.spec.js.map