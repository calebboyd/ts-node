import type { ctxRepl, ExecuteInReplOptions } from './ctx-repl';
export declare const macroReplNoErrorsAndStdoutContains: import("@cspotcode/ava-lib").Macro<[script: string, contains: string, options?: Partial<ExecuteInReplOptions> | undefined], ctxRepl.Ctx>;
export declare const macroReplStderrContains: import("@cspotcode/ava-lib").Macro<[script: string, errorContains: string, options?: Partial<ExecuteInReplOptions> | undefined], ctxRepl.Ctx>;
