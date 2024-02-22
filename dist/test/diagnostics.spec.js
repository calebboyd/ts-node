"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
require("semver");
require("lodash");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test.suite('TSError diagnostics', ({ context }) => {
    const test = context(async (t) => {
        // Locking to es2020, because:
        // 1) es2022 -- default in @tsconfig/bases for node18 -- changes this diagnostic
        //   to be a composite "No overload matches this call."
        // 2) TS 4.2 doesn't support es2021 or higher
        const service = t.context.tsNodeUnderTest.create({
            compilerOptions: { target: 'es5', lib: ['es2020'] },
            skipProject: true,
        });
        try {
            service.compile('new Error(123)', 'test.ts');
        }
        catch (err) {
            return { err: err };
        }
        return { err: undefined };
    });
    const diagnosticCode = 2345;
    const diagnosticMessage = /Argument of type '.*?' is not assignable to parameter of type 'string( \| undefined)?'./;
    const diagnosticErrorMessage = /TS2345: Argument of type '.*?' is not assignable to parameter of type 'string( \| undefined)?'./;
    test('should throw errors', (t) => {
        const { err } = t.context;
        (0, testlib_1.expect)(err).toBeDefined();
        (0, testlib_1.expect)(err).toMatchObject({
            message: testlib_1.expect.stringMatching(diagnosticErrorMessage),
            diagnosticText: testlib_1.expect.stringMatching(diagnosticErrorMessage),
            diagnosticCodes: [diagnosticCode],
            diagnostics: [
                {
                    code: diagnosticCode,
                    start: 10,
                    length: 3,
                    messageText: testlib_1.expect.stringMatching(diagnosticMessage),
                },
            ],
        });
    });
});
//# sourceMappingURL=diagnostics.spec.js.map