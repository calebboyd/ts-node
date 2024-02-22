"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExecTester = exports.exec = exports.createSpawn = exports.createExec = void 0;
const child_process_1 = require("child_process");
const expect_stream_1 = require("@cspotcode/expect-stream");
const testlib_1 = require("../testlib");
function createExec(preBoundOptions) {
    /**
     * Helper to exec a child process.
     * Returns a Promise and a reference to the child process to suite multiple situations.
     * Promise resolves with the process's stdout, stderr, and error.
     */
    return function exec(cmd, opts) {
        let child;
        return Object.assign(new Promise((resolve, reject) => {
            child = (0, child_process_1.exec)(cmd, {
                ...preBoundOptions,
                ...opts,
            }, (err, stdout, stderr) => {
                resolve({ err, stdout, stderr, child });
            });
        }), {
            child,
        });
    };
}
exports.createExec = createExec;
function createSpawn(preBoundOptions) {
    /**
     * Helper to spawn a child process.
     * Returns a Promise and a reference to the child process to suite multiple situations.
     *
     * Should almost always avoid this helper, and instead use `createExec` / `exec`.  `spawn`
     * may be necessary if you need to avoid `exec`'s intermediate shell.
     */
    return function spawn(cmd, opts) {
        let child;
        let stdout;
        let stderr;
        const promise = Object.assign(new Promise((resolve, reject) => {
            child = (0, child_process_1.spawn)(cmd[0], cmd.slice(1), {
                ...preBoundOptions,
                ...opts,
            });
            stdout = (0, expect_stream_1.expectStream)(child.stdout);
            stderr = (0, expect_stream_1.expectStream)(child.stderr);
            child.on('exit', (code) => {
                promise.code = code;
                resolve({ stdout, stderr, code, child });
            });
            child.on('error', (error) => {
                reject(error);
            });
        }), {
            child,
            stdout,
            stderr,
            code: null,
        });
        return promise;
    };
}
exports.createSpawn = createSpawn;
const defaultExec = createExec();
exports.exec = defaultExec;
/**
 * Create a function that launches a CLI command, optionally pipes stdin, optionally sets env vars,
 * optionally runs a couple baked-in assertions, and returns the results for additional assertions.
 */
function createExecTester(preBoundOptions) {
    return async function (options) {
        const { cmd, flags = '', stdin, expectError = false, env, exec = defaultExec, } = {
            ...preBoundOptions,
            ...options,
        };
        const p = exec(`${cmd} ${flags}`, {
            env: { ...process.env, ...env },
        });
        if (stdin !== undefined) {
            p.child.stdin.end(stdin);
        }
        const r = await p;
        if (expectError) {
            (0, testlib_1.expect)(r.err).toBeDefined();
        }
        else {
            (0, testlib_1.expect)(r.err).toBeNull();
        }
        return r;
    };
}
exports.createExecTester = createExecTester;
//# sourceMappingURL=exec.js.map