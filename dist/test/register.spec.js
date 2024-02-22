"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("lodash");
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const exp = require("expect");
const path_1 = require("path");
const proxyquire = require("proxyquire");
const SOURCE_MAP_REGEXP = /\/\/# sourceMappingURL=data:application\/json;charset=utf\-8;base64,[\w\+]+=*$/;
const createOptions = {
    project: helpers_1.PROJECT_TRANSPILE_ONLY,
    compilerOptions: {
        jsx: 'preserve',
    },
};
const test = (0, testlib_1.context)(helpers_1.ctxTsNode).context(async (t) => {
    return {
        moduleTestPath: (0, path_1.resolve)(__dirname, '../../tests/module.ts'),
        service: t.context.tsNodeUnderTest.create(createOptions),
    };
});
test.beforeEach(async (t) => {
    // Un-install all hook and remove our test module from cache
    (0, helpers_1.resetNodeEnvironment)();
    delete require.cache[t.context.moduleTestPath];
    // Paranoid check that we are truly uninstalled
    exp(() => require(t.context.moduleTestPath)).toThrow("Unexpected token 'export'");
});
test.serial();
test('create() does not register()', async (t) => {
    // nyc sets its own `require.extensions` hooks; to truly detect if we're
    // installed we must attempt to load a TS file
    t.context.tsNodeUnderTest.create(createOptions);
    // This error indicates node attempted to run the code as .js
    exp(() => require(t.context.moduleTestPath)).toThrow("Unexpected token 'export'");
});
test('register(options) is shorthand for register(create(options))', (t) => {
    t.context.tsNodeUnderTest.register(createOptions);
    require(t.context.moduleTestPath);
});
test('register(service) registers a previously-created service', (t) => {
    t.context.tsNodeUnderTest.register(t.context.service);
    require(t.context.moduleTestPath);
});
test.suite('register(create(options))', (test) => {
    test.beforeEach(async (t) => {
        // Re-enable project for every test.
        t.context.service.enabled(true);
        t.context.tsNodeUnderTest.register(t.context.service);
        t.context.service.installSourceMapSupport();
    });
    test('should be able to require typescript', ({ context: { moduleTestPath } }) => {
        const m = require(moduleTestPath);
        (0, testlib_1.expect)(m.example('foo')).toBe('FOO');
    });
    test('should support dynamically disabling', ({ context: { service, moduleTestPath } }) => {
        delete require.cache[moduleTestPath];
        (0, testlib_1.expect)(service.enabled(false)).toBe(false);
        (0, testlib_1.expect)(() => require(moduleTestPath)).toThrow(/Unexpected token/);
        delete require.cache[moduleTestPath];
        (0, testlib_1.expect)(service.enabled()).toBe(false);
        (0, testlib_1.expect)(() => require(moduleTestPath)).toThrow(/Unexpected token/);
        delete require.cache[moduleTestPath];
        (0, testlib_1.expect)(service.enabled(true)).toBe(true);
        (0, testlib_1.expect)(() => require(moduleTestPath)).not.toThrow();
        delete require.cache[moduleTestPath];
        (0, testlib_1.expect)(service.enabled()).toBe(true);
        (0, testlib_1.expect)(() => require(moduleTestPath)).not.toThrow();
    });
    test('should compile through js and ts', () => {
        const m = require('../../tests/complex');
        (0, testlib_1.expect)(m.example()).toBe('example');
    });
    test('should work with proxyquire', () => {
        const m = proxyquire('../../tests/complex', {
            './example': 'hello',
        });
        (0, testlib_1.expect)(m.example()).toBe('hello');
    });
    test('should work with `require.cache`', () => {
        const { example1, example2 } = require('../../tests/require-cache');
        (0, testlib_1.expect)(example1).not.toBe(example2);
    });
    test('should use source maps', async () => {
        try {
            require('../../tests/throw error');
        }
        catch (error) {
            exp(error.stack).toMatch(['Error: this is a demo', `    at Foo.bar (${(0, path_1.join)(helpers_1.TEST_DIR, './throw error.ts')}:100:17)`].join('\n'));
        }
    });
    test.suite('JSX preserve', (test) => {
        let compiled;
        test.before(async () => {
            const old = require.extensions['.tsx'];
            require.extensions['.tsx'] = (m, fileName) => {
                const _compile = m._compile;
                m._compile = function (code, fileName) {
                    compiled = code;
                    return _compile.call(this, code, fileName);
                };
                return old(m, fileName);
            };
        });
        test('should use source maps', async (t) => {
            try {
                require('../../tests/with-jsx.tsx');
            }
            catch (error) {
                (0, testlib_1.expect)(error.stack).toMatch('SyntaxError: Unexpected token');
            }
            (0, testlib_1.expect)(compiled).toMatch(SOURCE_MAP_REGEXP);
        });
    });
});
test('should support compiler scopes w/multiple registered compiler services at once', (t) => {
    const { moduleTestPath, tsNodeUnderTest } = t.context;
    const calls = [];
    const compilers = [
        tsNodeUnderTest.register({
            projectSearchDir: (0, path_1.join)(helpers_1.TEST_DIR, 'scope/a'),
            scopeDir: (0, path_1.join)(helpers_1.TEST_DIR, 'scope/a'),
            scope: true,
        }),
        tsNodeUnderTest.register({
            projectSearchDir: (0, path_1.join)(helpers_1.TEST_DIR, 'scope/a'),
            scopeDir: (0, path_1.join)(helpers_1.TEST_DIR, 'scope/b'),
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
        (0, testlib_1.expect)(require('../../tests/scope/a').ext).toBe('.ts');
        (0, testlib_1.expect)(require('../../tests/scope/b').ext).toBe('.ts');
    }
    finally {
        compilers.forEach((c) => c.enabled(false));
    }
    (0, testlib_1.expect)(calls).toEqual([(0, path_1.join)(helpers_1.TEST_DIR, 'scope/a/index.ts'), (0, path_1.join)(helpers_1.TEST_DIR, 'scope/b/index.ts')]);
    delete require.cache[moduleTestPath];
    (0, testlib_1.expect)(() => require(moduleTestPath)).toThrow();
});
//# sourceMappingURL=register.spec.js.map