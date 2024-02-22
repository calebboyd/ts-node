"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installTsNode = exports.ctxTsNode = void 0;
const child_process_1 = require("child_process");
const proper_lockfile_1 = require("proper-lockfile");
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf_1 = require("rimraf");
const paths_1 = require("./paths");
const misc_1 = require("./misc");
/** Pass to `test.context()` to get access to the ts-node API under test */
async function ctxTsNode() {
    await installTsNode();
    const tsNodeUnderTest = (0, misc_1.testsDirRequire)('ts-node');
    return {
        tsNodeUnderTest,
    };
}
exports.ctxTsNode = ctxTsNode;
const ts_node_install_lock = process.env.ts_node_install_lock;
const lockPath = (0, path_1.join)(__dirname, ts_node_install_lock);
/**
 * Pack and install ts-node locally, necessary to test package "exports"
 * FS locking b/c tests run in separate processes
 */
async function installTsNode() {
    await lockedMemoizedOperation(lockPath, async () => {
        const totalTries = process.platform === 'win32' ? 5 : 1;
        let tries = 0;
        while (true) {
            try {
                (0, rimraf_1.sync)((0, path_1.join)(paths_1.TEST_DIR, '.yarn/cache/ts-node-file-*'));
                (0, fs_1.writeFileSync)((0, path_1.join)(paths_1.TEST_DIR, 'yarn.lock'), '');
                const result = await (0, util_1.promisify)(child_process_1.exec)(`yarn --no-immutable`, {
                    cwd: paths_1.TEST_DIR,
                });
                // You can uncomment this to aid debugging
                // console.log(result.stdout, result.stderr);
                (0, rimraf_1.sync)((0, path_1.join)(paths_1.TEST_DIR, '.yarn/cache/ts-node-file-*'));
                (0, fs_1.writeFileSync)((0, path_1.join)(paths_1.TEST_DIR, 'yarn.lock'), '');
                break;
            }
            catch (e) {
                tries++;
                if (tries >= totalTries)
                    throw e;
            }
        }
    });
}
exports.installTsNode = installTsNode;
/**
 * Attempt an operation once across multiple processes, using filesystem locking.
 * If it was executed already by another process, and it errored, throw the same error message.
 */
async function lockedMemoizedOperation(lockPath, operation) {
    const releaseLock = await (0, proper_lockfile_1.lock)(lockPath, {
        realpath: false,
        stale: 120e3,
        retries: {
            retries: 120,
            maxTimeout: 1000,
        },
    });
    try {
        const operationHappened = (0, fs_1.existsSync)(lockPath);
        if (operationHappened) {
            const result = JSON.parse((0, fs_1.readFileSync)(lockPath, 'utf8'));
            if (result.error)
                throw result.error;
        }
        else {
            const result = { error: null };
            try {
                await operation();
            }
            catch (e) {
                result.error = `${e}`;
                throw e;
            }
            finally {
                (0, fs_1.writeFileSync)(lockPath, JSON.stringify(result));
            }
        }
    }
    finally {
        releaseLock();
    }
}
//# sourceMappingURL=ctx-ts-node.js.map