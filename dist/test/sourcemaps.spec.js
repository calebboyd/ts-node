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
const expect = require("expect");
const exec_helpers_1 = require("./exec-helpers");
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const test = testlib_1.test.context(helpers_1.contextTsNodeUnderTest);
const exec = (0, exec_helpers_1.createExecTester)({
    cmd: helpers_1.CMD_TS_NODE_WITH_PROJECT_FLAG,
    exec: (0, exec_helpers_1.createExec)({
        cwd: helpers_1.TEST_DIR,
    }),
});
test('Redirects source-map-support to @cspotcode/source-map-support so that third-party libraries get correct source-mapped locations', () => __awaiter(void 0, void 0, void 0, function* () {
    const { stdout } = yield exec({
        flags: `./legacy-source-map-support-interop/index.ts`,
    });
    expect(stdout.split('\n')).toMatchObject([
        expect.stringContaining('.ts:2 '),
        'true',
        'true',
        expect.stringContaining('.ts:100:'),
        expect.stringContaining('.ts:101 '),
        '',
    ]);
}));
//# sourceMappingURL=sourcemaps.spec.js.map