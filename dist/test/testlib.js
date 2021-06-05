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
exports.test = void 0;
const ava_1 = require("ava");
const assert = require("assert");
const throat_1 = require("throat");
const concurrencyLimiter = throat_1.default(8);
function once(func) {
    let run = false;
    let ret = undefined;
    return function (...args) {
        if (run)
            return ret;
        run = true;
        ret = func(...args);
        return ret;
    };
}
exports.test = createTestInterface({
    beforeEachFunctions: [],
    mustDoSerial: false,
    automaticallyDoSerial: false,
    separator: ' > ',
    titlePrefix: undefined,
});
function createTestInterface(opts) {
    var _a;
    const { titlePrefix, separator = ' > ' } = opts;
    const beforeEachFunctions = [...((_a = opts.beforeEachFunctions) !== null && _a !== void 0 ? _a : [])];
    let { mustDoSerial, automaticallyDoSerial } = opts;
    let hookDeclared = false;
    let suiteOrTestDeclared = false;
    function computeTitle(title) {
        assert(title);
        // return `${ titlePrefix }${ separator }${ title }`;
        if (titlePrefix != null && title != null) {
            return `${titlePrefix}${separator}${title}`;
        }
        if (titlePrefix == null && title != null) {
            return title;
        }
    }
    function parseArgs(args) {
        const title = typeof args[0] === 'string' ? args.shift() : undefined;
        const macros = typeof args[0] === 'function'
            ? [args.shift()]
            : Array.isArray(args[0])
                ? args.shift()
                : [];
        return { title, macros, args };
    }
    function assertOrderingForDeclaringTest() {
        suiteOrTestDeclared = true;
    }
    function assertOrderingForDeclaringHook() {
        if (suiteOrTestDeclared) {
            throw new Error('Hooks must be declared before declaring sub-suites or tests');
        }
        hookDeclared = true;
    }
    /**
     * @param avaDeclareFunction either test or test.serial
     */
    function declareTest(title, macros, avaDeclareFunction, args) {
        const wrappedMacros = macros.map((macro) => {
            return function (t, ...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    return concurrencyLimiter(() => __awaiter(this, void 0, void 0, function* () {
                        let i = 0;
                        for (const func of beforeEachFunctions) {
                            yield func(t);
                            i++;
                        }
                        return macro(t, ...args);
                    }));
                });
            };
        });
        const computedTitle = computeTitle(title);
        avaDeclareFunction(computedTitle, wrappedMacros, ...args);
    }
    function test(...inputArgs) {
        assertOrderingForDeclaringTest();
        // TODO is this safe to disable?
        // X parallel tests will each invoke the beforeAll hook, but once()ification means each invocation will return the same promise, and tests cannot
        // start till it finishes.
        // HOWEVER if it returns a single shared state, can tests concurrently use this shared state?
        // if(!automaticallyDoSerial && mustDoSerial) throw new Error('Cannot declare non-serial tests because you have declared a beforeAll() hook for this test suite.');
        const { args, macros, title } = parseArgs(inputArgs);
        return declareTest(title, macros, automaticallyDoSerial ? ava_1.default.serial : ava_1.default, args);
    }
    test.serial = function (...inputArgs) {
        assertOrderingForDeclaringTest();
        const { args, macros, title } = parseArgs(inputArgs);
        return declareTest(title, macros, ava_1.default.serial, args);
    };
    test.beforeEach = function (cb) {
        assertOrderingForDeclaringHook();
        beforeEachFunctions.push(cb);
    };
    test.context = function (cb) {
        assertOrderingForDeclaringHook();
        beforeEachFunctions.push((t) => __awaiter(this, void 0, void 0, function* () {
            const addedContextFields = yield cb(t);
            Object.assign(t.context, addedContextFields);
        }));
        return test;
    };
    test.beforeAll = function (cb) {
        assertOrderingForDeclaringHook();
        mustDoSerial = true;
        beforeEachFunctions.push(once(cb));
    };
    test.macro = function (cb) {
        function macro(testInterface, ...args) {
            const ret = cb(...args);
            const macroFunction = Array.isArray(ret) ? ret[1] : ret;
            return macroFunction(testInterface);
        }
        macro.title = function (givenTitle, ...args) {
            const ret = cb(...args);
            return Array.isArray(ret) ? ret[0](givenTitle) : givenTitle;
        };
        return macro;
    };
    test.suite = function (title, cb) {
        const newApi = createTestInterface({
            mustDoSerial,
            automaticallyDoSerial,
            separator,
            titlePrefix: computeTitle(title),
            beforeEachFunctions,
        });
        cb(newApi);
    };
    test.runSerially = function () {
        automaticallyDoSerial = true;
    };
    return test;
}
//# sourceMappingURL=testlib.js.map