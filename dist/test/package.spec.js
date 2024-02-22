"use strict";
// Verify the shape of the published tarball:
// valid import specifiers
// CLI commands on PATH
// named exports
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test('should export the correct version', (t) => {
    (0, testlib_1.expect)(t.context.tsNodeUnderTest.VERSION).toBe(require('../../package.json').version);
});
test('should export all CJS entrypoints', () => {
    // Ensure our package.json "exports" declaration allows `require()`ing all our entrypoints
    // https://github.com/TypeStrong/ts-node/pull/1026
    helpers_1.testsDirRequire.resolve('ts-node');
    // only reliably way to ask node for the root path of a dependency is Path.resolve(require.resolve('ts-node/package'), '..')
    helpers_1.testsDirRequire.resolve('ts-node/package');
    helpers_1.testsDirRequire.resolve('ts-node/package.json');
    // All bin entrypoints for people who need to augment our CLI: `node -r otherstuff ./node_modules/ts-node/dist/bin`
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin.js');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin-transpile');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin-transpile.js');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin-script');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin-script.js');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin-cwd');
    helpers_1.testsDirRequire.resolve('ts-node/dist/bin-cwd.js');
    // Must be `require()`able obviously
    helpers_1.testsDirRequire.resolve('ts-node/register');
    helpers_1.testsDirRequire.resolve('ts-node/register/files');
    helpers_1.testsDirRequire.resolve('ts-node/register/transpile-only');
    helpers_1.testsDirRequire.resolve('ts-node/register/type-check');
    // `node --loader ts-node/esm`
    helpers_1.testsDirRequire.resolve('ts-node/esm');
    helpers_1.testsDirRequire.resolve('ts-node/esm.mjs');
    helpers_1.testsDirRequire.resolve('ts-node/esm/transpile-only');
    helpers_1.testsDirRequire.resolve('ts-node/esm/transpile-only.mjs');
    helpers_1.testsDirRequire.resolve('ts-node/transpilers/swc');
    helpers_1.testsDirRequire.resolve('ts-node/transpilers/swc-experimental');
    helpers_1.testsDirRequire.resolve('ts-node/node14/tsconfig.json');
    helpers_1.testsDirRequire.resolve('ts-node/node16/tsconfig.json');
    helpers_1.testsDirRequire.resolve('ts-node/node18/tsconfig.json');
    helpers_1.testsDirRequire.resolve('ts-node/node20/tsconfig.json');
});
//# sourceMappingURL=package.spec.js.map