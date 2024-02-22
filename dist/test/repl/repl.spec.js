"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlib_1 = require("../testlib");
const helpers_1 = require("../helpers");
const semver = require("semver");
const helpers_2 = require("../helpers");
const exec_1 = require("../helpers/exec");
const node_repl_tla_1 = require("./node-repl-tla");
const misc_1 = require("./helpers/misc");
const expect_stream_1 = require("@cspotcode/expect-stream");
const path_1 = require("path");
const ctx_repl_1 = require("./helpers/ctx-repl");
const macros_1 = require("./helpers/macros");
const test = (0, testlib_1.context)(helpers_2.ctxTsNode).contextEach(ctx_repl_1.ctxRepl);
test.serial();
test.beforeEach(async (t) => {
    t.teardown(() => {
        (0, helpers_1.resetNodeEnvironment)();
        // Useful for debugging memory leaks.  Leaving in case I need it again.
        // global.gc(); // Requires adding nodeArguments: ['--expose-gc'] to ava config
        // console.dir(process.memoryUsage().heapUsed / 1000 / 1000);
    });
});
const exec = (0, exec_1.createExec)({
    cwd: helpers_2.TEST_DIR,
});
const execTester = (0, exec_1.createExecTester)({
    cmd: helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG,
    exec,
});
test('should run REPL when --interactive passed and stdin is not a TTY', async () => {
    const p = exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --interactive`);
    p.child.stdin.end('console.log("123")\n');
    const r = await p;
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toBe('> 123\n' + 'undefined\n' + '> ');
});
test('should echo a value when using the swc transpiler', async () => {
    const p = exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --interactive  --transpiler ts-node/transpilers/swc-experimental`);
    p.child.stdin.end('400\n401\n');
    const r = await p;
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toBe('> 400\n> 401\n> ');
});
test('REPL has command to get type information', async () => {
    const p = exec(`${helpers_2.CMD_TS_NODE_WITH_PROJECT_FLAG} --interactive`);
    p.child.stdin.end('\nconst a = 123\n.type a');
    const r = await p;
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toBe('> undefined\n' + '> undefined\n' + '> const a: 123\n' + '> ');
});
// Serial because it's timing-sensitive
test.serial('REPL can be configured on `start`', async (t) => {
    const prompt = '#> ';
    const r = await t.context.executeInRepl(`const x = 3\n'done'`, {
        waitPattern: "'done'\n#> ",
        registerHooks: true,
        startInternalOptions: {
            prompt,
            ignoreUndefined: true,
        },
    });
    (0, testlib_1.expect)(r.stderr).toBe('');
    (0, testlib_1.expect)(r.stdout).toBe(`${prompt}${prompt}'done'\n#> `);
});
// Serial because it's timing-sensitive
test.serial('REPL uses a different context when `useGlobal` is false', async (t) => {
    const r = await t.context.executeInRepl(
    // No error when re-declaring x
    'const x = 3\n' +
        // console.log ouput will end up in the stream and not in test output
        'console.log(1)\n', {
        registerHooks: true,
        waitPattern: `> undefined\n> 1\nundefined\n> `,
        startInternalOptions: {
            useGlobal: false,
        },
    });
    (0, testlib_1.expect)(r.stderr).toBe('');
    (0, testlib_1.expect)(r.stdout).toBe(`> undefined\n> 1\nundefined\n> `);
});
// Serial because it's timing-sensitive
test.serial('REPL can be created via API', async (t) => {
    const r = await t.context.executeInRepl(`\nconst a = 123\n.type a\n`, {
        registerHooks: true,
        waitPattern: '123\n> ',
    });
    (0, testlib_1.expect)(r.stderr).toBe('');
    (0, testlib_1.expect)(r.stdout).toBe('> undefined\n' + '> undefined\n' + '> const a: 123\n' + '> ');
});
test.suite('top level await', ({ contextEach }) => {
    const compilerOptions = {
        target: 'es2018',
    };
    const test = contextEach(async (t) => {
        return { executeInTlaRepl };
        function executeInTlaRepl(input, waitPattern) {
            return t.context.executeInRepl(input
                .split('\n')
                .map((line) => line.trim())
                // Restore newline once https://github.com/nodejs/node/pull/39392 is merged
                .join(''), {
                registerHooks: true,
                waitPattern,
                createServiceOpts: {
                    experimentalReplAwait: true,
                    compilerOptions,
                },
                startInternalOptions: { useGlobal: false },
            });
        }
    });
    // Serial because it's timing-sensitive
    test.serial('should allow evaluating top level await', async (t) => {
        const script = `
        const x: number = await new Promise((r) => r(1));
        for await (const x of [1,2,3]) { console.log(x) };
        for (const x of ['a', 'b']) { await x; console.log(x) };
        class Foo {}; await 1;
        function Bar() {}; await 2;
        const {y} = await ({y: 2});
        const [z] = await [3];
        x + y + z;
      `;
        const r = await t.context.executeInTlaRepl(script, '6\n> ');
        (0, testlib_1.expect)(r.stderr).toBe('');
        (0, testlib_1.expect)(r.stdout).toBe('> 1\n2\n3\na\nb\n6\n> ');
    });
    // Serial because it's timing-sensitive
    test.serial('should wait until promise is settled when awaiting at top level', async (t) => {
        const awaitMs = 500;
        const script = `
          const startTime = new Date().getTime();
          await new Promise((r) => setTimeout(() => r(1), ${awaitMs}));
          const endTime = new Date().getTime();
          endTime - startTime;
        `;
        const r = await t.context.executeInTlaRepl(script, /\d+\n/);
        (0, testlib_1.expect)(r.stderr).toBe('');
        const elapsedTimeString = r.stdout.split('\n')[0].replace('> ', '').trim();
        (0, testlib_1.expect)(elapsedTimeString).toMatch(/^\d+$/);
        const elapsedTime = Number(elapsedTimeString);
        (0, testlib_1.expect)(elapsedTime).toBeGreaterThanOrEqual(awaitMs - 50);
        // When CI is taxed, the time may be *much* greater than expected.
        // I can't think of a case where the time being *too high* is a bug
        // that this test can catch.  So I've made this check very loose.
        (0, testlib_1.expect)(elapsedTime).toBeLessThanOrEqual(awaitMs + 10e3);
    });
    // Serial because it's timing-sensitive
    test.serial('should not wait until promise is settled when not using await at top level', async (t) => {
        const script = `
          const startTime = new Date().getTime();
          (async () => await new Promise((r) => setTimeout(() => r(1), ${5000})))();
          const endTime = new Date().getTime();
          endTime - startTime;
        `;
        const r = await t.context.executeInTlaRepl(script, /\d+\n/);
        (0, testlib_1.expect)(r.stderr).toBe('');
        const ellapsedTime = Number(r.stdout.split('\n')[0].replace('> ', '').trim());
        (0, testlib_1.expect)(ellapsedTime).toBeGreaterThanOrEqual(0);
        // Should ideally be instantaneous; leave wiggle-room for slow CI
        (0, testlib_1.expect)(ellapsedTime).toBeLessThanOrEqual(100);
    });
    // Serial because it's timing-sensitive
    test.serial('should error with typing information when awaited result has type mismatch', async (t) => {
        const r = await t.context.executeInTlaRepl('const x: string = await 1', 'error');
        (0, testlib_1.expect)(r.stdout).toBe('> > ');
        (0, testlib_1.expect)(r.stderr.replace(/\r\n/g, '\n')).toBe(`${misc_1.replFile}(4,7): error TS2322: ` +
            (semver.gte(helpers_1.ts.version, '4.0.0')
                ? `Type 'number' is not assignable to type 'string'.\n`
                : `Type '1' is not assignable to type 'string'.\n`) +
            '\n');
    });
    // Serial because it's timing-sensitive
    test.serial('should error with typing information when importing a file with type errors', async (t) => {
        const r = await t.context.executeInTlaRepl(`const {foo} = await import('./repl/tla-import');`, 'error');
        (0, testlib_1.expect)(r.stdout).toBe('> > ');
        (0, testlib_1.expect)(r.stderr.replace(/\r\n/g, '\n')).toBe('repl/tla-import.ts(1,14): error TS2322: ' +
            (semver.gte(helpers_1.ts.version, '4.0.0')
                ? `Type 'number' is not assignable to type 'string'.\n`
                : `Type '1' is not assignable to type 'string'.\n`) +
            '\n');
    });
    test('should pass upstream test cases', async (t) => {
        const { tsNodeUnderTest } = t.context;
        await (0, node_repl_tla_1.upstreamTopLevelAwaitTests)({ TEST_DIR: helpers_2.TEST_DIR, tsNodeUnderTest });
    });
});
test.suite('REPL ignores diagnostics that are annoying in interactive sessions', (test) => {
    const code = `function foo() {};\nfunction foo() {return 123};\nconsole.log(foo());\n`;
    const diagnosticMessage = `Duplicate function implementation`;
    test('interactive repl should ignore them', async (t) => {
        const r = await execTester({
            flags: '-i',
            stdin: code,
        });
        (0, testlib_1.expect)(r.stdout).not.toContain(diagnosticMessage);
    });
    test('interactive repl should not ignore them if they occur in other files', async (t) => {
        const r = await execTester({
            flags: '-i',
            stdin: `import './repl-ignored-diagnostics/index';\n`,
        });
        (0, testlib_1.expect)(r.stderr).toContain(diagnosticMessage);
    });
    test('[stdin] should not ignore them', async (t) => {
        const r = await execTester({
            stdin: code,
            expectError: true,
        });
        (0, testlib_1.expect)(r.stderr).toContain(diagnosticMessage);
    });
    test('[eval] should not ignore them', async (t) => {
        const r = await execTester({
            flags: `-e "${code.replace(/\n/g, '')}"`,
            expectError: true,
        });
        (0, testlib_1.expect)(r.stderr).toContain(diagnosticMessage);
    });
});
test.suite('REPL inputs are syntactically independent of each other', (test) => {
    // Serial because they're timing-sensitive
    test.serial();
    test('arithmetic operators are independent of previous values', async (t) => {
        const r = await t.context.executeInRepl(`9
          + 3
          7
          - 3
          3
          * 7\n.break
          100
          / 2\n.break
          5
          ** 2\n.break
          console.log('done!')
          `, {
            registerHooks: true,
            startInternalOptions: { useGlobal: false },
            waitPattern: 'done!\nundefined\n>',
        });
        (0, testlib_1.expect)(r.stdout).not.toContain('12');
        (0, testlib_1.expect)(r.stdout).not.toContain('4');
        (0, testlib_1.expect)(r.stdout).not.toContain('21');
        (0, testlib_1.expect)(r.stdout).not.toContain('50');
        (0, testlib_1.expect)(r.stdout).not.toContain('25');
        (0, testlib_1.expect)(r.stdout).toContain('3');
        (0, testlib_1.expect)(r.stdout).toContain('-3');
    });
    test('automatically inserted semicolons do not appear in error messages at the end', async (t) => {
        const r = await t.context.executeInRepl(`(
          a
          console.log('done!')`, {
            registerHooks: true,
            startInternalOptions: { useGlobal: false },
            waitPattern: 'done!\nundefined\n>',
        });
        (0, testlib_1.expect)(r.stderr).toContain("error TS1005: ')' expected.");
        (0, testlib_1.expect)(r.stderr).not.toContain(';');
    });
    test('automatically inserted semicolons do not appear in error messages at the start', async (t) => {
        const r = await t.context.executeInRepl(`)
          console.log('done!')`, {
            registerHooks: true,
            startInternalOptions: { useGlobal: false },
            waitPattern: 'done!\nundefined\n>',
        });
        (0, testlib_1.expect)(r.stderr).toContain('error TS1128: Declaration or statement expected.');
        (0, testlib_1.expect)(r.stderr).toContain(')');
        (0, testlib_1.expect)(r.stderr).not.toContain(';');
    });
    test('automatically inserted semicolons do not break function calls', async (t) => {
        const r = await t.context.executeInRepl(`function foo(a: number) {
              return a + 1;
          }
          foo(
            1
          )`, {
            registerHooks: true,
            startInternalOptions: { useGlobal: false },
            waitPattern: '2\n>',
        });
        (0, testlib_1.expect)(r.stderr).toBe('');
        (0, testlib_1.expect)(r.stdout).toContain('2');
    });
    test('automatically inserted semicolons do not affect subsequent line numbers', async (t) => {
        // If first line of input ends in a semicolon, should not add a second semicolon.
        // That will cause an extra blank line in the compiled output which will
        // offset the stack line number.
        const r = await t.context.executeInRepl(`1;
          new Error().stack!.split('\\n')[1]
          console.log('done!')`, {
            registerHooks: true,
            startInternalOptions: { useGlobal: false },
            waitPattern: 'done!',
        });
        (0, testlib_1.expect)(r.stderr).toBe('');
        (0, testlib_1.expect)(r.stdout).toContain(":1:1'\n");
    });
});
test.suite('Multiline inputs and RECOVERY_CODES', (test) => {
    test.serial();
    test('multiline function args declaration', macros_1.macroReplNoErrorsAndStdoutContains, `
      function myFn(
        a: string,
        b: string
      ) {
        return a + ' ' + b
      }
      myFn('test', '!')
    `, 'test !');
    test('Conditional recovery codes: this one-liner *should* raise an error; should not be recoverable', macros_1.macroReplStderrContains, `
      (a: any) => a = null;
    `, 'error TS', {
        createServiceOpts: { compilerOptions: { strictNullChecks: false } },
    });
});
test.suite('REPL works with traceResolution', (test) => {
    test.serial('startup traces should print before the prompt appears when traceResolution is enabled', async (t) => {
        const repl = t.context.createReplViaApi({
            registerHooks: false,
            createServiceOpts: {
                compilerOptions: {
                    traceResolution: true,
                },
            },
        });
        repl.replService.start();
        repl.stdin.end();
        await (0, helpers_1.delay)(3e3);
        repl.stdout.end();
        const stdout = await (0, expect_stream_1.expectStream)(repl.stdout);
        (0, testlib_1.expect)(stdout).toContain('======== Resolving module');
        (0, testlib_1.expect)(stdout.endsWith('> ')).toBe(true);
    });
    test.serial('traces should NOT appear when traceResolution is not enabled', async (t) => {
        const r = await t.context.executeInRepl('1', {
            registerHooks: true,
            startInternalOptions: { useGlobal: false },
            waitPattern: '1\n>',
        });
        (0, testlib_1.expect)(r.stderr).toBe('');
        (0, testlib_1.expect)(r.stdout).not.toContain('======== Resolving module');
    });
});
test.suite('REPL declares types for node built-ins within REPL', (test) => {
    test.serial();
    test('enabled when typechecking', async (t) => {
        const r = await t.context.executeInRepl(`util.promisify(setTimeout)("should not be a string" as string)
      type Duplex = stream.Duplex
      const s = stream
      'done'`, {
            registerHooks: true,
            waitPattern: `done`,
            startInternalOptions: {
                useGlobal: false,
            },
        });
        // Assert that we receive a typechecking error about improperly using
        // `util.promisify` but *not* an error about the absence of `util`
        (0, testlib_1.expect)(r.stderr).not.toMatch("Cannot find name 'util'");
        (0, testlib_1.expect)(r.stderr).toMatch("Argument of type 'string' is not assignable to parameter of type 'number'");
        // Assert that both types and values can be used without error
        (0, testlib_1.expect)(r.stderr).not.toMatch("Cannot find namespace 'stream'");
        (0, testlib_1.expect)(r.stderr).not.toMatch("Cannot find name 'stream'");
        (0, testlib_1.expect)(r.stdout).toMatch(`done`);
    });
    test('disabled in transpile-only mode, to avoid breaking third-party SWC transpiler which rejects `declare import` syntax', async (t) => {
        const r = await t.context.executeInRepl(`type Duplex = stream.Duplex
      const s = stream
      'done'`, {
            createServiceOpts: {
                swc: true,
            },
            registerHooks: true,
            waitPattern: `'done'\n> `,
            startInternalOptions: {
                useGlobal: false,
            },
        });
        // Assert that we do not get errors about `declare import` syntax from swc
        (0, testlib_1.expect)(r.stdout).toBe("> undefined\n> undefined\n> 'done'\n> ");
        (0, testlib_1.expect)(r.stderr).toBe('');
    });
});
test.suite('REPL treats object literals and block scopes correctly', (test) => {
    test('repl should treat { key: 123 } as object literal', macros_1.macroReplNoErrorsAndStdoutContains, '{ key: 123 }', '{ key: 123 }');
    test('repl should treat ({ key: 123 }) as object literal', macros_1.macroReplNoErrorsAndStdoutContains, '({ key: 123 })', '{ key: 123 }');
    test('repl should treat ({ let v = 0; v; }) as object literal and error', macros_1.macroReplStderrContains, '({ let v = 0; v; })', 'No value exists in scope for the shorthand property');
    test('repl should treat { let v = 0; v; } as block scope', macros_1.macroReplNoErrorsAndStdoutContains, '{ let v = 0; v; }', '0');
    test.suite('extra', (test) => {
        test('repl should treat { key: 123 }; as block scope', macros_1.macroReplNoErrorsAndStdoutContains, '{ key: 123 };', '123');
        test('repl should treat {\\nkey: 123\\n}; as block scope', macros_1.macroReplNoErrorsAndStdoutContains, '{\nkey: 123\n};', '123');
        test('repl should treat { key: 123 }[] as block scope (edge case)', macros_1.macroReplNoErrorsAndStdoutContains, '{ key: 123 }[]', '[]');
    });
    test.suite('multiline', (test) => {
        test('repl should treat {\\nkey: 123\\n} as object literal', macros_1.macroReplNoErrorsAndStdoutContains, '{\nkey: 123\n}', '{ key: 123 }');
        test('repl should treat ({\\nkey: 123\\n}) as object literal', macros_1.macroReplNoErrorsAndStdoutContains, '({\nkey: 123\n})', '{ key: 123 }');
        test('repl should treat ({\\nlet v = 0;\\nv;\\n}) as object literal and error', macros_1.macroReplStderrContains, '({\nlet v = 0;\nv;\n})', 'No value exists in scope for the shorthand property');
        test('repl should treat {\\nlet v = 0;\\nv;\\n} as block scope', macros_1.macroReplNoErrorsAndStdoutContains, '{\nlet v = 0;\nv;\n}', '0');
    });
    test.suite('property access', (test) => {
        test('repl should treat { key: 123 }.key as object literal property access', macros_1.macroReplNoErrorsAndStdoutContains, '{ key: 123 }.key', '123');
        test('repl should treat { key: 123 }["key"] as object literal indexed access', macros_1.macroReplNoErrorsAndStdoutContains, '{ key: 123 }["key"]', '123');
        test('repl should treat { key: 123 }.foo as object literal non-existent property access', macros_1.macroReplStderrContains, '{ key: 123 }.foo', "Property 'foo' does not exist on type");
        test('repl should treat { key: 123 }["foo"] as object literal non-existent indexed access', macros_1.macroReplStderrContains, '{ key: 123 }["foo"]', "Property 'foo' does not exist on type");
    });
});
test.suite('repl executes input as cjs even in esm projects', (test) => {
    test.if(helpers_1.tsSupportsMtsCtsExtensions);
    test('test', async (t) => {
        // Must exec child process, because we need a different cwd.
        const p = exec(`${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} -i`, {
            cwd: (0, path_1.join)(helpers_2.TEST_DIR, 'repl-in-esm-package'),
        });
        p.child.stdin.write('import fs2 from "fs"; fs2.existsSync("does not exist")');
        p.child.stdin.end();
        const r = await p;
        (0, testlib_1.expect)(r.stdout).toBe('> false\n> ');
        (0, testlib_1.expect)(r.stderr).toBe('');
    });
});
//# sourceMappingURL=repl.spec.js.map