"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctxTmpDir = exports.ctxTmpDirOutsideCheckout = void 0;
const os_1 = require("os");
const fs_fixture_builder_1 = require("@TypeStrong/fs-fixture-builder");
/**
 * This helpers gives you an empty directory in the OS temp directory, *outside*
 * of the git clone.
 *
 * Some tests must run in a directory that is *outside* of the git clone.
 * When TS and ts-node search for a tsconfig, they traverse up the filesystem.
 * If they run inside our git clone, they will find the root tsconfig.json, and
 * we do not always want that.
 */
async function ctxTmpDirOutsideCheckout(t) {
    const fixture = (0, fs_fixture_builder_1.tempdirProject)({
        name: 'ts-node-spec',
        rootDir: (0, os_1.tmpdir)(),
    });
    return {
        tmpDir: fixture.cwd,
        fixture,
    };
}
exports.ctxTmpDirOutsideCheckout = ctxTmpDirOutsideCheckout;
async function ctxTmpDir(t) {
    const fixture = (0, fs_fixture_builder_1.tempdirProject)('ts-node-spec');
    return {
        fixture,
        tmpDir: fixture.cwd,
    };
}
exports.ctxTmpDir = ctxTmpDir;
//# sourceMappingURL=ctx-tmp-dir.js.map