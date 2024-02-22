"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.macroReplStderrContains = exports.macroReplNoErrorsAndStdoutContains = void 0;
const testlib_1 = require("../../testlib");
exports.macroReplNoErrorsAndStdoutContains = testlib_1.test.macro((script, contains, options) => async (t) => {
    macroReplInternal(t, script, contains, undefined, contains, options);
});
exports.macroReplStderrContains = testlib_1.test.macro((script, errorContains, options) => async (t) => {
    macroReplInternal(t, script, undefined, errorContains, errorContains, options);
});
async function macroReplInternal(t, script, stdoutContains, stderrContains, waitPattern, options) {
    const r = await t.context.executeInRepl(script, {
        registerHooks: true,
        startInternalOptions: { useGlobal: false },
        waitPattern,
        ...options,
    });
    if (stderrContains)
        (0, testlib_1.expect)(r.stderr).toContain(stderrContains);
    else
        (0, testlib_1.expect)(r.stderr).toBe('');
    if (stdoutContains)
        (0, testlib_1.expect)(r.stdout).toContain(stdoutContains);
}
//# sourceMappingURL=macros.js.map