"use strict";
// Misc regression tests go here if they do not have a better home
Object.defineProperty(exports, "__esModule", { value: true });
const exp = require("expect");
const path_1 = require("path");
const exec_1 = require("./helpers/exec");
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
const exec = (0, exec_1.createExecTester)({
    exec: (0, exec_1.createExec)({
        cwd: helpers_1.TEST_DIR,
    }),
});
test('#2076 regression test', async () => {
    const r = await exec({
        exec: (0, exec_1.createExec)({
            cwd: (0, path_1.join)(helpers_1.TEST_DIR, '2076'),
        }),
        cmd: `${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} --showConfig`,
    });
    exp(r.err).toBeNull();
});
test('#1488 regression test', async () => {
    // Scenario that caused the bug:
    // `allowJs` turned on
    // `skipIgnore` turned on so that ts-node tries to compile itself (not ideal but theoretically we should be ok with this)
    // Attempt to `require()` a `.js` file
    // `assertScriptCanLoadAsCJS` is triggered within `require()`
    // `./package.json` needs to be fetched into cache via `assertScriptCanLoadAsCJS` which caused a recursive `require()` call
    // Circular dependency warning is emitted by node
    const r = await exec({
        exec: (0, exec_1.createExec)({
            cwd: (0, path_1.join)(helpers_1.TEST_DIR, '1488'),
        }),
        cmd: `${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} ./index.js`,
    });
    exp(r.err).toBeNull();
    // Assert that we do *not* get `Warning: Accessing non-existent property 'getOptionValue' of module exports inside circular dependency`
    exp(r.stdout).toBe('foo\n'); // prove that it ran
    exp(r.stderr).toBe(''); // prove that no warnings
});
test.suite('issue #1098', (test) => {
    function testAllowedExtensions(t, compilerOptions, allowed) {
        const disallowed = allExtensions.filter((ext) => !allowed.includes(ext));
        const { ignored } = t.context.tsNodeUnderTest.create({
            compilerOptions,
            skipProject: true,
        });
        for (const ext of allowed) {
            t.log(`Testing that ${ext} files are allowed`);
            (0, testlib_1.expect)(ignored((0, path_1.join)(helpers_1.DIST_DIR, `index${ext}`))).toBe(false);
        }
        for (const ext of disallowed) {
            t.log(`Testing that ${ext} files are ignored`);
            (0, testlib_1.expect)(ignored((0, path_1.join)(helpers_1.DIST_DIR, `index${ext}`))).toBe(true);
        }
    }
    const allExtensions = [
        '.ts',
        '.js',
        '.d.ts',
        '.mts',
        '.cts',
        '.d.mts',
        '.d.cts',
        '.mjs',
        '.cjs',
        '.tsx',
        '.jsx',
        '.xyz',
        '',
    ];
    const mtsCts = helpers_1.tsSupportsMtsCtsExtensions ? ['.mts', '.cts', '.d.mts', '.d.cts'] : [];
    const mjsCjs = helpers_1.tsSupportsMtsCtsExtensions ? ['.mjs', '.cjs'] : [];
    test('correctly filters file extensions from the compiler when allowJs=false and jsx=false', (t) => {
        testAllowedExtensions(t, {}, ['.ts', '.d.ts', ...mtsCts]);
    });
    test('correctly filters file extensions from the compiler when allowJs=true and jsx=false', (t) => {
        testAllowedExtensions(t, { allowJs: true }, ['.ts', '.js', '.d.ts', ...mtsCts, ...mjsCjs]);
    });
    test('correctly filters file extensions from the compiler when allowJs=false and jsx=true', (t) => {
        testAllowedExtensions(t, { allowJs: false, jsx: 'preserve' }, ['.ts', '.tsx', '.d.ts', ...mtsCts]);
    });
    test('correctly filters file extensions from the compiler when allowJs=true and jsx=true', (t) => {
        testAllowedExtensions(t, { allowJs: true, jsx: 'preserve' }, [
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.d.ts',
            ...mtsCts,
            ...mjsCjs,
        ]);
    });
});
//# sourceMappingURL=regression.spec.js.map