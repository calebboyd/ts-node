"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctxRepl = void 0;
const expect_stream_1 = require("@cspotcode/expect-stream");
const stream_1 = require("stream");
const misc_1 = require("../../helpers/misc");
const paths_1 = require("../../helpers/paths");
/**
 * pass to test.context() to get REPL testing helper functions
 */
async function ctxRepl(t) {
    const { tsNodeUnderTest } = t.context;
    return { createReplViaApi, executeInRepl };
    function createReplViaApi({ registerHooks, createReplOpts, createServiceOpts }) {
        const stdin = new stream_1.PassThrough();
        const stdout = new stream_1.PassThrough();
        const stderr = new stream_1.PassThrough();
        const replService = tsNodeUnderTest.createRepl({
            stdin,
            stdout,
            stderr,
            ...createReplOpts,
        });
        const service = (registerHooks ? tsNodeUnderTest.register : tsNodeUnderTest.create)({
            ...replService.evalAwarePartialHost,
            project: `${paths_1.TEST_DIR}/tsconfig.json`,
            ...createServiceOpts,
            tsTrace: replService.console.log.bind(replService.console),
        });
        replService.setService(service);
        t.teardown(async () => {
            service.enabled(false);
        });
        return { stdin, stdout, stderr, replService, service };
    }
    async function executeInRepl(input, options) {
        const { waitPattern, 
        // Wait longer if there's a signal to end it early
        waitMs = waitPattern != null ? 20e3 : 1e3, startInternalOptions, ...rest } = options;
        const { stdin, stdout, stderr, replService } = createReplViaApi(rest);
        if (startInternalOptions) {
            replService.startInternal(startInternalOptions);
        }
        else {
            replService.start();
        }
        stdin.write(input);
        stdin.end();
        const stdoutPromise = (0, expect_stream_1.expectStream)(stdout);
        const stderrPromise = (0, expect_stream_1.expectStream)(stderr);
        // Wait for expected output pattern or timeout, whichever comes first
        await Promise.race([
            (0, misc_1.delay)(waitMs),
            waitPattern != null ? stdoutPromise.wait(waitPattern) : stdoutPromise,
            waitPattern != null ? stderrPromise.wait(waitPattern) : stderrPromise,
        ]);
        stdout.end();
        stderr.end();
        return {
            stdin,
            stdout: await stdoutPromise,
            stderr: await stderrPromise,
        };
    }
}
exports.ctxRepl = ctxRepl;
//# sourceMappingURL=ctx-repl.js.map