/// <reference types="node" />
import type { ChildProcess, ExecException, ExecOptions } from 'child_process';
export declare type ExecReturn = Promise<ExecResult> & {
    child: ChildProcess;
};
export interface ExecResult {
    stdout: string;
    stderr: string;
    err: null | ExecException;
    child: ChildProcess;
}
export declare function createExec<T extends Partial<ExecOptions>>(preBoundOptions?: T): (cmd: string, opts?: (Pick<ExecOptions, Exclude<"cwd", keyof T> | Exclude<"shell", keyof T> | Exclude<"maxBuffer", keyof T> | Exclude<"killSignal", keyof T> | Exclude<"windowsHide", keyof T> | Exclude<"timeout", keyof T> | Exclude<"uid", keyof T> | Exclude<"gid", keyof T> | Exclude<"env", keyof T>> & Partial<Pick<ExecOptions, keyof T & keyof ExecOptions>>) | undefined) => ExecReturn;
declare const defaultExec: (cmd: string, opts?: (Pick<ExecOptions, never> & Partial<Pick<ExecOptions, keyof ExecOptions>>) | undefined) => ExecReturn;
export interface ExecTesterOptions {
    cmd: string;
    flags?: string;
    env?: Record<string, string>;
    stdin?: string;
    expectError?: boolean;
    exec?: typeof defaultExec;
}
/**
 * Create a function that launches a CLI command, optionally pipes stdin, optionally sets env vars,
 * optionally runs a couple baked-in assertions, and returns the results for additional assertions.
 */
export declare function createExecTester<T extends Partial<ExecTesterOptions>>(preBoundOptions: T): (options: Pick<ExecTesterOptions, Exclude<keyof ExecTesterOptions, keyof T>> & Partial<Pick<ExecTesterOptions, keyof T & keyof ExecTesterOptions>>) => Promise<{
    stdout: string;
    stderr: string;
    err: ExecException | null;
}>;
export {};
