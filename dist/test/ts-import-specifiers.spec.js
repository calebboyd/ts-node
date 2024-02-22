"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlib_1 = require("./testlib");
const expect = require("expect");
const exec_1 = require("./helpers/exec");
const helpers_1 = require("./helpers");
const fs_fixture_builder_1 = require("@TypeStrong/fs-fixture-builder");
const outdent_1 = require("outdent");
const exec = (0, exec_1.createExec)({
    cwd: helpers_1.TEST_DIR,
});
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test('Supports .ts extensions in import specifiers with typechecking, even though older versions of TS checker do not', async () => {
    const p = (0, fs_fixture_builder_1.project)('ts-import-specifiers');
    p.rm();
    p.addFile('index.ts', (0, outdent_1.outdent) `
    import { foo } from './foo.ts';
    import { bar } from './bar.jsx';
    console.log({ foo, bar });
  `);
    p.addFile('foo.ts', (0, outdent_1.outdent) `
    export const foo = true;
  `);
    p.addFile('bar.tsx', (0, outdent_1.outdent) `
    export const bar = true;
  `);
    p.addJsonFile('tsconfig.json', {
        'ts-node': {
            // Can eventually make this a stable feature.  For now, `experimental` flag allows me to iterate quickly
            experimentalTsImportSpecifiers: true,
            experimentalResolver: true,
        },
        compilerOptions: {
            jsx: 'react',
            allowImportingTsExtensions: helpers_1.tsSupportsAllowImportingTsExtensions ? true : undefined,
        },
    });
    p.write();
    const r = await exec(`${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} ./index.ts`, {
        cwd: p.cwd,
    });
    expect(r.err).toBe(null);
    expect(r.stdout.trim()).toBe('{ foo: true, bar: true }');
});
//# sourceMappingURL=ts-import-specifiers.spec.js.map