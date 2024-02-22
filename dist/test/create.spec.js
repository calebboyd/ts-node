"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test.suite('create', ({ contextEach }) => {
    const test = contextEach(async (t) => {
        return {
            service: t.context.tsNodeUnderTest.create({
                compilerOptions: { target: 'es5' },
                skipProject: true,
            }),
        };
    });
    test('should create generic compiler instances', (t) => {
        const output = t.context.service.compile('const x = 10', 'test.ts');
        (0, testlib_1.expect)(output).toMatch('var x = 10;');
    });
    test.suite('should get type information', (test) => {
        test('given position of identifier', (t) => {
            (0, testlib_1.expect)(t.context.service.getTypeInfo('/**jsdoc here*/const x = 10', 'test.ts', 21)).toEqual({
                comment: 'jsdoc here',
                name: 'const x: 10',
            });
        });
        test('given position that does not point to an identifier', (t) => {
            (0, testlib_1.expect)(t.context.service.getTypeInfo('/**jsdoc here*/const x = 10', 'test.ts', 0)).toEqual({
                comment: '',
                name: '',
            });
        });
    });
});
//# sourceMappingURL=create.spec.js.map