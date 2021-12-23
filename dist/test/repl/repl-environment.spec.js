"use strict";
/*
 * Tests that the REPL environment is setup correctly:
 * globals, __filename, builtin module accessors.
 */
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
const testlib_1 = require("../testlib");
const expect = require("expect");
const promisify = require("util.promisify");
const getStream = require("get-stream");
const helpers_1 = require("../helpers");
const path_1 = require("path");
const exec_helpers_1 = require("../exec-helpers");
const os_1 = require("os");
const helpers_2 = require("./helpers");
const test = testlib_1.test.context(helpers_1.contextTsNodeUnderTest).context(helpers_2.contextReplHelpers);
const exec = (0, exec_helpers_1.createExec)({
    cwd: helpers_1.TEST_DIR,
});
const execTester = (0, exec_helpers_1.createExecTester)({
    cmd: helpers_1.CMD_TS_NODE_WITH_PROJECT_FLAG,
    exec,
});
test.suite('[eval], <repl>, and [stdin] execute with correct globals', (test) => {
    const globalInRepl = global;
    const programmaticTest = test.macro(({ evalCodeBefore, stdinCode, waitFor, }, assertions) => (t) => __awaiter(void 0, void 0, void 0, function* () {
        delete globalInRepl.testReport;
        delete globalInRepl.replReport;
        delete globalInRepl.stdinReport;
        delete globalInRepl.evalReport;
        delete globalInRepl.module;
        delete globalInRepl.exports;
        delete globalInRepl.fs;
        delete globalInRepl.__filename;
        delete globalInRepl.__dirname;
        const { stdin, stderr, stdout, replService, } = t.context.createReplViaApi({ registerHooks: true });
        if (typeof evalCodeBefore === 'string') {
            replService.evalCode(evalCodeBefore);
        }
        replService.start();
        stdin.write(stdinCode);
        stdin.end();
        let done = false;
        yield Promise.race([
            promisify(setTimeout)(20e3),
            (() => __awaiter(void 0, void 0, void 0, function* () {
                while (!done && !(waitFor === null || waitFor === void 0 ? void 0 : waitFor())) {
                    yield promisify(setTimeout)(1e3);
                }
            }))(),
        ]);
        done = true;
        stdout.end();
        stderr.end();
        expect(yield getStream(stderr)).toBe('');
        yield assertions(yield getStream(stdout));
    }));
    const declareGlobals = `declare var replReport: any, stdinReport: any, evalReport: any, restReport: any, global: any, __filename: any, __dirname: any, module: any, exports: any;`;
    function setReportGlobal(type) {
        return `
            ${declareGlobals}
            global.${type}Report = {
              __filename: typeof __filename !== 'undefined' && __filename,
              __dirname: typeof __dirname !== 'undefined' && __dirname,
              moduleId: typeof module !== 'undefined' && module.id,
              modulePath: typeof module !== 'undefined' && module.path,
              moduleFilename: typeof module !== 'undefined' && module.filename,
              modulePaths: typeof module !== 'undefined' && [...module.paths],
              exportsTest: typeof exports !== 'undefined' ? module.exports === exports : null,
              stackTest: new Error().stack!.split('\\n')[1],
              moduleAccessorsTest: eval('typeof fs') === 'undefined' ? null : eval('fs') === require('fs'),
              argv: [...process.argv]
            };
          `.replace(/\n/g, '');
    }
    const reportsObject = `
          {
            stdinReport: typeof stdinReport !== 'undefined' && stdinReport,
            evalReport: typeof evalReport !== 'undefined' && evalReport,
            replReport: typeof replReport !== 'undefined' && replReport
          }
        `;
    const printReports = `
          ${declareGlobals}
          console.log(JSON.stringify(${reportsObject}));
        `.replace(/\n/g, '');
    const saveReportsAsGlobal = `
          ${declareGlobals}
          global.testReport = ${reportsObject};
        `.replace(/\n/g, '');
    function parseStdoutStripReplPrompt(stdout) {
        // Strip node's welcome header, only uncomment if running these tests manually against vanilla node
        // stdout = stdout.replace(/^Welcome to.*\nType "\.help" .*\n/, '');
        expect(stdout.slice(0, 2)).toBe('> ');
        expect(stdout.slice(-12)).toBe('undefined\n> ');
        return parseStdout(stdout.slice(2, -12));
    }
    function parseStdout(stdout) {
        return JSON.parse(stdout);
    }
    /** Every possible ./node_modules directory ascending upwards starting with ./tests/node_modules */
    const modulePaths = createModulePaths(helpers_1.TEST_DIR);
    const rootModulePaths = createModulePaths(helpers_1.ROOT_DIR);
    function createModulePaths(dir) {
        const modulePaths = [];
        for (let path = dir;; path = (0, path_1.dirname)(path)) {
            modulePaths.push((0, path_1.join)(path, 'node_modules'));
            if ((0, path_1.dirname)(path) === path)
                break;
        }
        return modulePaths;
    }
    // Executable is `ts-node` on Posix, `bin.js` on Windows due to Windows shimming limitations (this is determined by package manager)
    const tsNodeExe = expect.stringMatching(/\b(ts-node|bin.js)$/);
    test('stdin', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `${setReportGlobal('stdin')};${printReports}`,
            flags: '',
        });
        const report = parseStdout(stdout);
        expect(report).toMatchObject({
            stdinReport: {
                __filename: '[stdin]',
                __dirname: '.',
                moduleId: '[stdin]',
                modulePath: '.',
                // Note: vanilla node does does not have file extension
                moduleFilename: (0, path_1.join)(helpers_1.TEST_DIR, `[stdin].ts`),
                modulePaths,
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, `[stdin].ts`)}:1:`),
                moduleAccessorsTest: null,
                argv: [tsNodeExe],
            },
            evalReport: false,
            replReport: false,
        });
    }));
    test('repl', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `${setReportGlobal('repl')};${printReports}`,
            flags: '-i',
        });
        const report = parseStdoutStripReplPrompt(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: false,
            replReport: {
                __filename: false,
                __dirname: false,
                moduleId: '<repl>',
                modulePath: '.',
                moduleFilename: null,
                modulePaths: expect.objectContaining(Object.assign({}, [(0, path_1.join)(helpers_1.TEST_DIR, `repl/node_modules`), ...modulePaths])),
                // Note: vanilla node REPL does not set exports
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, '<repl>.ts')}:4:`),
                moduleAccessorsTest: true,
                argv: [tsNodeExe],
            },
        });
        // Prior to these, nyc adds another entry on Windows; we need to ignore it
        expect(report.replReport.modulePaths.slice(-3)).toMatchObject([
            (0, path_1.join)((0, os_1.homedir)(), `.node_modules`),
            (0, path_1.join)((0, os_1.homedir)(), `.node_libraries`),
            // additional entry goes to node's install path
            expect.any(String),
        ]);
    }));
    // Should ignore -i and run the entrypoint
    test('-i w/entrypoint ignores -i', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `${setReportGlobal('repl')};${printReports}`,
            flags: '-i ./repl/script.js',
        });
        const report = parseStdout(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: false,
            replReport: false,
        });
    }));
    // Should not execute stdin
    // Should not interpret positional arg as an entrypoint script
    test('-e', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `throw new Error()`,
            flags: `-e "${setReportGlobal('eval')};${printReports}"`,
        });
        const report = parseStdout(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: {
                __filename: '[eval]',
                __dirname: '.',
                moduleId: '[eval]',
                modulePath: '.',
                // Note: vanilla node does does not have file extension
                moduleFilename: (0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`),
                modulePaths: [...modulePaths],
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`)}:1:`),
                moduleAccessorsTest: true,
                argv: [tsNodeExe],
            },
            replReport: false,
        });
    }));
    test('-e w/entrypoint arg does not execute entrypoint', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `throw new Error()`,
            flags: `-e "${setReportGlobal('eval')};${printReports}" ./repl/script.js`,
        });
        const report = parseStdout(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: {
                __filename: '[eval]',
                __dirname: '.',
                moduleId: '[eval]',
                modulePath: '.',
                // Note: vanilla node does does not have file extension
                moduleFilename: (0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`),
                modulePaths,
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`)}:1:`),
                moduleAccessorsTest: true,
                argv: [tsNodeExe, './repl/script.js'],
            },
            replReport: false,
        });
    }));
    test('-e w/non-path arg', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `throw new Error()`,
            flags: `-e "${setReportGlobal('eval')};${printReports}" ./does-not-exist.js`,
        });
        const report = parseStdout(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: {
                __filename: '[eval]',
                __dirname: '.',
                moduleId: '[eval]',
                modulePath: '.',
                // Note: vanilla node does does not have file extension
                moduleFilename: (0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`),
                modulePaths,
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`)}:1:`),
                moduleAccessorsTest: true,
                argv: [tsNodeExe, './does-not-exist.js'],
            },
            replReport: false,
        });
    }));
    test('-e -i', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `${setReportGlobal('repl')};${printReports}`,
            flags: `-e "${setReportGlobal('eval')}" -i`,
        });
        const report = parseStdoutStripReplPrompt(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: {
                __filename: '[eval]',
                __dirname: '.',
                moduleId: '[eval]',
                modulePath: '.',
                // Note: vanilla node does does not have file extension
                moduleFilename: (0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`),
                modulePaths,
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, `[eval].ts`)}:1:`),
                moduleAccessorsTest: true,
                argv: [tsNodeExe],
            },
            replReport: {
                __filename: '[eval]',
                __dirname: '.',
                moduleId: '<repl>',
                modulePath: '.',
                moduleFilename: null,
                modulePaths: expect.objectContaining(Object.assign({}, [(0, path_1.join)(helpers_1.TEST_DIR, `repl/node_modules`), ...modulePaths])),
                // Note: vanilla node REPL does not set exports, so this would be false
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.TEST_DIR, '<repl>.ts')}:4:`),
                moduleAccessorsTest: true,
                argv: [tsNodeExe],
            },
        });
        // Prior to these, nyc adds another entry on Windows; we need to ignore it
        expect(report.replReport.modulePaths.slice(-3)).toMatchObject([
            (0, path_1.join)((0, os_1.homedir)(), `.node_modules`),
            (0, path_1.join)((0, os_1.homedir)(), `.node_libraries`),
            // additional entry goes to node's install path
            expect.any(String),
        ]);
    }));
    test('-e -i w/entrypoint ignores -e and -i, runs entrypoint', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout } = yield execTester({
            stdin: `throw new Error()`,
            flags: '-e "throw new Error()" -i ./repl/script.js',
        });
        const report = parseStdout(stdout);
        expect(report).toMatchObject({
            stdinReport: false,
            evalReport: false,
            replReport: false,
        });
    }));
    test('-e -i when -e throws error, -i does not run', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const { stdout, stderr, err } = yield execTester({
            stdin: `console.log('hello')`,
            flags: `-e "throw new Error('error from -e')" -i`,
            expectError: true,
        });
        expect(err).toBeDefined();
        expect(stdout).toBe('');
        expect(stderr).toContain('error from -e');
    }));
    // Serial because it's timing-sensitive
    test.serial('programmatically, eval-ing before starting REPL', programmaticTest, {
        evalCodeBefore: `${setReportGlobal('repl')};${saveReportsAsGlobal}`,
        stdinCode: '',
        waitFor: () => !!globalInRepl.testReport,
    }, (stdout) => {
        expect(globalInRepl.testReport).toMatchObject({
            stdinReport: false,
            evalReport: false,
            replReport: {
                __filename: false,
                __dirname: false,
                // Due to limitations in node's REPL API, we can't really expose
                // the `module` prior to calling repl.start() which also sends
                // output to stdout.
                // For now, leaving this as unsupported / undefined behavior.
                // moduleId: '<repl>',
                // modulePath: '.',
                // moduleFilename: null,
                // modulePaths: [
                //   join(ROOT_DIR, `repl/node_modules`),
                //   ...rootModulePaths,
                //   join(homedir(), `.node_modules`),
                //   join(homedir(), `.node_libraries`),
                //   // additional entry goes to node's install path
                //   exp.any(String),
                // ],
                // // Note: vanilla node REPL does not set exports
                // exportsTest: true,
                // moduleAccessorsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.ROOT_DIR, '<repl>.ts')}:1:`),
            },
        });
    });
    test.serial('programmatically, passing code to stdin after starting REPL', programmaticTest, {
        evalCodeBefore: null,
        stdinCode: `${setReportGlobal('repl')};${saveReportsAsGlobal}`,
        waitFor: () => !!globalInRepl.testReport,
    }, (stdout) => {
        expect(globalInRepl.testReport).toMatchObject({
            stdinReport: false,
            evalReport: false,
            replReport: {
                __filename: false,
                __dirname: false,
                moduleId: '<repl>',
                modulePath: '.',
                moduleFilename: null,
                modulePaths: expect.objectContaining(Object.assign({}, [(0, path_1.join)(helpers_1.ROOT_DIR, `repl/node_modules`), ...rootModulePaths])),
                // Note: vanilla node REPL does not set exports
                exportsTest: true,
                // Note: vanilla node uses different name. See #1360
                stackTest: expect.stringContaining(`    at ${(0, path_1.join)(helpers_1.ROOT_DIR, '<repl>.ts')}:1:`),
                moduleAccessorsTest: true,
            },
        });
        // Prior to these, nyc adds another entry on Windows; we need to ignore it
        expect(globalInRepl.testReport.replReport.modulePaths.slice(-3)).toMatchObject([
            (0, path_1.join)((0, os_1.homedir)(), `.node_modules`),
            (0, path_1.join)((0, os_1.homedir)(), `.node_libraries`),
            // additional entry goes to node's install path
            expect.any(String),
        ]);
    });
});
//# sourceMappingURL=repl-environment.spec.js.map