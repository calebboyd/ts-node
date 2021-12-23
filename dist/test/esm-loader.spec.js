"use strict";
// ESM loader hook tests
// TODO: at the time of writing, other ESM loader hook tests have not been moved into this file.
// Should consolidate them here.
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
const semver = require("semver");
const helpers_1 = require("./helpers");
const exec_helpers_1 = require("./exec-helpers");
const path_1 = require("path");
const expect = require("expect");
const nodeUsesNewHooksApi = semver.gte(process.version, '16.12.0');
const test = (0, testlib_1.context)(helpers_1.contextTsNodeUnderTest);
const exec = (0, exec_helpers_1.createExec)({
    cwd: helpers_1.TEST_DIR,
});
test.suite('createEsmHooks', (test) => {
    if (semver.gte(process.version, '12.16.0')) {
        test('should create proper hooks with provided instance', () => __awaiter(void 0, void 0, void 0, function* () {
            const { err } = yield exec(`node ${helpers_1.EXPERIMENTAL_MODULES_FLAG} --loader ./loader.mjs index.ts`, {
                cwd: (0, path_1.join)(helpers_1.TEST_DIR, './esm-custom-loader'),
            });
            if (err === null) {
                throw new Error('Command was expected to fail, but it succeeded.');
            }
            expect(err.message).toMatch(/TS6133:\s+'unusedVar'/);
        }));
    }
});
test.suite('hooks', (_test) => {
    const test = _test.context((t) => __awaiter(void 0, void 0, void 0, function* () {
        const service = t.context.tsNodeUnderTest.create({
            cwd: helpers_1.TEST_DIR,
        });
        t.teardown(() => {
            (0, helpers_1.resetNodeEnvironment)();
        });
        return {
            service,
            hooks: t.context.tsNodeUnderTest.createEsmHooks(service),
        };
    }));
    if (nodeUsesNewHooksApi) {
        test('Correctly determines format of data URIs', (t) => __awaiter(void 0, void 0, void 0, function* () {
            const { hooks } = t.context;
            const url = 'data:text/javascript,console.log("hello world");';
            const result = yield hooks.load(url, { format: undefined }, (url, context, _ignored) => __awaiter(void 0, void 0, void 0, function* () {
                return { format: context.format, source: '' };
            }));
            expect(result.format).toBe('module');
        }));
    }
});
//# sourceMappingURL=esm-loader.spec.js.map