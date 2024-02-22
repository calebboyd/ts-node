"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsSupportsLibEs2023 = exports.tsSupportsEs2022 = exports.tsSupportsEs2021 = exports.tsSupportsVerbatimModuleSyntax = exports.tsSupportsExtendsArray = exports.tsSupportsAllowImportingTsExtensions = exports.tsSupportsReact17JsxFactories = exports.tsSupportsImportAssertions = exports.tsSupportsMtsCtsExtensions = exports.tsSupportsStableNodeNextNode16 = exports.nodeSupportsImportingTransformedCjsFromEsm = exports.nodeSupportsUnflaggedJsonImports = exports.nodeSupportsImportAssertions = exports.nodeUsesNewHooksApi = void 0;
const semver = require("semver");
const misc_1 = require("./misc");
// Version checks, used to conditionally enable tests.
exports.nodeUsesNewHooksApi = semver.gte(process.version, '16.12.0');
// 16.14.0: https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V16.md#notable-changes-4
// 17.1.0: https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V17.md#2021-11-09-version-1710-current-targos
exports.nodeSupportsImportAssertions = (semver.gte(process.version, '16.14.0') && semver.lt(process.version, '17.0.0')) ||
    semver.gte(process.version, '17.1.0');
// These versions do not require `--experimental-json-modules`
// 16.15.0: https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V16.md#2022-04-26-version-16150-gallium-lts-danielleadams
// 17.5.0: https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V17.md#2022-02-10-version-1750-current-ruyadorno
exports.nodeSupportsUnflaggedJsonImports = (semver.gte(process.version, '16.15.0') && semver.lt(process.version, '17.0.0')) ||
    semver.gte(process.version, '17.5.0');
// Node 14.13.0 has a bug where it tries to lex CJS files to discover named exports *before*
// we transform the code.
// In other words, it tries to parse raw TS as CJS and balks at `export const foo =`, expecting to see `exports.foo =`
// This lexing only happens when CJS TS is imported from the ESM loader.
exports.nodeSupportsImportingTransformedCjsFromEsm = semver.gte(process.version, '14.13.1');
/** Supports module:nodenext and module:node16 as *stable* features */
exports.tsSupportsStableNodeNextNode16 = misc_1.ts.version.startsWith('4.7.') || semver.gte(misc_1.ts.version, '4.7.0');
// TS 4.5 is first version to understand .cts, .mts, .cjs, and .mjs extensions
exports.tsSupportsMtsCtsExtensions = semver.gte(misc_1.ts.version, '4.5.0');
exports.tsSupportsImportAssertions = semver.gte(misc_1.ts.version, '4.5.0');
// TS 4.1 added jsx=react-jsx and react-jsxdev: https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#react-17-jsx-factories
exports.tsSupportsReact17JsxFactories = semver.gte(misc_1.ts.version, '4.1.0');
// TS 5.0 added "allowImportingTsExtensions"
exports.tsSupportsAllowImportingTsExtensions = semver.gte(misc_1.ts.version, '4.999.999');
// TS 5.0 adds ability for tsconfig to `"extends": []` an array of configs
exports.tsSupportsExtendsArray = semver.gte(misc_1.ts.version, '4.999.999');
// TS 5.0 adds verbatimModuleSyntax
exports.tsSupportsVerbatimModuleSyntax = semver.gte(misc_1.ts.version, '5.0.0');
// Relevant when @tsconfig/bases refers to es2021 and we run tests against
// old TS versions.
exports.tsSupportsEs2021 = semver.gte(misc_1.ts.version, '4.3.0');
exports.tsSupportsEs2022 = semver.gte(misc_1.ts.version, '4.6.0');
exports.tsSupportsLibEs2023 = semver.gte(misc_1.ts.version, '5.0.0');
//# sourceMappingURL=version-checks.js.map