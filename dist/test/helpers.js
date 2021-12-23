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
exports.resetNodeEnvironment = exports.getStream = exports.installTsNode = exports.contextTsNodeUnderTest = exports.xfs = exports.ts = exports.testsDirRequire = exports.CMD_ESM_LOADER_WITHOUT_PROJECT = exports.EXPERIMENTAL_MODULES_FLAG = exports.CMD_TS_NODE_WITHOUT_PROJECT_FLAG = exports.CMD_TS_NODE_WITH_PROJECT_FLAG = exports.BIN_CWD_PATH = exports.BIN_SCRIPT_PATH = exports.BIN_PATH = exports.PROJECT = exports.TEST_DIR = exports.DIST_DIR = exports.ROOT_DIR = void 0;
const fslib_1 = require("@yarnpkg/fslib");
const child_process_1 = require("child_process");
const promisify = require("util.promisify");
const rimraf_1 = require("rimraf");
const fs_1 = require("fs");
const path_1 = require("path");
const fs = require("fs");
const proper_lockfile_1 = require("proper-lockfile");
const lodash_1 = require("lodash");
const semver = require("semver");
require("expect");
const createRequire = require('create-require');
exports.ROOT_DIR = (0, path_1.resolve)(__dirname, '../..');
exports.DIST_DIR = (0, path_1.resolve)(__dirname, '..');
exports.TEST_DIR = (0, path_1.join)(__dirname, '../../tests');
exports.PROJECT = (0, path_1.join)(exports.TEST_DIR, 'tsconfig.json');
exports.BIN_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node');
exports.BIN_SCRIPT_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node-script');
exports.BIN_CWD_PATH = (0, path_1.join)(exports.TEST_DIR, 'node_modules/.bin/ts-node-cwd');
/** Default `ts-node --project` invocation */
exports.CMD_TS_NODE_WITH_PROJECT_FLAG = `"${exports.BIN_PATH}" --project "${exports.PROJECT}"`;
/** Default `ts-node` invocation without `--project` */
exports.CMD_TS_NODE_WITHOUT_PROJECT_FLAG = `"${exports.BIN_PATH}"`;
exports.EXPERIMENTAL_MODULES_FLAG = semver.gte(process.version, '12.17.0')
    ? ''
    : '--experimental-modules';
exports.CMD_ESM_LOADER_WITHOUT_PROJECT = `node ${exports.EXPERIMENTAL_MODULES_FLAG} --loader ts-node/esm`;
// `createRequire` does not exist on older node versions
exports.testsDirRequire = createRequire((0, path_1.join)(exports.TEST_DIR, 'index.js'));
exports.ts = (0, exports.testsDirRequire)('typescript');
exports.xfs = new fslib_1.NodeFS(fs);
/** Pass to `test.context()` to get access to the ts-node API under test */
exports.contextTsNodeUnderTest = (0, lodash_1.once)(() => __awaiter(void 0, void 0, void 0, function* () {
    yield installTsNode();
    const tsNodeUnderTest = (0, exports.testsDirRequire)('ts-node');
    return {
        tsNodeUnderTest,
    };
}));
const ts_node_install_lock = process.env.ts_node_install_lock;
const lockPath = (0, path_1.join)(__dirname, ts_node_install_lock);
/**
 * Pack and install ts-node locally, necessary to test package "exports"
 * FS locking b/c tests run in separate processes
 */
function installTsNode() {
    return __awaiter(this, void 0, void 0, function* () {
        yield lockedMemoizedOperation(lockPath, () => __awaiter(this, void 0, void 0, function* () {
            const totalTries = process.platform === 'win32' ? 5 : 1;
            let tries = 0;
            while (true) {
                try {
                    (0, rimraf_1.sync)((0, path_1.join)(exports.TEST_DIR, 'node_modules'));
                    yield promisify(child_process_1.exec)(`npm install`, { cwd: exports.TEST_DIR });
                    const packageLockPath = (0, path_1.join)(exports.TEST_DIR, 'package-lock.json');
                    (0, fs_1.existsSync)(packageLockPath) && (0, fs_1.unlinkSync)(packageLockPath);
                    break;
                }
                catch (e) {
                    tries++;
                    if (tries >= totalTries)
                        throw e;
                }
            }
        }));
    });
}
exports.installTsNode = installTsNode;
/**
 * Attempt an operation once across multiple processes, using filesystem locking.
 * If it was executed already by another process, and it errored, throw the same error message.
 */
function lockedMemoizedOperation(lockPath, operation) {
    return __awaiter(this, void 0, void 0, function* () {
        const releaseLock = yield (0, proper_lockfile_1.lock)(lockPath, {
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
                    yield operation();
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
    });
}
/**
 * Get a stream into a string.
 * Will resolve early if
 */
function getStream(stream, waitForPattern) {
    let resolve;
    const promise = new Promise((res) => {
        resolve = res;
    });
    const received = [];
    let combinedBuffer = Buffer.concat([]);
    let combinedString = '';
    stream.on('data', (data) => {
        received.push(data);
        combine();
        if ((typeof waitForPattern === 'string' &&
            combinedString.indexOf(waitForPattern) >= 0) ||
            (waitForPattern instanceof RegExp && combinedString.match(waitForPattern)))
            resolve(combinedString);
        combinedBuffer = Buffer.concat(received);
    });
    stream.on('end', () => {
        resolve(combinedString);
    });
    return promise;
    function combine() {
        combinedBuffer = Buffer.concat(received);
        combinedString = combinedBuffer.toString('utf8');
    }
}
exports.getStream = getStream;
const defaultRequireExtensions = captureObjectState(require.extensions);
const defaultProcess = captureObjectState(process);
const defaultModule = captureObjectState(require('module'));
const defaultError = captureObjectState(Error);
const defaultGlobal = captureObjectState(global);
/**
 * Undo all of ts-node & co's installed hooks, resetting the node environment to default
 * so we can run multiple test cases which `.register()` ts-node.
 *
 * Must also play nice with `nyc`'s environmental mutations.
 */
function resetNodeEnvironment() {
    // We must uninstall so that it resets its internal state; otherwise it won't know it needs to reinstall in the next test.
    require('@cspotcode/source-map-support').uninstall();
    // Modified by ts-node hooks
    resetObject(require.extensions, defaultRequireExtensions);
    // ts-node attaches a property when it registers an instance
    // source-map-support monkey-patches the emit function
    resetObject(process, defaultProcess);
    // source-map-support swaps out the prepareStackTrace function
    resetObject(Error, defaultError);
    // _resolveFilename is modified by tsconfig-paths, future versions of source-map-support, and maybe future versions of ts-node
    resetObject(require('module'), defaultModule);
    // May be modified by REPL tests, since the REPL sets globals.
    resetObject(global, defaultGlobal);
}
exports.resetNodeEnvironment = resetNodeEnvironment;
function captureObjectState(object) {
    return {
        descriptors: Object.getOwnPropertyDescriptors(object),
        values: Object.assign({}, object),
    };
}
// Redefine all property descriptors and delete any new properties
function resetObject(object, state) {
    const currentDescriptors = Object.getOwnPropertyDescriptors(object);
    for (const key of Object.keys(currentDescriptors)) {
        if (!(0, lodash_1.has)(state.descriptors, key)) {
            delete object[key];
        }
    }
    // Trigger nyc's setter functions
    for (const [key, value] of Object.entries(state.values)) {
        try {
            object[key] = value;
        }
        catch (_a) { }
    }
    // Reset descriptors
    Object.defineProperties(object, state.descriptors);
}
//# sourceMappingURL=helpers.js.map