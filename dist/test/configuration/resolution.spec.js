"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const helpers_1 = require("../helpers");
const testlib_1 = require("../testlib");
const exec = (0, helpers_1.createExec)({
    cwd: helpers_1.TEST_DIR,
});
const test = (0, testlib_1.context)(helpers_1.ctxTsNode);
test('should locate tsconfig relative to entry-point by default', async () => {
    const r = await exec(`${helpers_1.BIN_PATH} ../a/index`, {
        cwd: (0, path_1.join)(helpers_1.TEST_DIR, 'cwd-and-script-mode/b'),
    });
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toMatch(/plugin-a/);
});
test('should locate tsconfig relative to entry-point via ts-node-script', async () => {
    const r = await exec(`${helpers_1.BIN_SCRIPT_PATH} ../a/index`, {
        cwd: (0, path_1.join)(helpers_1.TEST_DIR, 'cwd-and-script-mode/b'),
    });
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toMatch(/plugin-a/);
});
test('should locate tsconfig relative to entry-point with --script-mode', async () => {
    const r = await exec(`${helpers_1.BIN_PATH} --script-mode ../a/index`, {
        cwd: (0, path_1.join)(helpers_1.TEST_DIR, 'cwd-and-script-mode/b'),
    });
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toMatch(/plugin-a/);
});
test('should locate tsconfig relative to cwd via ts-node-cwd', async () => {
    const r = await exec(`${helpers_1.BIN_CWD_PATH} ../a/index`, {
        cwd: (0, path_1.join)(helpers_1.TEST_DIR, 'cwd-and-script-mode/b'),
    });
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toMatch(/plugin-b/);
});
test('should locate tsconfig relative to cwd in --cwd-mode', async () => {
    const r = await exec(`${helpers_1.BIN_PATH} --cwd-mode ../a/index`, {
        cwd: (0, path_1.join)(helpers_1.TEST_DIR, 'cwd-and-script-mode/b'),
    });
    (0, testlib_1.expect)(r.err).toBe(null);
    (0, testlib_1.expect)(r.stdout).toMatch(/plugin-b/);
});
test('should locate tsconfig relative to realpath, not symlink, when entrypoint is a symlink', async (t) => {
    if ((0, fs_1.lstatSync)((0, path_1.join)(helpers_1.TEST_DIR, 'main-realpath/symlink/symlink.tsx')).isSymbolicLink()) {
        const r = await exec(`${helpers_1.BIN_PATH} main-realpath/symlink/symlink.tsx`);
        (0, testlib_1.expect)(r.err).toBe(null);
        (0, testlib_1.expect)(r.stdout).toBe('');
    }
    else {
        t.log('Skipping');
        return;
    }
});
//# sourceMappingURL=resolution.spec.js.map