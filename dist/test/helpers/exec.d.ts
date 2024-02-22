/// <reference types="node" />
import type { ChildProcess, ExecException, ExecOptions, SpawnOptions } from 'child_process';
import { ExpectStream } from '@cspotcode/expect-stream';
export declare type ExecReturn = Promise<ExecResult> & {
    child: ChildProcess;
};
export interface ExecResult {
    stdout: string;
    stderr: string;
    err: null | ExecException;
    child: ChildProcess;
}
export declare function createExec<T extends Partial<ExecOptions>>(preBoundOptions?: T): (cmd: string, opts?: Pick<ExecOptions, Exclude<keyof ExecOptions, keyof T>> & Partial<Pick<ExecOptions, keyof T & keyof ExecOptions>>) => ExecReturn;
export declare type SpawnReturn = Promise<SpawnResult> & SpawnResult;
export interface SpawnResult {
    stdout: ExpectStream;
    stderr: ExpectStream;
    code: number | null;
    child: ChildProcess;
}
export declare function createSpawn<T extends Partial<SpawnOptions>>(preBoundOptions?: T): (cmd: string[], opts?: Pick<SpawnOptions, Exclude<keyof SpawnOptions, keyof T>> & Partial<Pick<SpawnOptions, keyof T & keyof SpawnOptions>>) => SpawnReturn;
declare const defaultExec: (cmd: string, opts?: (Pick<ExecOptions, never> & Partial<Pick<ExecOptions, keyof ExecOptions>>) | undefined) => ExecReturn;
export { defaultExec as exec };
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
export declare function createExecTester<T extends Partial<ExecTesterOptions>>(preBoundOptions: T): (options: Pick<ExecTesterOptions, Exclude<keyof ExecTesterOptions, keyof T>> & Partial<Pick<ExecTesterOptions, keyof T & keyof ExecTesterOptions>>) => Promise<ExecResult>;
