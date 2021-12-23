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
exports.createExecTester = exports.createExec = void 0;
const child_process_1 = require("child_process");
const expect = require("expect");
function createExec(preBoundOptions) {
    /**
     * Helper to exec a child process.
     * Returns a Promise and a reference to the child process to suite multiple situations.
     * Promise resolves with the process's stdout, stderr, and error.
     */
    return function exec(cmd, opts) {
        let child;
        return Object.assign(new Promise((resolve, reject) => {
            child = (0, child_process_1.exec)(cmd, Object.assign(Object.assign({}, preBoundOptions), opts), (err, stdout, stderr) => {
                resolve({ err, stdout, stderr, child });
            });
        }), {
            child,
        });
    };
}
exports.createExec = createExec;
const defaultExec = createExec();
/**
 * Create a function that launches a CLI command, optionally pipes stdin, optionally sets env vars,
 * optionally runs a couple baked-in assertions, and returns the results for additional assertions.
 */
function createExecTester(preBoundOptions) {
    return function (options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cmd, flags = '', stdin, expectError = false, env, exec = defaultExec, } = Object.assign(Object.assign({}, preBoundOptions), options);
            const execPromise = exec(`${cmd} ${flags}`, {
                env: Object.assign(Object.assign({}, process.env), env),
            });
            if (stdin !== undefined) {
                execPromise.child.stdin.end(stdin);
            }
            const { err, stdout, stderr } = yield execPromise;
            if (expectError) {
                expect(err).toBeDefined();
            }
            else {
                expect(err).toBeNull();
            }
            return { stdout, stderr, err };
        });
    };
}
exports.createExecTester = createExecTester;
//# sourceMappingURL=exec-helpers.js.map