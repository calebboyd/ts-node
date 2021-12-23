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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextReplHelpers = void 0;
const promisify = require("util.promisify");
const stream_1 = require("stream");
const helpers_1 = require("../helpers");
/**
 * pass to test.context() to get REPL testing helper functions
 */
function contextReplHelpers(t) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tsNodeUnderTest } = t.context;
        return { createReplViaApi, executeInRepl };
        function createReplViaApi({ registerHooks, createReplOpts, createServiceOpts, }) {
            const stdin = new stream_1.PassThrough();
            const stdout = new stream_1.PassThrough();
            const stderr = new stream_1.PassThrough();
            const replService = tsNodeUnderTest.createRepl(Object.assign({ stdin,
                stdout,
                stderr }, createReplOpts));
            const service = (registerHooks
                ? tsNodeUnderTest.register
                : tsNodeUnderTest.create)(Object.assign(Object.assign(Object.assign(Object.assign({}, replService.evalAwarePartialHost), { project: `${helpers_1.TEST_DIR}/tsconfig.json` }), createServiceOpts), { tsTrace: replService.console.log.bind(replService.console) }));
            replService.setService(service);
            t.teardown(() => __awaiter(this, void 0, void 0, function* () {
                service.enabled(false);
            }));
            return { stdin, stdout, stderr, replService, service };
        }
        // Todo combine with replApiMacro
        function executeInRepl(input, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { waitPattern, 
                // Wait longer if there's a signal to end it early
                waitMs = waitPattern != null ? 20e3 : 1e3, startInternalOptions } = options, rest = __rest(options, ["waitPattern", "waitMs", "startInternalOptions"]);
                const { stdin, stdout, stderr, replService } = createReplViaApi(rest);
                if (startInternalOptions) {
                    replService.startInternal(startInternalOptions);
                }
                else {
                    replService.start();
                }
                stdin.write(input);
                stdin.end();
                const stdoutPromise = (0, helpers_1.getStream)(stdout, waitPattern);
                const stderrPromise = (0, helpers_1.getStream)(stderr, waitPattern);
                // Wait for expected output pattern or timeout, whichever comes first
                yield Promise.race([
                    promisify(setTimeout)(waitMs),
                    stdoutPromise,
                    stderrPromise,
                ]);
                stdout.end();
                stderr.end();
                return {
                    stdin,
                    stdout: yield stdoutPromise,
                    stderr: yield stderrPromise,
                };
            });
        }
    });
}
exports.contextReplHelpers = contextReplHelpers;
//# sourceMappingURL=helpers.js.map