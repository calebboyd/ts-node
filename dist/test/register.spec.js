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
const lodash_1 = require("lodash");
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const chai_1 = require("chai");
const exp = require("expect");
const path_1 = require("path");
const proxyquire = require("proxyquire");
const SOURCE_MAP_REGEXP = /\/\/# sourceMappingURL=data:application\/json;charset=utf\-8;base64,[\w\+]+=*$/;
const createOptions = {
    project: helpers_1.PROJECT,
    compilerOptions: {
        jsx: 'preserve',
    },
};
const test = (0, testlib_1.context)(helpers_1.contextTsNodeUnderTest).context((0, lodash_1.once)((t) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        moduleTestPath: (0, path_1.resolve)(__dirname, '../../tests/module.ts'),
        service: t.context.tsNodeUnderTest.create(createOptions),
    };
})));
test.beforeEach((t) => __awaiter(void 0, void 0, void 0, function* () {
    // Un-install all hook and remove our test module from cache
    (0, helpers_1.resetNodeEnvironment)();
    delete require.cache[t.context.moduleTestPath];
    // Paranoid check that we are truly uninstalled
    exp(() => require(t.context.moduleTestPath)).toThrow("Unexpected token 'export'");
}));
test.runSerially();
test('create() does not register()', (t) => __awaiter(void 0, void 0, void 0, function* () {
    // nyc sets its own `require.extensions` hooks; to truly detect if we're
    // installed we must attempt to load a TS file
    t.context.tsNodeUnderTest.create(createOptions);
    // This error indicates node attempted to run the code as .js
    exp(() => require(t.context.moduleTestPath)).toThrow("Unexpected token 'export'");
}));
test('register(options) is shorthand for register(create(options))', (t) => {
    t.context.tsNodeUnderTest.register(createOptions);
    require(t.context.moduleTestPath);
});
test('register(service) registers a previously-created service', (t) => {
    t.context.tsNodeUnderTest.register(t.context.service);
    require(t.context.moduleTestPath);
});
test.suite('register(create(options))', (test) => {
    test.beforeEach((t) => __awaiter(void 0, void 0, void 0, function* () {
        // Re-enable project for every test.
        t.context.service.enabled(true);
        t.context.tsNodeUnderTest.register(t.context.service);
        t.context.service.installSourceMapSupport();
    }));
    test('should be able to require typescript', ({ context: { moduleTestPath }, }) => {
        const m = require(moduleTestPath);
        (0, chai_1.expect)(m.example('foo')).to.equal('FOO');
    });
    test('should support dynamically disabling', ({ context: { service, moduleTestPath }, }) => {
        delete require.cache[moduleTestPath];
        (0, chai_1.expect)(service.enabled(false)).to.equal(false);
        (0, chai_1.expect)(() => require(moduleTestPath)).to.throw(/Unexpected token/);
        delete require.cache[moduleTestPath];
        (0, chai_1.expect)(service.enabled()).to.equal(false);
        (0, chai_1.expect)(() => require(moduleTestPath)).to.throw(/Unexpected token/);
        delete require.cache[moduleTestPath];
        (0, chai_1.expect)(service.enabled(true)).to.equal(true);
        (0, chai_1.expect)(() => require(moduleTestPath)).to.not.throw();
        delete require.cache[moduleTestPath];
        (0, chai_1.expect)(service.enabled()).to.equal(true);
        (0, chai_1.expect)(() => require(moduleTestPath)).to.not.throw();
    });
    test('should compile through js and ts', () => {
        const m = require('../../tests/complex');
        (0, chai_1.expect)(m.example()).to.equal('example');
    });
    test('should work with proxyquire', () => {
        const m = proxyquire('../../tests/complex', {
            './example': 'hello',
        });
        (0, chai_1.expect)(m.example()).to.equal('hello');
    });
    test('should work with `require.cache`', () => {
        const { example1, example2 } = require('../../tests/require-cache');
        (0, chai_1.expect)(example1).to.not.equal(example2);
    });
    test('should use source maps', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            require('../../tests/throw error');
        }
        catch (error) {
            exp(error.stack).toMatch([
                'Error: this is a demo',
                `    at Foo.bar (${(0, path_1.join)(helpers_1.TEST_DIR, './throw error.ts')}:100:17)`,
            ].join('\n'));
        }
    }));
    test.suite('JSX preserve', (test) => {
        let compiled;
        test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            const old = require.extensions['.tsx'];
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
            try {
                require('../../tests/with-jsx.tsx');
            }
            catch (error) {
                (0, chai_1.expect)(error.stack).to.contain('SyntaxError: Unexpected token');
            }
            (0, chai_1.expect)(compiled).to.match(SOURCE_MAP_REGEXP);
        }));
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
        (0, chai_1.expect)(require('../../tests/scope/a').ext).to.equal('.ts');
        (0, chai_1.expect)(require('../../tests/scope/b').ext).to.equal('.ts');
    }
    finally {
        compilers.forEach((c) => c.enabled(false));
    }
    (0, chai_1.expect)(calls).to.deep.equal([
        (0, path_1.join)(helpers_1.TEST_DIR, 'scope/a/index.ts'),
        (0, path_1.join)(helpers_1.TEST_DIR, 'scope/b/index.ts'),
    ]);
    delete require.cache[moduleTestPath];
    (0, chai_1.expect)(() => require(moduleTestPath)).to.throw();
});
//# sourceMappingURL=register.spec.js.map