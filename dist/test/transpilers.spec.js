"use strict";
// third-party transpiler and swc transpiler tests
// TODO: at the time of writing, other transpiler tests have not been moved into this file.
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
const helpers_1 = require("./helpers");
const expect = require("expect");
const test = (0, testlib_1.context)(helpers_1.contextTsNodeUnderTest);
test.suite('swc', (test) => {
    test('verify that TS->SWC target mappings suppport all possible values from both TS and SWC', (t) => __awaiter(void 0, void 0, void 0, function* () {
        const swcTranspiler = (0, helpers_1.testsDirRequire)('ts-node/transpilers/swc-experimental');
        // Detect when mapping is missing any ts.ScriptTargets
        const ts = (0, helpers_1.testsDirRequire)('typescript');
        for (const key of Object.keys(ts.ScriptTarget)) {
            if (/^\d+$/.test(key))
                continue;
            if (key === 'JSON')
                continue;
            expect(swcTranspiler.targetMapping.has(ts.ScriptTarget[key])).toBe(true);
        }
        // Detect when mapping is missing any swc targets
        // Assuming that tests/package.json declares @swc/core: latest
        const swc = (0, helpers_1.testsDirRequire)('@swc/core');
        let msg = undefined;
        try {
            swc.transformSync('', { jsc: { target: 'invalid' } });
        }
        catch (e) {
            msg = e.message;
        }
        expect(msg).toBeDefined();
        // Error looks like:
        // unknown variant `invalid`, expected one of `es3`, `es5`, `es2015`, `es2016`, `es2017`, `es2018`, `es2019`, `es2020`, `es2021` at line 1 column 28
        const match = msg.match(/unknown variant.*, expected one of (.*) at line/);
        expect(match).toBeDefined();
        const targets = match[1].split(', ').map((v) => v.slice(1, -1));
        for (const target of targets) {
            expect([...swcTranspiler.targetMapping.values()]).toContain(target);
        }
    }));
});
//# sourceMappingURL=transpilers.spec.js.map